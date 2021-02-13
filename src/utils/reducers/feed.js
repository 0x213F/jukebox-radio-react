/*
 * ...
 */
export const feedGenerate = function(state) {
  const textComments = [...state.textComments],
        voiceRecordings = [...state.voiceRecordings],
        aggregateFeed = [...textComments, ...voiceRecordings],
        feed = aggregateFeed.sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });

  return feed;
}


/*
 * ...
 */
export const feedUpdate = function(state) {
  return {
    ...state,
    feed: feedGenerate(state),
  }
}
