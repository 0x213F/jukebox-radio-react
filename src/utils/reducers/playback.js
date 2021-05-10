import {
  SERVICE_APPLE_MUSIC,
  SERVICE_SPOTIFY,
} from '../../config/services';
import { getNextUpQueue } from '../../components/QueueApp/utils';
import { cycleVolumeLevel } from '../../components/PlaybackApp/utils';
import { streamNextTrack } from './stream';


export const playbackAppleMusic = function(state, payload) {
  return {
    ...state,
    playback: {
      ...state.playback,
      appleMusic: {
        api: payload.appleMusicApi,
      },
      isReady: true,
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
      isReady: true,
    }
  }
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


/*
 * Assumptions:
 *   - There is currently something playing in the stream.
 *   - We are not certain that something is up next.
 */
export const playbackAddToQueue = function(state) {
  const nextUp = getNextUpQueue(state.nextUpQueues);
  if(!nextUp) {
    return { ...state };
  }

  const playback = { ...state.playback },
        nowPlaying = state.stream.nowPlaying,
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
const playbackPlannedNextTrackHelper = function(state) {
  const nextUp = getNextUpQueue(state.nextUpQueues),
        queuedUp = state.playback.queuedUp,
        noopNextTrack = state.playback.noopNextTrack,
        addToQueueTimeoutId = state.playback.addToQueueTimeoutId,
        nextSeekTimeoutId = state.playback.nextSeekTimeoutId,
        playback = {
          ...state.playback,
          queuedUp: false,
          noopNextTrack: false,
        };
  if(!nextUp || noopNextTrack) {
    playback.addToQueueTimeoutId = undefined;
    return {
      ...state,
      playback: playback,
    };
  }

  if(queuedUp) {
    playback.addToQueueTimeoutId = undefined;
    return {
      ...state,
      playback: playback,
    };
  }

  clearTimeout(addToQueueTimeoutId);
  clearTimeout(nextSeekTimeoutId);
  playback.isPlaying = false;
  playback.addToQueueTimeoutId = undefined;
  playback.nextSeekTimeoutId = undefined;
  return {
    ...state,
    playback: playback,
  };
}


/*
 *
 */
export const playbackPlannedNextTrack = function(state, payload) {
  let updatedState = state;
  updatedState = playbackPlannedNextTrackHelper(updatedState);
  const childPayload = payload.payload,  // yes
        updatedNowPlaying = updatedState.stream.nowPlaying;
  childPayload.startedAt = (
    updatedState.stream.startedAt + updatedNowPlaying.totalDurationMilliseconds
  );
  updatedState = streamNextTrack(updatedState, childPayload);
  return updatedState;
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


export const playbackAddToQueueReschedule = function(state) {
  const addToQueueTimeoutId = state.playback.addToQueueTimeoutId,
        nextSeekTimeoutId = state.playback.nextSeekTimeoutId,
        playback = {
          ...state.playback,
          addToQueueTimeoutId: undefined,
          nextSeekTimeoutId: undefined,
        };

  clearTimeout(addToQueueTimeoutId);
  clearTimeout(nextSeekTimeoutId);

  return {
    ...state,
    playback: playback,
  };
}


export const playbackAddToQueueScheduled = function(state, payload) {
  const playback = {
          ...state.playback,
          addToQueueTimeoutId: payload.addToQueueTimeoutId,
        };
  return {
    ...state,
    playback: playback,
  };
}


export const playbackNextSeekScheduled = function(state, payload) {
  const nextSeekTimeoutId = state.playback.nextSeekTimeoutId,
        playback = {
          ...state.playback,
          nextSeekTimeoutId: payload.nextSeekTimeoutId,
        };

  clearTimeout(nextSeekTimeoutId);

  return {
    ...state,
    playback: playback,
  };
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

  const audiosObj = { all: new Audio(payload.track.audioUrl) };

  for(const stem of payload.track.stems) {
    audiosObj[stem.instrument] = new Audio(stem.audioUrl);
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

  const audioObj = new Audio(`https://discoveryprovider.audius5.prod-us-west-2.staked.cloud/v1/tracks/${payload.id}/stream?app_name=Jukebox Radio`);
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
