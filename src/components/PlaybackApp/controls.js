import { getPositionMilliseconds } from './utils';

import {
  SERVICE_SPOTIFY,
  SERVICE_YOUTUBE,
  SERVICE_JUKEBOX_RADIO,
} from '../../config/services';
// import { store } from '../../utils/redux';


/*
 * Executes the "start" of playback given:
 *     - playback (singleton instance in the React application)
 *     - stream
 */
export const playbackControlStart = function(playback, stream) {
  const arr = getPositionMilliseconds(stream, stream.startedAt),
        positionMilliseconds = arr[0],
        playbackService = stream.nowPlaying.track.service;
  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.play({
      uris: [stream.nowPlaying.track.externalId],
      position_ms: positionMilliseconds,
    });
  } else if(playbackService === SERVICE_YOUTUBE) {
    playback.youTubeApi.seekTo(positionMilliseconds / 1000);
    playback.youTubeApi.playVideo();
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    const trackUuid = stream.nowPlaying.track.uuid,
          audio = playback.files[trackUuid].audio;
    if(positionMilliseconds > 0) {
      audio.currentTime = positionMilliseconds / 1000;
    }
    audio.play();
  }
};


/*
 * "Pauses" the current playback given:
 *     - playback (singleton instance in the React application)
 *     - stream
 */
export const playbackControlPause = function(playback, stream) {
  const playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.pause();
  } else if(playbackService === SERVICE_YOUTUBE) {
    playback.youTubeApi.pauseVideo();
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    const trackUuid = stream.nowPlaying.track.uuid,
          audio = playback.files[trackUuid].audio;
    audio.pause();
  }
}


/*
 * "Plays" the current playback given:
 *     - playback (singleton instance in the React application)
 *     - stream
 */
export const playbackControlPlay = function(playback, stream) {
  const playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.play();
  } else if(playbackService === SERVICE_YOUTUBE) {
    playback.youTubeApi.playVideo();
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    const trackUuid = stream.nowPlaying.track.uuid,
          audio = playback.files[trackUuid].audio;
    audio.play();
  }
}


/*
 * "Seeks" the current playback given to the expected position given:
 *     - playback (singleton instance in the React application)
 *     - stream
 */
export const playbackControlSeek = function(playback, stream, startedAt) {
  const arr = getPositionMilliseconds(stream, startedAt),
        positionMilliseconds = arr[0],
        playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.seek(positionMilliseconds);
  } else if(playbackService === SERVICE_YOUTUBE) {
    playback.youTubeApi.seekTo(positionMilliseconds / 1000);
    playback.youTubeApi.playVideo();
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    const trackUuid = stream.nowPlaying.track.uuid,
          audio = playback.files[trackUuid].audio;
    audio.currentTime = positionMilliseconds / 1000;
    audio.play();
  }
}


/*
 *
 */
export const playbackControlSkipToNext = function(playback, stream) {
  const playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.skipToNext();
  } else if(playbackService === SERVICE_YOUTUBE) {
    // TODO - seems to work out of the box :)
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    // TODO - refactor stuff to go inside of here instead
  }
}


/*
 * "Queues" the (track) queue item up next given:
 *     - playback (singleton instance in the React application)
 *     - stream
 */
export const playbackControlQueue = function(playback, stream, nextUp) {
  const playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.queue(nextUp.track.externalId);
  } else if(playbackService === SERVICE_YOUTUBE) {
    // TODO - there is optimization that could happen here
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    // TODO - refactor stuff to go inside of here instead
  }
}
