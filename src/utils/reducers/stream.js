 import { finalizeQueue } from './queue';

/*
 * Set the stream context.
 */
export const streamSet = function(state, payload) {
  const stream = payload.stream,
        nowPlaying = stream.nowPlaying,
        obj = { ...state };

  if(nowPlaying) {
    stream.nowPlaying = finalizeQueue(nowPlaying);
  }
  console.log(stream)

  obj.stream = stream;

  if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
    obj.lastUp = stream.nowPlaying;
    obj._lastPlayed = stream.nowPlaying;
    obj.stream.nowPlaying = undefined;
  }

  return obj;
}
