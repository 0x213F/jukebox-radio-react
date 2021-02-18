import { SERVICE_SPOTIFY } from '../../config/services';
import {
  playbackQueue,
  playbackSkipToNext,
} from '../../components/PlaybackWrapper/playback';
import { streamNextTrack } from './stream';


/*
 *
 */
const getNextUp = function(state) {
  const nextUpQueues = state.nextUpQueues,
        nextUp = (
          nextUpQueues.length ?
            (nextUpQueues[0].children.length ?
              nextUpQueues[0].children[0] :
              nextUpQueues[0]) :
            undefined
        );
  return nextUp;
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


/*
 * Assumptions:
 *   - There is currently something playing in the stream.
 *   - We are not certain that something is up next.
 */
export const playbackAddToQueue = function(state) {
  const nextUp = getNextUp(state);
  if(!nextUp) {
    return { ...state };
  }

  const playback = { ...state.playback },
        nowPlaying = state.stream.nowPlaying,
        spotifyShouldAddToQueue = (
          nowPlaying.track.service === SERVICE_SPOTIFY &&
          nextUp.track.service === SERVICE_SPOTIFY &&
          nextUp.playbackIntervals[0][0] === 0
        );

  if(spotifyShouldAddToQueue) {
    playbackQueue(state.playback, state.stream, nextUp);

    playback.queuedUp = true;

    const lastInterval = (
      nowPlaying.playbackIntervals[nowPlaying.playbackIntervals.length - 1]
    );
    if(lastInterval[1] === nowPlaying.track.durationMilliseconds) {
      playback.noopNextTrack = true;
    }
  } else {
    // TODO: do pre-loaded if needed
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
  const nextUp = getNextUp(state),
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
    playbackSkipToNext(state.playback, state.stream);
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
  // TODO: stop overcorrecting
  // TODO: add in API endpoint "autoNextTrack" or whatever.. check spec def
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
  files[payload.track.uuid] = {
    audio: payload.track.audio,
  }
  return {
    ...state,
    playback: {
      ...playback,
      files: files,
    }
  };
}
