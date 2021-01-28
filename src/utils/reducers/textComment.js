/*
 * ...
 */
export const textCommentListSet = function(state, payload) {
  const textComments = payload.textComments,
        aggregateFeed = [...textComments, ...state.voiceRecordings];

  const feed = aggregateFeed.sort((a, b) => {
    return a.timestampMilliseconds - b.timestampMilliseconds;
  });

  return {
    ...state,
    textComments: payload.textComments,
    feed: feed,
  }
}
