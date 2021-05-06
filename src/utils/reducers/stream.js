 import { finalizeQueue } from './queue';


/*
 * ...
 */
export const streamSet = function(state, payload) {
  const stream = payload.stream,
        nowPlaying = stream.nowPlaying,
        obj = { ...state };

  if(nowPlaying) {
    stream.nowPlaying = finalizeQueue(nowPlaying);
  }

  obj.stream = stream;

  if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
    obj.lastUp = stream.nowPlaying;
    obj._lastPlayed = stream.nowPlaying;
    obj.stream.nowPlaying = undefined;
    obj.stream.isPlaying = false;
    obj.stream.isPaused = false;
  } else if(stream.isPlaying) {
    const progress = Date.now() - stream.startedAt;
    if(progress && progress >= stream.nowPlaying.totalDurationMilliseconds) {
      obj.lastUp = stream.nowPlaying;
      obj._lastPlayed = stream.nowPlaying;
      obj.stream.nowPlaying = undefined;
      obj.stream.isPlaying = false;
      obj.stream.isPaused = false;
    }
  }

  return obj;
}


/*
 * ...
 */
export const streamPlay = function(state, payload) {
  const updatedPayload = {
    stream: {
      ...state.stream,
      isPlaying: true,
      isPaused: false,
      startedAt: payload.startedAt,
    }
  };
  return streamSet(state, updatedPayload);
}


/*
 * ...
 */
export const streamPause = function(state, payload) {
  const updatedPayload = {
    stream: {
      ...state.stream,
      isPlaying: false,
      isPaused: true,
      pausedAt: payload.pausedAt,
    }
  };
  return streamSet(state, updatedPayload);
}


/*
 * Set the stream context.
 */
export const streamPrevTrack = function(state, payload) {
  const lastUpQueues = [...state.lastUpQueues],
        nextUpQueues = [...state.nextUpQueues],
        lastNowPlaying = state.stream.nowPlaying,
        nextUpQueue = nextUpQueues[0],
        nextNowPlaying = lastUpQueues[lastUpQueues.length - 1];

  const isTrackInCollection = (
          lastNowPlaying?.parentUuid &&
          nextUpQueue?.uuid &&
          lastNowPlaying?.parentUuid === nextUpQueue?.uuid
        );
  if(lastNowPlaying) {
    if(isTrackInCollection) {
      nextUpQueue.children.unshift(lastNowPlaying);
    } else {
      if(lastNowPlaying.parentUuid) {
        // Here we need to first create the "parent queue."
        const parentQueue = { ...lastNowPlaying };
        parentQueue.uuid = parentQueue.parentUuid;
        parentQueue.parentUuid = null;
        parentQueue.track = null;
        parentQueue.isAbstract = true;
        parentQueue.playbackIntervals = [];
        parentQueue.allIntervals = [];
        parentQueue.intervals = [];
        // Then, it goes into the queue along with the track as its first child.
        parentQueue.children.unshift(lastNowPlaying);
        nextUpQueues.unshift(parentQueue);
      } else {
        nextUpQueues.unshift(lastNowPlaying);
      }
    }
  }

  lastUpQueues.pop();

  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: payload.startedAt,
        nowPlaying: nextNowPlaying,
        isPlaying: true,
        isPaused: false,
      },
      lastUpQueues: lastUpQueues,
      nextUpQueues: nextUpQueues,
      _lastPlayed: undefined,
  };
}


/*
 * ...
 */
export const streamNextTrack = function(state, payload) {
  const lastUpQueues = [...state.lastUpQueues],
        nextUpQueues = [...state.nextUpQueues],
        lastNowPlaying = state.stream.nowPlaying,
        nextUpQueue = nextUpQueues[0],
        nextNowPlaying = (
          nextUpQueue ?
            (nextUpQueue.children.length ?
              nextUpQueue.children[0] :
              nextUpQueue) :
            undefined
        );

  if(lastNowPlaying) {
    lastUpQueues.push(lastNowPlaying);
  }

  if(nextUpQueue) {
    if(nextUpQueue.children.length) {
      nextUpQueue.children.shift();
      if(!nextUpQueue.children.length) {
        nextUpQueues.shift();
      }
    } else {
      nextUpQueues.shift();
    }
  }

  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: payload.startedAt,
        nowPlaying: nextNowPlaying,
        isPlaying: !!nextNowPlaying,
        isPaused: false,
      },
      lastUpQueues: lastUpQueues,
      nextUpQueues: nextUpQueues,
      _lastPlayed: lastNowPlaying,
  };
}
