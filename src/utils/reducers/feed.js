/*
 * - history: A tag given to a feed item which signifies that it is no longer
 *            relevant. This is because it has been lingering on for a
 *            significant amount of time since its original context.
 * - display: A tag given to a feed item which signifies that it is still
 *            "fresh." It is within a reasonable amount of time since its
 *            original context.
 */
const RENDER_STATUS_HISTORY = 'history',
      RENDER_STATUS_DISPLAY = 'display',
      RENDER_STATUS_HIDE = 'hide',
      DISPLAY_DURATION = 30000,
      HISTORY_DURATION = 45000;

/*
 * ...
 */
export const feedGenerate = function(state) {

  const stream = state.stream,
        [progress, displayThreshold, historyThreshold] = getPositionMilliseconds(stream);

  if(!progress) {
    return [];
  }

  const textComments = [...state.textComments],
        voiceRecordings = [...state.voiceRecordings];
  let aggregateFeed = [...textComments, ...voiceRecordings];

  aggregateFeed = aggregateFeed.map(el => {
    const shouldTagHistory = (
            el.timestampMilliseconds > historyThreshold &&
            el.timestampMilliseconds <= displayThreshold
          ),
          shouldTagDisplay = (
            el.timestampMilliseconds > displayThreshold &&
            el.timestampMilliseconds <= progress
          );

    if(shouldTagHistory) {
      el.renderStatus = RENDER_STATUS_HISTORY;
    } else if(shouldTagDisplay) {
      el.renderStatus = RENDER_STATUS_DISPLAY;
    } else {
      el.renderStatus = RENDER_STATUS_HIDE;
    }

    return { ...el };
  });
  aggregateFeed = aggregateFeed.filter(i => (
    i.renderStatus !== RENDER_STATUS_HIDE
  ));
  aggregateFeed = aggregateFeed.sort((a, b) => {
    return a.timestampMilliseconds - b.timestampMilliseconds;
  });
  return aggregateFeed;
}


export const getPositionMilliseconds = function(stream) {

  if(!stream?.nowPlaying?.track) {
    return [undefined, undefined, undefined];
  }

  const startedAt = stream.startedAt;

  let progress = (
        stream.isPlaying ? Date.now() - startedAt : stream.pausedAt - startedAt
      ),
      playbackIntervalIdx = 0,
      displayThreshold = 0,
      historyThreshold = 0,
      cumulativeProgress = 0;

  while(true) {
    const playbackInterval = stream.nowPlaying.playbackIntervals[playbackIntervalIdx],
          playbackIntervalDuration = playbackInterval[1] - playbackInterval[0];
    let remainingProgress;

    // if display threshold progress definition has been reached
    const displayProgress = (progress - DISPLAY_DURATION);
    remainingProgress = displayProgress - cumulativeProgress;
    if(remainingProgress >= 0 && remainingProgress < playbackIntervalDuration) {
      displayThreshold = playbackInterval[0] + remainingProgress;
    }

    // if history threshold progress definition has been reached
    const historyProgress = (progress - DISPLAY_DURATION - HISTORY_DURATION);
    remainingProgress = historyProgress - cumulativeProgress;
    if(remainingProgress >= 0 && remainingProgress < playbackIntervalDuration) {
      historyThreshold = playbackInterval[0] + remainingProgress;
    }

    // if the progress definition has been reached
    remainingProgress = progress - cumulativeProgress;
    if(remainingProgress < playbackIntervalDuration) {
      progress = playbackInterval[0] + remainingProgress;
      break;
    }

    playbackIntervalIdx += 1;
    cumulativeProgress += playbackIntervalDuration;
  }

  return [progress, displayThreshold, historyThreshold];
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
