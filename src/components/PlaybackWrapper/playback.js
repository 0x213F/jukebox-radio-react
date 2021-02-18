import {
  SERVICE_SPOTIFY,
  SERVICE_YOUTUBE,
  SERVICE_JUKEBOX_RADIO,
} from '../../config/services';


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
 *
 */
export const playbackStart = function(playback, stream) {
  const arr = getPositionMilliseconds(stream, stream.startedAt),
        positionMilliseconds = arr[0],
        playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.play({
      uris: [stream.nowPlaying.track.externalId],
      position_ms: positionMilliseconds,
    });
  } else if(playbackService === SERVICE_YOUTUBE) {
    // TODO
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    // TODO
  }
};


/*
 *
 */
export const playbackPause = function(playback, stream) {
  const playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.pause();
  } else if(playbackService === SERVICE_YOUTUBE) {
    // TODO
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    // TODO
  }
}


/*
 *
 */
export const playbackSeek = function(playback, stream, startedAt) {
  const arr = getPositionMilliseconds(stream, startedAt),
        positionMilliseconds = arr[0],
        playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.seek(positionMilliseconds);
  } else if(playbackService === SERVICE_YOUTUBE) {
    // TODO
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    // TODO
  }
}


/*
 *
 */
export const playbackPlay = function(playback, stream) {
  const playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.play();
  } else if(playbackService === SERVICE_YOUTUBE) {
    // TODO
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    // TODO
  }
}


/*
 *
 */
export const playbackSkipToNext = function(playback, stream) {
  const playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.skipToNext();
  } else if(playbackService === SERVICE_YOUTUBE) {
    // TODO
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    // TODO
  }
}


/*
 *
 */
export const playbackQueue = function(playback, stream, nextUp) {
  const playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.queue(nextUp.track.externalId);
  } else if(playbackService === SERVICE_YOUTUBE) {
    // TODO
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    // TODO
  }
}
