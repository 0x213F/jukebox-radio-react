/*
 * This gets the position that the track should be at.
 *
 * @return [
 *   progress: Time in milliseconds,
 *   seekTimeout: Time in milliseconds until the next seek should happen,
 * ]
 */
export const getPositionMilliseconds = function(stream, startedAt) {
  if(!stream.nowPlaying) {
    return [undefined, undefined];
  }

  let progress = Date.now() - startedAt,
      seekTimeout,
      playbackIntervalIdx = 0,
      cumulativeProgress = 0;

  while(true) {
    const playbackInterval = stream.nowPlaying.playbackIntervals[playbackIntervalIdx],
          playbackIntervalDuration = playbackInterval[1] - playbackInterval[0],
          remainingProgress = progress - cumulativeProgress;
    if(remainingProgress < playbackIntervalDuration) {
      progress = playbackInterval[0] + remainingProgress;
      seekTimeout = playbackInterval[1] - progress;
      break;
    }
    playbackIntervalIdx += 1;
    cumulativeProgress += playbackIntervalDuration;
  }

  if(playbackIntervalIdx === stream.nowPlaying.playbackIntervals.length - 1) {
    seekTimeout = undefined;
  }

  return [progress, seekTimeout];
}


/*
 * Get the progress of a stream.
 */
export const getProgress = function(stream) {
  if(stream?.isPaused) {
    return stream.pausedAt - stream.startedAt;
  } else if(stream?.isPlaying) {
    return Date.now() - stream.startedAt;
  } else {
    return undefined;
  }
};
