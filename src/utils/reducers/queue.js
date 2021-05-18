import { SERVICE_APPLE_MUSIC } from './../../config/services';

/*
 * A queue object is returned from the server with an assortment of
 * intervals. These intervals must be interpreted on the front-end
 * to put together the full picture - how long is the queue item
 * expected to play for?
 */
export const finalizeQueue = function(queue) {
  const copy = { ...queue };

  // Recursive case: parent node (queue item of format collection)
  if(copy.children.length) {
    const editedChildren = copy.children.map(finalizeQueue),
          totalDurationMilliseconds = editedChildren.reduce((total, q) => (
            total + q.totalDurationMilliseconds
          ), 0);
    copy.children = editedChildren;
    copy.totalDurationMilliseconds = totalDurationMilliseconds;

    if(copy.collection?.service === SERVICE_APPLE_MUSIC) {
      copy.collection.imageUrl = copy.collection.imageUrl.replace("{w}", "300");
      copy.collection.imageUrl = copy.collection.imageUrl.replace("{h}", "300");
    }

    return copy;
  }

  // Some data cleaning that probably shouldn't happen here.
  if(copy.track?.service === SERVICE_APPLE_MUSIC) {
    copy.track.imageUrl = copy.track.imageUrl.replace("{w}", "300");
    copy.track.imageUrl = copy.track.imageUrl.replace("{h}", "300");
  }

  const intervals = copy.intervals,
        markers = copy.markers,
        trackDurationMilliseconds = copy.track?.durationMilliseconds;

  // Base case: no configured intervals
  if(!intervals.length) {
    copy.totalDurationMilliseconds = trackDurationMilliseconds;
    copy.playbackIntervals = [
      {
        startPosition: 0,
        endPosition: trackDurationMilliseconds,
        purpose: "all",
        uuid: null,
      }
    ];
    copy.allIntervals = [
      {
        startPosition: 0,
        endPosition: trackDurationMilliseconds,
        purpose: "all",
        uuid: null,
      }
    ];
    return copy;
  }

  const markerMap = {};
  for(const marker of markers) {
    markerMap[marker.uuid] = marker;
  }

  const allIntervals = [];
  let lastBound;
  for(const interval of intervals) {
    const lowerBound = markerMap[interval.lowerBoundUuid]?.timestampMilliseconds,
          upperBound = markerMap[interval.upperBoundUuid]?.timestampMilliseconds;

    ////////////////////////////////////////////////////////////////////////////
    // TRIMMED
    if(interval.purpose === 'muted') {



      // Trimmed && No LOWER bound
      // Meaning, the beginning of the track is trimmed.
      if(!interval.lowerBoundUuid) {
        allIntervals.push({
          startPosition: 0,
          endPosition: upperBound,
          purpose: "muted",
          uuid: interval.uuid,
        });
        lastBound = upperBound;
        continue;
      }

      // Base case: need to add playback window upfront.
      if(!allIntervals.length) {
        allIntervals.push({
          startPosition: 0,
          endPosition: lowerBound,
          purpose: "all",
          uuid: undefined,
        });
      }

      // Trimmed && No UPPER bound
      // Meaning, the end of the track is trimmed.
      if(!interval.upperBoundUuid) {

        // One more case to consider here...
        // Same concept as the ** below
        if(lastBound && lastBound !== lowerBound) {
          allIntervals.push({
            startPosition: lastBound,
            endPosition: lowerBound,
            purpose: "all",
            uuid: undefined,
          });
        }

        allIntervals.push({
          startPosition: lowerBound || 0,
          endPosition: trackDurationMilliseconds,
          purpose: "muted",
          uuid: interval.uuid,
        });
        lastBound = undefined;
        continue;
      }

      // Trimmed && Mismatched last bound **
      // Meaning, there is an implicit normal playback interval.
      if(lastBound && lastBound !== lowerBound) {
        allIntervals.push({
          startPosition: lastBound,
          endPosition: lowerBound,
          purpose: "all",
          uuid: undefined,
        });
        // NO CONTINUE
      }

      allIntervals.push({
        startPosition: lowerBound,
        endPosition: upperBound,
        purpose: interval.purpose,
        uuid: interval.uuid,
      });

      lastBound = upperBound;
      continue;
    }

    ////////////////////////////////////////////////////////////////////////////
    // STEM SEPERATION

    // No LOWER bound
    // Meaning, the beginning of the track is an implicit normal playback
    // interval.
    if(interval.lowerBound && lowerBound !== 0) {
      allIntervals.push({
        startPosition: 0,
        endPosition: lowerBound,
        purpose: "all",
        uuid: undefined,
      });
    }

    allIntervals.push({
      startPosition: lowerBound || 0,
      endPosition: upperBound || trackDurationMilliseconds,
      purpose: interval.purpose,
      uuid: interval.uuid,
    });

    lastBound = upperBound;
    continue;
  }

  //////////////////////////////////////////////////////////////////////////////
  // LAST BUT NOT LEAST...
  if(lastBound && lastBound !== trackDurationMilliseconds) {
    allIntervals.push({
      startPosition: lastBound,
      endPosition: trackDurationMilliseconds,
      purpose: "all",
      uuid: undefined,
    });
  }

  const playbackIntervals = allIntervals.filter(i => i.purpose !== "muted");

  const totalDurationMilliseconds = playbackIntervals.reduce((total, i) => (
    total + (i.endPosition - i.startPosition)
  ), 0);

  copy.totalDurationMilliseconds = totalDurationMilliseconds;
  copy.playbackIntervals = playbackIntervals;
  copy.allIntervals = allIntervals;

  return copy;
}


