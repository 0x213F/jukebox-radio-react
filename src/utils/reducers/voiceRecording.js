/*
 * ...
 */
export const voiceRecordingListSet = function(state, payload) {
  const voiceRecordings = payload.voiceRecordings,
        aggregateFeed = [...state.textComments, ...voiceRecordings],
        feed = aggregateFeed.sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });

  return {
    ...state,
    voiceRecordings: payload.voiceRecordings,
    feed: feed,
  }
}
