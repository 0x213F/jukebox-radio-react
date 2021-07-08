import { getPositionMilliseconds } from '../utils';

import * as services from '../../../config/services';
import { store } from '../../../utils/redux';


/*
 * Executes the "start" of playback.
 *
 * NOTE: this should only be called by the PlaybackEngine!
 */
export const start = function(playback, queue) {
  const arr = getPositionMilliseconds(queue, queue.startedAt),
        positionMilliseconds = arr[0],
        instruments = arr[2],
        playbackService = queue.track.service;
  if(playbackService === services.APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    if(queue.track.format === 'track') {
      music.setQueue({ song: queue.track.externalId, startTime: positionMilliseconds / 1000 })
        .then(() => {
          const music = window.MusicKit.getInstance();
          music.play()
            .then(() => {
              const action = null;
              store.dispatch({
                type: "playback/action",
                payload: { action },
              });
            });
        });
    } else if(queue.track.format === 'video') {
      music.setQueue({ musicVideo: queue.track.externalId, startTime: positionMilliseconds / 1000 })
        .then(() => {
          const music = window.MusicKit.getInstance();
          music.play()
            .then(() => {
              const action = null;
              store.dispatch({
                type: "playback/action",
                payload: { action },
              });
            });
        });
    }
  } else if(playbackService === services.SPOTIFY) {
    playback.spotifyApi.play({
      uris: [queue.track.externalId],
      position_ms: positionMilliseconds,
    });
  } else if(playbackService === services.YOUTUBE) {
    if(typeof playback.youTubeApi.getPlayerState() === "number") {
      playback.youTubeApi.setVolume(playback.volumeLevel.audio * 100);
      playback.youTubeApi.seekTo(Math.floor(positionMilliseconds / 1000));
      playback.youTubeApi.playVideo();
    } else {
        store.dispatch({
          type: 'playback/youTubeTriggerAutoplay',
          payload: { autoplay: true },
        });
    }
  } else if(playbackService === services.JUKEBOX_RADIO) {
    for(let instrument of instruments) {
      const trackUuid = queue.track.uuid,
            audio = playback.files[trackUuid][instrument];
      if(positionMilliseconds > 0) {
        audio.currentTime = positionMilliseconds / 1000;
      }
      audio.volume = playback.volumeLevel.audio;
      audio.play();
    }
  } else if(playbackService === services.AUDIUS) {
    const trackUuid = queue.track.uuid,
          audio = playback.files[trackUuid];
    if(positionMilliseconds > 0) {
      audio.currentTime = positionMilliseconds / 1000;
    }
    audio.volume = playback.volumeLevel.audio;
    audio.play();
  }
};

/*
 * "Pauses" the current playback.
 *
 * NOTE: this should only be called by the PlaybackEngine!
 */
export const pause = function(playback, queue) {
  const playbackService = queue.track.service;

  if(playbackService === services.APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    music.pause()
      .then(() => {
        const action = null;
        store.dispatch({
          type: "playback/action",
          payload: { action },
        });
      });
  } else if(playbackService === services.SPOTIFY) {
    playback.spotifyApi.pause();
  } else if(playbackService === services.YOUTUBE) {
    playback.youTubeApi.pauseVideo();
  } else if(playbackService === services.JUKEBOX_RADIO) {
    const trackUuid = queue.track.uuid,
          audios = playback.files[trackUuid];
    // eslint-disable-next-line
    for(const [instrument, audio] of Object.entries(audios)) {
      if(!audio.paused) {
        audio.pause();
      }
    }
  } else if(playbackService === services.AUDIUS) {
    const trackUuid = queue.track.uuid,
          audio = playback.files[trackUuid];
    audio.pause();
  }
}

/*
 * "Plays" the current playback.
 *
 * NOTE: this should only be called by the PlaybackEngine
 * NOTE: this is currently unused, but in the future, it should be used in
 *       order to optimize playback for certain services.
 */
