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

  const intervals = copy.intervals,
        trackDurationMilliseconds = copy.track?.durationMilliseconds;
  if(!intervals.length) {
    copy.totalDurationMilliseconds = trackDurationMilliseconds;
    copy.playbackIntervals = [[0, trackDurationMilliseconds]];
    return copy;
  }

  const playbackIntervals = [];
  let lowerBound,
      upperBound;
  // NOTE: here it is assumed that all intervals are muted.
  for(const interval of intervals) {
    if(!interval.lowerBound) {
      lowerBound = interval.upperBound.timestampMilliseconds;
      continue;
    } else if(!interval.upperBound) {
      if(!lowerBound) {
        lowerBound = 0;
      }
      upperBound = interval.lowerBound.timestampMilliseconds;
      playbackIntervals.push([lowerBound, upperBound]);
      // Setting this value signifies that the playbackIntervals array is
      // finished.
      lowerBound = undefined;
      // This is the end of the interval array anyways. Explicitly break here
      // just for clarity.
      break;
    } else {
      if(!lowerBound) {
        lowerBound = 0;
      }
      upperBound = interval.lowerBound.timestampMilliseconds;
      playbackIntervals.push([lowerBound, upperBound]);
      lowerBound = interval.upperBound.timestampMilliseconds;
      upperBound = undefined;
      continue;
    }
  }

  if(lowerBound) {
    upperBound = trackDurationMilliseconds;
    playbackIntervals.push([lowerBound, upperBound]);
  }

  const totalDurationMilliseconds = playbackIntervals.reduce((total, i) => (
    total + (i[1] - i[0])
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
