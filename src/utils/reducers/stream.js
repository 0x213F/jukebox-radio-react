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
  const lastUpQueues = [...state.lastUpQueues];
  const nowPlaying = lastUpQueues[lastUpQueues.length - 1];
  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: action.startedAt,
        nowPlaying: nowPlaying,
        isPlaying: true,
        isPaused: false,
      },
      _lastPlayed: undefined,
  };
}


/*
 * ...
 */
export const streamNextTrack = function(state, action) {
  const nextUpQueues = [...state.nextUpQueues];
  const nowPlaying = (
    nextUpQueues[0].children.length ?
      nextUpQueues[0].children[0] :
      nextUpQueues[0]
  );
  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: action.startedAt,
        nowPlaying: nowPlaying,
        isPlaying: true,
        isPaused: false,
      },
      _lastPlayed: undefined,
  };
}
