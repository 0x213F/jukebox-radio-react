import { getPositionMilliseconds } from './utils';

import {
  SERVICE_APPLE_MUSIC,
  SERVICE_SPOTIFY,
  SERVICE_YOUTUBE,
  SERVICE_JUKEBOX_RADIO,
  SERVICE_AUDIUS,
} from '../../config/services';
import {
  fetchTrackGetFiles,
} from './Player/network';
import { store } from '../../utils/redux';


/*
 * Executes the "start" of playback given:
 *     - playback (singleton instance in the React application)
 *     - queue
 */
export const playbackControlStart = function(playback, queue) {
  const arr = getPositionMilliseconds(queue, queue.startedAt),
        positionMilliseconds = arr[0],
        instrument = arr[2],
        playbackService = queue.track.service;
  if(playbackService === SERVICE_APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    music.setQueue({ song: queue.track.externalId, startTime: positionMilliseconds / 1000 })
      .then(() => {
        music.play();
      });
  } else if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.play({
      uris: [queue.track.externalId],
      position_ms: positionMilliseconds,
    });
  } else if(playbackService === SERVICE_YOUTUBE) {
    if(typeof playback.youTubeApi.getPlayerState() === "number") {
      playback.youTubeApi.seekTo(Math.floor(positionMilliseconds / 1000));
      playback.youTubeApi.playVideo();
    } else {
        store.dispatch({
          type: 'playback/youTubeTriggerAutoplay',
          payload: { autoplay: true },
        });
    }
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    const trackUuid = queue.track.uuid,
          audio = playback.files[trackUuid][instrument];
    if(positionMilliseconds > 0) {
      audio.currentTime = positionMilliseconds / 1000;
    }
    audio.play();
  } else if(playbackService === SERVICE_AUDIUS) {
    const trackUuid = queue.track.uuid,
          audio = playback.files[trackUuid];
    if(positionMilliseconds > 0) {
      audio.currentTime = positionMilliseconds / 1000;
    }
    audio.play();
  }
};


/*
 * "Pauses" the current playback given:
 *     - playback (singleton instance in the React application)
 *     - queue
 */
export const playbackControlPause = function(playback, queue) {
  const playbackService = queue.track.service;

  if(playbackService === SERVICE_APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    music.pause();
  } else if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.pause();
  } else if(playbackService === SERVICE_YOUTUBE) {
    playback.youTubeApi.pauseVideo();
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    const trackUuid = queue.track.uuid,
          audios = playback.files[trackUuid];
    // eslint-disable-next-line
    for(const [instrument, audio] of Object.entries(audios)) {
      if(!audio.paused) {
        audio.pause();
      }
    }
  } else if(playbackService === SERVICE_AUDIUS) {
    const trackUuid = queue.track.uuid,
          audio = playback.files[trackUuid];
    audio.pause();
  }
}


/*
 * "Plays" the current playback given:
 *     - playback (singleton instance in the React application)
 *     - queue
 */
export const playbackControlPlay = function(playback, queue) {
  const playbackService = queue.track.service;

  if(playbackService === SERVICE_APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    music.play();
  } else if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.play();
  } else if(playbackService === SERVICE_YOUTUBE) {
    playback.youTubeApi.playVideo();
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    const arr = getPositionMilliseconds(queue, queue.startedAt),
          instrument = arr[2],
          trackUuid = queue.track.uuid,
          audio = playback.files[trackUuid][instrument];
    audio.play();
  } else if(playbackService === SERVICE_AUDIUS) {
    const trackUuid = queue.track.uuid,
          audio = playback.files[trackUuid];
    audio.play();
  }
}


/*
 * "Seeks" the current playback given to the expected position given:
 *     - playback (singleton instance in the React application)
 *     - queue
 */
