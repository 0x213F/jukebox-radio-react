/*
 * This gets the position that the track should be at.
 *
 * @return [
 *   progress: Time in milliseconds,
 *   seekTimeout: Time in milliseconds until the next seek should happen,
 * ]
 */
export const getPositionMilliseconds = function(queue, startedAt) {
  if(!queue) {
    return [undefined, undefined];
  }

  let progress = getProgress(queue);

  let instrument = 'all',
      seekTimeout,
      playbackIntervalIdx = 0,
      cumulativeProgress = 0;
  while(true) {
    const playbackInterval = queue.playbackIntervals[playbackIntervalIdx],
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

  if(playbackIntervalIdx === queue.playbackIntervals.length - 1) {
    seekTimeout = undefined;
  }

  return [progress, seekTimeout, instrument];
}


export const getProgressMilliseconds = function(queue, position) {
  if(!queue) {
    return undefined;
  }

  let progress = 0,
      playbackIntervalIdx = 0,
      cumulativeProgress = 0;
  while(true) {
    const playbackInterval = queue.playbackIntervals[playbackIntervalIdx],
          playbackIntervalDuration = playbackInterval.endPosition - playbackInterval.startPosition;
    if(position >= playbackInterval.startPosition && position < playbackInterval.endPosition) {
      progress = position - playbackInterval.startPosition + cumulativeProgress;
      break;
    }
    playbackIntervalIdx += 1;
    cumulativeProgress += playbackIntervalDuration;
  }
  return progress;
}


/*
 * Get the progress of a stream.
 */
export const getProgress = function(queue) {
  if(queue.status === "paused") {
    return queue.statusAt - queue.startedAt;
  } else if(queue.status === 'played') {
    return Date.now() - queue.startedAt;
  } else {
    return undefined;
  }
};


/*
 *
 */
export const updateSpotifyPlayer = function(playback, device_id) {
  setTimeout(function() {
    playback.spotifyApi.transferMyPlayback([device_id]);
  }, 1000);
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


export const featureIsEnabled = function(queue, playback, action) {
  const service = queue?.service;
  if(!service) {
    return true;
  }

  const isLoaded = playback.loading[service];
  if(!isLoaded) {
    return false;
  }

  const pendingAction = playback.pending[service];
  if(pendingAction) {
    return false;
  }

  return true;
}