/*
 * A queue object is returned from the server with an assortment of
 * intervals. These intervals must be interpreted on the front-end
 * to put together the full picture - how long is the queue item
 * expected to play for?
 */
export const queueListSet = function(state, payload) {
  const lastUpQueues = payload.lastUpQueues.map(finalizeQueue),
        nextUpQueues = payload.nextUpQueues.map(finalizeQueue),
        _lastPlayed = state._lastPlayed;

  // Gotta update the marker map
  const markerMap = { ...state.markerMap };
  for(const queues of [lastUpQueues, nextUpQueues]) {
    for(const queue of queues) {
      for(const marker of queue.markers) {
        if(markerMap[marker.trackUuid] === undefined || markerMap[marker.trackUuid].length === 0) {
          markerMap[marker.trackUuid] = {};
        }
        markerMap[marker.trackUuid][marker.uuid] = marker;
      }
      for(const child of queue.children) {
        for(const marker of child.markers) {
          if(markerMap[marker.trackUuid] === undefined || markerMap[marker.trackUuid].length === 0) {
            markerMap[marker.trackUuid] = {};
          }
          markerMap[marker.trackUuid][marker.uuid] = marker;
        }
      }
    }
  }

  if(_lastPlayed) {
    lastUpQueues.push(_lastPlayed);
  }

  let stream = state.stream;
  if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
    lastUpQueues.push(stream.nowPlaying);
    stream = { ...stream, nowPlaying: undefined }
  }

  const lastUp = (
          !lastUpQueues.length ?
            undefined :
            lastUpQueues[lastUpQueues.length - 1]
        ),
        nextUp = (
          !nextUpQueues.length ? undefined : (
            !nextUpQueues[0].children.length ?
              nextUpQueues[0] :
              nextUpQueues[0].children[0]
          )
        );

  return {
    ...state,
    stream: stream,
    lastUp: lastUp,
    lastUpQueues: lastUpQueues,
    nextUp: nextUp,
    nextUpQueues: nextUpQueues,
    markerMap: markerMap,
  }
}


export const queueDeleteNode = function(state, action) {
  const queues = state.nextUpQueues,
        filteredQueues = queues.filter(i => i.uuid !== action.queueUuid);

  return {
    ...state,
    nextUpQueues: filteredQueues,
  }
}


export const queueDeleteChildNode = function(state, action) {
  let queues = [...state.nextUpQueues];
  const parentIndex = queues.findIndex(i => i.uuid === action.parentUuid),
        children = queues[parentIndex].children,
        filteredChildren = children.filter(i => i.uuid !== action.queueUuid);

  queues[parentIndex].children = filteredChildren;

  if(!filteredChildren.length) {
    queues = queues.filter(i => i.uuid !== action.parentUuid);
  }

  return {
    ...state,
    nextUpQueues: queues,
  }
}
