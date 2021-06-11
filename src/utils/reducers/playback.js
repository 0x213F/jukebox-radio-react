import {
  SERVICE_APPLE_MUSIC,
  SERVICE_SPOTIFY,
} from '../../config/services';
import { getLeafQueue } from '../../components/QueueApp/utils';
import { cycleVolumeLevel } from '../../components/PlaybackApp/utils';


export const playbackMount = function(state, payload) {
  if(payload.stream) {
    return {
      ...state,
      playback: {
        ...state.playback,
        nowPlayingUuid: payload.stream.nowPlayingUuid,
        isPlaying: false,
      }
    }
  } else {
    return {
      ...state,
      playback: {
        ...state.playback,
        nowPlayingUuid: payload.queue.uuid,
        isPlaying: false,
      }
    }
  }
}

export const playbackUnmount = function(state, payload) {

}


export const playbackAppleMusic = function(state, payload) {
  return {
    ...state,
    playback: {
      ...state.playback,
      appleMusic: {
        api: payload.appleMusicApi,
      },
    }
  }
}


/*
 *
 */
export const playbackSpotify = function(state, payload) {
  return {
    ...state,
    playback: {
      ...state.playback,
      spotifyApi: payload.spotifyApi,
    }
  }
}


export const playbackLoaded = function(state, payload) {
  const service = payload.service,
        playback = { ...state.playback },
        loaded = { ...state.playback.loaded };
  loaded[service] = true;
  playback.loaded = loaded;

  return { ...state, playback };
}


export const playbackYouTube = function(state, payload) {
  return {
    ...state,
    playback: {
      ...state.playback,
      youTubeApi: payload.youTubeApi,
      // TODO refactor ready flags
    }
  }
}


export const playbackYouTubeTriggerAutoplay = function(state, payload) {
  return {
    ...state,
    playback: {
      ...state.playback,
      youTubeAutoplay: payload.autoplay ? 1 : 0,
    }
  }
}


/*
 * Assumptions:
 *   - There is currently something playing in the stream.
 *   - We are not certain that something is up next.
 */
export const playbackAddToQueue = function(state) {
  const nextUp = getLeafQueue(state.nextUpQueueUuids[0], state.queueMap);
  if(!nextUp) {
    return { ...state };
  }

  const playback = { ...state.playback },
        queueMap = state.queueMap,
        nowPlaying = queueMap[state.stream.nowPlayingUuid],
        appleMusicShouldAddToQueue = (
          nowPlaying.track.service === SERVICE_APPLE_MUSIC &&
          nextUp.track.service === SERVICE_APPLE_MUSIC &&
          nextUp.playbackIntervals[0].startPosition === 0
        ),
        spotifyShouldAddToQueue = (
          nowPlaying.track.service === SERVICE_SPOTIFY &&
          nextUp.track.service === SERVICE_SPOTIFY &&
          nextUp.playbackIntervals[0].startPosition === 0
        );

  if(appleMusicShouldAddToQueue) {
    playback.queuedUp = true;

    const playbackIntervals = nowPlaying.playbackIntervals,
          lastInterval = (
            playbackIntervals[playbackIntervals.length - 1]
          );
    if(lastInterval.endPosition === nowPlaying.track.durationMilliseconds) {
      playback.noopNextTrack = true;
    }
  }

  if(spotifyShouldAddToQueue) {
    playback.queuedUp = true;

    const playbackIntervals = nowPlaying.playbackIntervals,
          lastInterval = (
            playbackIntervals[playbackIntervals.length - 1]
          );
    if(lastInterval.endPosition === nowPlaying.track.durationMilliseconds) {
      playback.noopNextTrack = true;
    }
  }

  return {
    ...state,
    playback: playback,
  }
}


/*
 *
 */
export const playbackStart = function(state) {
  const addToQueueTimeoutId = state.playback.addToQueueTimeoutId,
        nextSeekTimeoutId = state.playback.nextSeekTimeoutId,
        playback = {
          ...state.playback,
          queuedUp: false,
          noopNextTrack: false,
          isPlaying: false,
          addToQueueTimeoutId: undefined,
        };

  clearTimeout(addToQueueTimeoutId);
  clearTimeout(nextSeekTimeoutId);

  return {
    ...state,
    playback: playback,
  };
}


