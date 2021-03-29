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
            total + q.durationMilliseconds
          ), 0);
    copy.children = editedChildren;
    copy.totalDurationMilliseconds = totalDurationMilliseconds;
    return copy;
  }

  if(copy.track?.service === SERVICE_APPLE_MUSIC) {
    copy.track.imageUrl = copy.track.imageUrl.replace("{w}", "300");
    copy.track.imageUrl = copy.track.imageUrl.replace("{h}", "300");
  }

  const intervals = copy.intervals,
        trackDurationMilliseconds = copy.track?.durationMilliseconds;
  if(!intervals.length) {
    copy.totalDurationMilliseconds = trackDurationMilliseconds;
    copy.playbackIntervals = [
      {
        startPosition: 0,
        endPosition: trackDurationMilliseconds,
        purpose: "all",
      }
    ];
    return copy;
  }

  const playbackIntervals = [];
  let lowerBound,
      upperBound;
  for(const interval of intervals) {

    // muted
    if(interval.purpose === 'muted') {
      if(!interval.lowerBound) {
        lowerBound = interval.upperBound.timestampMilliseconds;
      } else if(!interval.upperBound) {
        if(!lowerBound) {
          lowerBound = 0;
        }
        upperBound = interval.lowerBound.timestampMilliseconds;
        playbackIntervals.push(
          {
            startPosition: lowerBound,
            endPosition: upperBound,
            purpose: "all",
          }
        );
        // Setting this value signifies that the playbackIntervals array is
        // finished.
        lowerBound = undefined;
      } else {
        if(!lowerBound) {
          lowerBound = 0;
        }
        upperBound = interval.lowerBound.timestampMilliseconds;
        playbackIntervals.push(
          {
            startPosition: lowerBound,
            endPosition: upperBound,
            purpose: "all",
          }
        );
        lowerBound = interval.upperBound.timestampMilliseconds;
        upperBound = undefined;
      }
      continue;
    }

    // stem seperation
    if(!interval.lowerBound) {
      const endPosition = (
        interval.upperBound.timestampMilliseconds ||
        copy.totalDurationMilliseconds
      );
      playbackIntervals.push(
        {
          startPosition: 0,
          endPosition: endPosition,
          purpose: interval.purpose,
        }
      );
      lowerBound = interval.upperBound.timestampMilliseconds;
    } else if(!interval.upperBound) {
      playbackIntervals.push(
        {
          startPosition: interval.lowerBound.timestampMilliseconds,
          endPosition: copy.totalDurationMilliseconds,
          purpose: interval.purpose,
        }
      );
    } else {
      playbackIntervals.push(
        {
          startPosition: interval.lowerBound.timestampMilliseconds,
          endPosition: interval.upperBound.timestampMilliseconds,
          purpose: interval.purpose,
        }
      );
      lowerBound = interval.upperBound.timestampMilliseconds;
    }
  }

  if(lowerBound) {
    upperBound = trackDurationMilliseconds;
    playbackIntervals.push(
      {
        startPosition: lowerBound,
        endPosition: upperBound,
        purpose: "all",
        audioUuid: copy.track?.uuid,
      }
    );
  }

  const totalDurationMilliseconds = playbackIntervals.reduce((total, i) => (
    total + (i.endPosition - i.startPosition)
  ), 0);

  copy.totalDurationMilliseconds = totalDurationMilliseconds;
  copy.playbackIntervals = playbackIntervals;

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
