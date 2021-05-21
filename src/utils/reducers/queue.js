import { SERVICE_APPLE_MUSIC } from './../../config/services';


export const finalizeQueues = function(state, queues) {
  let newState = { ...state };
  for(const queue of queues) {
    newState = finalizeQueue(newState, queue);
  }
  return newState;
}

/*
 * A queue object is returned from the server with an assortment of
 * intervals. These intervals must be interpreted on the front-end
 * to put together the full picture - how long is the queue item
 * expected to play for?
 */
export const finalizeQueue = function(state, queue) {
  const copy = { ...queue },
        newState = { ...state },
        newQueueMap = { ...state.queueMap};

  // Recursive case: parent node (queue item of format collection)
  if(copy.children.length) {
    if(copy.collection?.service === SERVICE_APPLE_MUSIC) {
      copy.collection.imageUrl = copy.collection.imageUrl.replace("{w}", "300");
      copy.collection.imageUrl = copy.collection.imageUrl.replace("{h}", "300");
    }
    newQueueMap[copy.uuid] = copy;
    newState.queueMap = newQueueMap;
    return finalizeQueues(newState, copy.children);
  }

  // Some data cleaning that probably shouldn't happen here.
  if(copy.track?.service === SERVICE_APPLE_MUSIC) {
    copy.track.imageUrl = copy.track.imageUrl.replace("{w}", "300");
    copy.track.imageUrl = copy.track.imageUrl.replace("{h}", "300");
  }

  const intervals = copy.intervals,
        trackDurationMilliseconds = copy.track?.durationMilliseconds;

  // Gotta update the marker map
  const markerMap = { ...state.markerMap };
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
  newState.markerMap = markerMap;

  // Base case: no configured intervals
  if(!intervals.length) {
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
    newQueueMap[copy.uuid] = copy;
    newState.queueMap = newQueueMap;
    return newState;
  }

  const allIntervals = [],
        trackUuid = queue.track.uuid;
  let lastBound;
  for(const interval of intervals) {
    const lowerBound = markerMap[trackUuid][interval.lowerBoundUuid]?.timestampMilliseconds,
          upperBound = markerMap[trackUuid][interval.upperBoundUuid]?.timestampMilliseconds;

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

  copy.playbackIntervals = playbackIntervals;
  copy.allIntervals = allIntervals;

  newQueueMap[copy.uuid] = copy;
  newState.queueMap = newQueueMap;
  return newState;
}


/*
 * A queue object is returned from the server with an assortment of
 * intervals. These intervals must be interpreted on the front-end
 * to put together the full picture - how long is the queue item
 * expected to play for?
 */
export const queueListSet = function(state, payload) {
  let newState = { ...state };
  newState = finalizeQueues(newState, payload.lastUpQueues);
  newState = finalizeQueues(newState, payload.nextUpQueues);

  let lastUpQueues = payload.lastUpQueues.map(o => o.uuid),
      nextUpQueues = payload.nextUpQueues.map(o => o.uuid);


  const _lastPlayed = newState._lastPlayed;

  if(_lastPlayed) {
    lastUpQueues.push(_lastPlayed.uuid);
  }

  let stream = newState.stream;
  if(stream.nowPlaying?.status !== "played" && stream.nowPlaying?.status !== 'paused' && stream.nowPlaying) {
    lastUpQueues.push(stream.nowPlaying.uuid);
    stream = { ...stream, nowPlaying: undefined }
  }

  const lastUpUuid = (
          !lastUpQueues.length ?
            undefined :
            lastUpQueues[lastUpQueues.length - 1]
        ),
        lastUp = newState.queueMap[lastUpUuid],
        nextUp = (
          !nextUpQueues.length ? undefined : (
            !newState.queueMap[nextUpQueues[0]].children.length ?
              newState.queueMap[nextUpQueues[0]] :
              newState.queueMap[nextUpQueues[0]].children[0]
          )
        );

  lastUpQueues = lastUpQueues.map(function(queueUuid) { return newState.queueMap[queueUuid]; });
  nextUpQueues = nextUpQueues.map(function(queueUuid) { return newState.queueMap[queueUuid]; });

  return {
    ...newState,
    stream: stream,
    lastUp: lastUp,
    lastUpQueues: lastUpQueues,
    nextUp: nextUp,
    nextUpQueues: nextUpQueues,
    queueMap: newState.queueMap,
  }
}

export const queueUpdate = function(state, action) {
  const newState = finalizeQueues(state, action.queues);

  const nextUpQueues = newState.nextUpQueues.map(queue => newState.queueMap[queue.uuid]),
        nextUp = newState.queueMap[newState.nextUp.uuid];

  return {
    ...newState,
    nextUp: nextUp,
    nextUpQueues: nextUpQueues,
    stream: {
      ...newState.stream,
      nowPlaying: newState.queueMap[newState.stream.nowPlaying.uuid]
    }
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