/*
 *
 */
export const playbackStarted = function(state) {
  const playback = {
          ...state.playback,
          isPlaying: true,
        };
  return {
    ...state,
    playback: playback,
  };
}


export const playbackSetSeekTimeoutId = function(state, payload) {
  const playback = { ...state.playback, seekTimeoutId: payload.timeoutId };
  return { ...state, playback };
}

export const playbackClearSeekTimeoutId = function(state, payload) {
  clearTimeout(state.playback.seekTimeoutId);
  const playback = { ...state.playback, seekTimeoutId: false };
  return { ...state, playback };
}


export const playbackDisable = function(state) {
  return {
    ...state,
    playback: {
      ...state.playback,
      controlsEnabled: false,
    }
  }
}


export const playbackEnable = function(state) {
  return {
    ...state,
    playback: {
      ...state.playback,
      controlsEnabled: true,
    }
  }
}


export const playbackLoadFiles = function(state, payload) {
  const playback = { ...state.playback },
        files = { ...state.playback.files };

  const { onplay, onpause, onseeked } = payload;

  let audioObj = new Audio(payload.track.audioUrl);
  audioObj.onpause = onpause;
  audioObj.onplay = onplay;
  audioObj.onseeked = onseeked;

  const audiosObj = { all: audioObj };

  for(const stem of payload.track.stems) {
    audioObj = new Audio(stem.audioUrl);
    audioObj.onpause = onpause;
    audioObj.onplay = onplay;
    audioObj.onseeked = onseeked;

    audiosObj[stem.instrument] = audioObj;
  }

  files[payload.track.uuid] = audiosObj;
  return {
    ...state,
    playback: {
      ...playback,
      files: files,
    }
  };
}


export const playbackLoadAudius = function(state, payload) {
  const playback = { ...state.playback },
        files = { ...state.playback.files };

  const { onplay, onpause, onseeked } = payload;

  const audioObj = new Audio(`https://discoveryprovider.audius5.prod-us-west-2.staked.cloud/v1/tracks/${payload.id}/stream?app_name=Jukebox Radio`);
  audioObj.onpause = onpause;
  audioObj.onplay = onplay;
  audioObj.onseeked = onseeked;

  files[payload.trackUuid] = audioObj;

  return {
    ...state,
    playback: {
      ...playback,
      files: files,
    }
  };
}


export const playbackCycleVolumeLevelAudio = function(state) {
  const volumeLevel = { ...state.playback.volumeLevel },
        audioLevel = volumeLevel.audio;

  volumeLevel.audio = cycleVolumeLevel(audioLevel);

  return {
    ...state,
    playback: { ...state.playback, volumeLevel },
  }
}


export const playbackModalOpen = function(state, payload) {
  return {
    ...state,
    playback: { ...state.playback, nowPlaying: payload.queue, },
  }
}

export const playbackModalClose = function(state, payload) {
  return {
    ...state,
    playback: { ...state.playback, nowPlaying: undefined, isPlaying: false, },
  }
}


/*
 * Setting the "action" of playback aquires a lock - only one action can happen
 * at a time.
 *
 * You might be wondering how the lock is lifted. The lock is lifted when
 * "action === null." This case happens inside service event handlers (e.g. the
 * Spotify SDK) that signal that the action has successfully taken place.
 */
export const playbackAction = function(state, payload) {
  const action = payload.action,
        playback = { ...state.playback, action },
        queueMap = { ...state.queueMap },
        main = { ...state.main };

  if(!action) {
  //   const queue = {
  //           ...queueMap[state.playback.nowPlayingUuid],
  //           statusAt: Date.now(),
  //           status: action,
  //         };
  //   queueMap[queue.uuid] = queue;
  // } else {
    const staleAction = state.playback.action;
    if(staleAction === 'played') {
      playback.isPlaying = true;
    } else if(staleAction === 'paused') {
      playback.isPlaying = false;
      // NOTE: We must cancel the autoplay timeout here.
      clearTimeout(state.main.autoplayTimeoutId);
      main.autoplayTimeoutId = false;
    }
  }

  return { ...state, playback, queueMap };
}
