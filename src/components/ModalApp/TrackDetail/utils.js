export const removeIntervals = function(queue) {
  const duration = queue.track.durationMilliseconds,
        interval = {
          endPosition: duration,
          purpose: "all",
          startPosition: 0,
        },
        intervals = [],
        allIntervals = [interval],
        playbackIntervals = [interval];
  return {
    ...queue,
    intervals: intervals,
    allIntervals: allIntervals,
    playbackIntervals: playbackIntervals,
  }
}