export const playbackControlSeek = function(playback, queue, startedAt) {
  const arr = getPositionMilliseconds(queue, startedAt),
        positionMilliseconds = arr[0],
        instrument = arr[2],
        playbackService = queue.track.service;

  if(playbackService === SERVICE_APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    music.seekToTime(positionMilliseconds / 1000);
  } else if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.seek(positionMilliseconds);
  } else if(playbackService === SERVICE_YOUTUBE) {
    console.log(Math.floor(positionMilliseconds / 1000))
    playback.youTubeApi.seekTo(Math.floor(positionMilliseconds / 1000));
    // playback.youTubeApi.playVideo();
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    const trackUuid = queue.track.uuid,
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
  } else if(playbackService === SERVICE_AUDIUS) {
    const trackUuid = queue.track.uuid,
          audio = playback.files[trackUuid];

    audio.currentTime = positionMilliseconds / 1000;
    audio.play();
  }
}


/*
 *
 */
export const playbackControlSkipToNext = function(playback, queue) {
  const playbackService = queue.track.service;

  if(playbackService === SERVICE_APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    music.skipToNextItem();
  } else if(playbackService === SERVICE_SPOTIFY) {
    playback.spotifyApi.skipToNext();
  } else if(playbackService === SERVICE_YOUTUBE) {
    // TODO - seems to work out of the box :)
  } else if(playbackService === SERVICE_JUKEBOX_RADIO) {
    // TODO - refactor stuff to go inside of here instead
  } else if(playbackService === SERVICE_AUDIUS) {
    // TODO - refactor stuff to go inside of here instead
  }
}


/*
 * "Queues" the (track) queue item up next given:
 *     - playback (singleton instance in the React application)
 *     - queue
 *     - nextUp
 *
 * In this context, queuing up the track means doing as much pre-loading as
 * possible.
 */
export const playbackControlQueue = function(playback, queue, nextUp) {
  if(!nextUp) {
    return;
  }

  const nowPlaying = queue,
        playbackService = nowPlaying.track.service,
        nextPlaybackService = nextUp.track.service;
  let shouldAddToQueue;

  // Apple Music
  shouldAddToQueue = nextPlaybackService === SERVICE_APPLE_MUSIC;
  if(shouldAddToQueue) {
    const music = window.MusicKit.getInstance();
    music.prepareToPlay(nextUp.track.externalId);

    const canPlayNext = (
      playbackService === SERVICE_APPLE_MUSIC &&
      nextUp.playbackIntervals[0].startPosition === 0
    );
    if(canPlayNext) {
      music.playNext({ song: nextUp.track.externalId });
    }
  }

  // Spotify
  shouldAddToQueue = (
    playbackService === SERVICE_SPOTIFY &&
    nextPlaybackService === SERVICE_SPOTIFY &&
    nextUp.playbackIntervals[0].startPosition === 0
  );
  if(shouldAddToQueue) {
    playback.spotifyApi.queue(nextUp.track.externalId);
  }

  // YouTube
  // TODO

  // Jukebox Radio
  shouldAddToQueue = nextPlaybackService === SERVICE_JUKEBOX_RADIO;
  if(shouldAddToQueue) {
    fetchTrackGetFiles(nextUp.track.uuid)
      .then((responseJson) => {
        store.dispatch(responseJson.redux);
      });
  }

  // Audius
  shouldAddToQueue = nextPlaybackService === SERVICE_AUDIUS;
  if(shouldAddToQueue) {
    store.dispatch({
      "type": "playback/loadAudius",
      "payload": {
        "id": nextUp.track.externalId,
        "trackUuid": nextUp.track.uuid,
      }
    });
  }
}


export const playbackChangeVolume = function(playback, queue, volumeLevel) {
  const music = window.MusicKit.getInstance();
  music.volume = volumeLevel;

  try {
    playback.spotifyApi.setVolume(volumeLevel * 100);
  } catch (e) {
    //
  }

  try {
    playback.youTubeApi.setVolume(volumeLevel * 100);
  } catch (e) {
    //
  }

  const trackUuid = queue?.track?.uuid,
        audios = playback.files[trackUuid];

  try {
    if(audios) {
      audios.all.volume = volumeLevel;
      audios.drums.volume = volumeLevel;
      audios.vocals.volume = volumeLevel;
      audios.bass.volume = volumeLevel;
      audios.other.volume = volumeLevel;
    }
  } catch (e) {
    //
  }

  try {
    if(audios) {
      audios.volume = volumeLevel;
    }
  } catch (e) {
    //
  }
}
