/*
 * ...
 */
export const generateFeed = function(state) {
  const textComments = [...state.textComments],
        voiceRecordings = [...state.voiceRecordings],
        aggregateFeed = [...textComments, ...voiceRecordings],
        feed = aggregateFeed.sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });
  return feed;
}
