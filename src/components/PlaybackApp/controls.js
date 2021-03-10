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
        instrument = arr[2],
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
          audio = playback.files[trackUuid][instrument];
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
          audios = playback.files[trackUuid];
    // eslint-disable-next-line
    for(const [instrument, audio] of Object.entries(audios)) {
      if(audio.paused) {
        audio.pause();
      }
    }
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
    const arr = getPositionMilliseconds(stream, stream.startedAt),
          instrument = arr[2],
          trackUuid = stream.nowPlaying.track.uuid,
          audio = playback.files[trackUuid][instrument];
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
        instrument = arr[2],
        playbackService = stream.nowPlaying.track.service;

  if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.seek(positionMilliseconds);
  } else if(playbackService === SERVICE_YOUTUBE) {
    playback.youTubeApi.seekTo(positionMilliseconds / 1000);
    playback.youTubeApi.playVideo();
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    const trackUuid = stream.nowPlaying.track.uuid,
          audios = playback.files[trackUuid],
          audio = audios[instrument];

    // Pause everything else so only the new stem is played
    for(const [instr, aud] of Object.entries(audios)) {
      if(instr === instrument) {
        continue;
      }
      if(!aud.paused) {
        aud.pause();
      }
    }

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


export const playbackChangeVolume = function(playback, stream, volumeLevel) {
  playback.spotifyApi.setVolume(volumeLevel * 100);
  playback.youTubeApi.setVolume(volumeLevel * 100);

  const trackUuid = stream.nowPlaying?.track?.uuid,
        audios = playback.files[trackUuid];
  if(audios) {
    audios.all.volume = volumeLevel;
    audios.drums.volume = volumeLevel;
    audios.vocals.volume = volumeLevel;
    audios.bass.volume = volumeLevel;
    audios.other.volume = volumeLevel;
  }
}
