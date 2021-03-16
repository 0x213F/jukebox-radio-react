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
      instrument = 'all',
      seekTimeout,
      playbackIntervalIdx = 0,
      cumulativeProgress = 0;
  while(true) {
    const playbackInterval = stream.nowPlaying.playbackIntervals[playbackIntervalIdx],
          playbackIntervalDuration = playbackInterval.endPosition - playbackInterval.startPosition,
          remainingProgress = progress - cumulativeProgress;
    if(remainingProgress < playbackIntervalDuration) {
      progress = playbackInterval.startPosition + remainingProgress;
      instrument = playbackInterval.purpose;
      seekTimeout = playbackInterval.endPosition - progress;
      break;
    }
    playbackIntervalIdx += 1;
    cumulativeProgress += playbackIntervalDuration;
  }

  if(playbackIntervalIdx === stream.nowPlaying.playbackIntervals.length - 1) {
    seekTimeout = undefined;
  }

  return [progress, seekTimeout, instrument];
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


/*
 *
 */
export const updateSpotifyPlayer = function(playback, device_id) {
  playback.spotifyApi.transferMyPlayback([device_id])
}


export const cycleVolumeLevel = function(volumeLevel) {
  const MUTED = 0.00,
        LOW = 0.30,
        HIGH = 0.60,
        FULL = 1.00;
  if(volumeLevel > HIGH) {
    return HIGH;
  } else if(volumeLevel > LOW) {
    return LOW;
  } else if(volumeLevel > MUTED) {
    return MUTED;
  } else {
    return FULL;
  }
}
