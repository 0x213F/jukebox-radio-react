/*
 * Set the stream context.
 */
export const streamSet = function(state, action) {
  const stream = action.stream,
        obj = {
          ...state,
          stream: stream,
        };

  if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
    obj.lastUp = stream.nowPlaying;
    obj._lastPlayed = stream.nowPlaying;
    obj.stream.nowPlaying = undefined;
  }

  return obj;
}