// export const playbackControlPlay = function(playback, queue) {
//   const playbackService = queue.track.service;
//
//   if(playbackService === services.APPLE_MUSIC) {
//     const music = window.MusicKit.getInstance();
//     music.play();
//   } else if(playbackService === services.SPOTIFY) {
//     playback.spotifyApi.play();
//   } else if(playbackService === services.YOUTUBE) {
//     playback.youTubeApi.playVideo();
//   } else if(playbackService === services.JUKEBOX_RADIO) {
//     const arr = getPositionMilliseconds(queue, queue.startedAt),
//           instrument = arr[2],
//           trackUuid = queue.track.uuid,
//           audio = playback.files[trackUuid][instrument];
//     audio.play();
//   } else if(playbackService === services.AUDIUS) {
//     const trackUuid = queue.track.uuid,
//           audio = playback.files[trackUuid];
//     audio.play();
//   }
// }

/*
 * "Seeks" the current playback given to the expected position.
 *
 * NOTE: this should only be called by the PlaybackEngine!
 */
export const seek = function(playback, queue, startedAt) {
  const arr = getPositionMilliseconds(queue, startedAt),
        positionMilliseconds = arr[0],
        instruments = new Set(arr[2]),
        playbackService = queue.track.service;

  if(playbackService === services.APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    music.seekToTime(positionMilliseconds / 1000)
      .then(() => {
        const action = null;
        store.dispatch({
          type: "playback/action",
          payload: { action },
        });
      });
  } else if(playbackService === services.SPOTIFY) {
    playback.spotifyApi.seek(positionMilliseconds);
  } else if(playbackService === services.YOUTUBE) {
    playback.youTubeApi.seekTo(Math.floor(positionMilliseconds / 1000));
    // playback.youTubeApi.playVideo();
  } else if(playbackService === services.JUKEBOX_RADIO) {

    const trackUuid = queue.track.uuid,
          audios = playback.files[trackUuid];

    // Pause everything else so only the new stem is played
    for(const [instrument, aud] of Object.entries(audios)) {
      if(instruments.has(instrument)) {
        continue;
      }
      if(!aud.paused) {
        aud.pause();
      }
    }

    for(let instrument of instruments) {
      const audio = audios[instrument];
      audio.currentTime = positionMilliseconds / 1000;
      audio.play();
    }
  } else if(playbackService === services.AUDIUS) {
    const trackUuid = queue.track.uuid,
          audio = playback.files[trackUuid];

    audio.currentTime = positionMilliseconds / 1000;
    audio.play();
  }
}

/*
 * "Queues" the next track. This is used as an optimization technique that
 * some services support.
 *
 * NOTE: this should only be called by the PlaybackEngine
 */
export const queue = function(playback, onDeck) {

  // Apple Music
  if(onDeck.track.service === services.APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    music.playNext({
      song: onDeck.track.externalId,
      startTime: onDeck.playbackIntervals[0].startTime / 1000,
    });
  }

  // Spotify
  if(onDeck.track.service === services.SPOTIFY) {
    playback.spotifyApi.queue(onDeck.track.externalId);
  }
}

/*
 * "Skips" the current song. This is used as an optimization technique that
 * some services support.
 *
 * NOTE: this should only be called by the PlaybackEngine!
 */
export const skip = function(playback, nowPlaying) {
  const playbackService = nowPlaying.track.service;

  if(playbackService === services.APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    music.skipToNextItem();
  } else if(playbackService === services.SPOTIFY) {
    playback.spotifyApi.skipToNext();
  }
}

/*
 * Changes playback volume.
 *
 * NOTE: this should only be called by the PlaybackEngine!
 * NOTE: there is one place in the code that calls this outside of the
 *       PlaybackEngine and I'm going to let it slide for now!
 */
export const volume = function(playback, queue, volumeLevel) {
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
      audios.piano.volume = volumeLevel;
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
