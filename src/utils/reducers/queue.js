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
    copy.durationMilliseconds = totalDurationMilliseconds;
    return copy;
  }

  const intervals = copy.intervals,
        trackDurationMilliseconds = copy.track.durationMilliseconds;
  if(!intervals.length) {
    copy.durationMilliseconds = trackDurationMilliseconds;
    return copy;
  }

  // Annotate the duration of each interval.
  // Sum up the total muted duration.
  const muteDurationMilliseconds = intervals.reduce((total, i) => {
    if(!i.isMuted) {
      return total;
    }
    if(!i.lowerBound) {
      i.durationMilliseconds = i.upperBound.timestampMilliseconds;
    } else if(!i.upperBound) {
      i.durationMilliseconds = (
        trackDurationMilliseconds -
        i.lowerBound.timestampMilliseconds
      );
    } else {
      i.durationMilliseconds = (
        i.upperBound.timestampMilliseconds -
        i.lowerBound.timestampMilliseconds
      );
    }
    return total + i.durationMilliseconds;
  }, 0);

  copy.durationMilliseconds = trackDurationMilliseconds - muteDurationMilliseconds;
  return copy;
}
