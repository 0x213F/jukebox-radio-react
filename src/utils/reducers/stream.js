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
  }

  return obj;
}


/*
 * Set the stream context.
 */
export const streamPrevTrack = function(state, action) {
  const lastUpQueues = [...state.lastUpQueues],
        nextUpQueues = [...state.nextUpQueues],
        lastNowPlaying = state.stream.nowPlaying,
        nextUpQueue = nextUpQueues[0],
        nextNowPlaying = lastUpQueues[lastUpQueues.length - 1];

  if(lastNowPlaying?.parentUuid === nextUpQueue?.uuid) {
    nextUpQueue.children.unshift(lastNowPlaying);
  } else {
    nextUpQueues.unshift(lastNowPlaying);
  }

  lastUpQueues.pop();

  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: action.startedAt,
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
export const streamNextTrack = function(state, action) {
  const lastUpQueues = [...state.lastUpQueues],
        nextUpQueues = [...state.nextUpQueues],
        lastNowPlaying = state.stream.nowPlaying,
        nextUpQueue = nextUpQueues[0],
        nextNowPlaying = (
          nextUpQueue.children.length ? nextUpQueue.children[0] : nextUpQueue
        );

  lastUpQueues.push(lastNowPlaying);

  if(nextUpQueue.children.length) {
    nextUpQueue.children.shift();
    if(!nextUpQueue.children.length) {
      nextUpQueues.shift();
    }
  } else {
    nextUpQueues.shift();
  }

  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: action.startedAt,
        nowPlaying: nextNowPlaying,
        isPlaying: true,
        isPaused: false,
      },
      lastUpQueues: lastUpQueues,
      nextUpQueues: nextUpQueues,
      _lastPlayed: lastNowPlaying,
  };
}
