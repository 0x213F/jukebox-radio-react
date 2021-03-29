export const getAllIntervals = function(queue) {
  const playbackIntervals = queue?.playbackIntervals,
        allIntervals = [];

  if(!playbackIntervals?.length) {
    return allIntervals;
  }

  let lastVal;
  for(let interval of playbackIntervals) {
    if(lastVal && lastVal !== interval.startPosition) {
      allIntervals.push({
        startPosition: lastVal,
        endPosition: interval.startPosition,
        purpose: "mute",
      });
    }
    allIntervals.push(interval);
    lastVal = interval.endPosition;
  }

  const firstIntervalStart = allIntervals[0].startPosition;
  if(firstIntervalStart !== 0) {
    allIntervals.unshift({
      startPosition: 0,
      endPosition: firstIntervalStart,
      purpose: "mute",
    });
  }

  const lastIntervalEnd = allIntervals[allIntervals.length - 1].endPosition,
        nowPlayingTrackDuration = queue.track.durationMilliseconds;
  if(lastIntervalEnd !== nowPlayingTrackDuration) {
    allIntervals.push({
      startPosition: lastIntervalEnd,
      endPosition: nowPlayingTrackDuration,
      purpose: "mute",
    });
  }

  return allIntervals;
}
