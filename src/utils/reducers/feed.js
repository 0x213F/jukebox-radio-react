/*
 * - hide:    A tag given to a feed item which should not be shown.
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
      DISPLAY_DURATION = 60000,
      HISTORY_DURATION = 60000;

/*
 * Regenerates the feed. When regenerating the feed, it takes the previous
 * feed, then adds new items and removes stale items. This is exported because
 * other reducers need to re-generate the feed.
 */
export const feedGenerate = function(state) {



  const stream = state.stream,
        queueMap = state.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid];

  const [progress, displayThreshold, historyThreshold] = getPositionMilliseconds(nowPlaying);

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


/*
 * Helper method which gets the timestamp marker thresholds to help define
 * which comments should be displayed.
 */
const getPositionMilliseconds = function(nowPlaying) {

  if(!nowPlaying?.track) {
    return [undefined, undefined, undefined];
  }

  const startedAt = nowPlaying.startedAt;

  let progress = (
        nowPlaying.status === "played" ? Date.now() - startedAt : nowPlaying.statusAt - startedAt
      ),
      playbackIntervalIdx = 0,
      displayThreshold = 0,
      historyThreshold = 0,
      cumulativeProgress = 0;

  while(true) {
    const playbackInterval = nowPlaying.playbackIntervals[playbackIntervalIdx],
          playbackIntervalDuration = playbackInterval.endPosition - playbackInterval.startPosition;
    let remainingProgress;

    // if display threshold progress definition has been reached
    const displayProgress = (progress - DISPLAY_DURATION);
    remainingProgress = displayProgress - cumulativeProgress;
    if(remainingProgress >= 0 && remainingProgress < playbackIntervalDuration) {
      displayThreshold = playbackInterval.startPosition + remainingProgress;
    }

    // if history threshold progress definition has been reached
    const historyProgress = (progress - DISPLAY_DURATION - HISTORY_DURATION);
    remainingProgress = historyProgress - cumulativeProgress;
    if(remainingProgress >= 0 && remainingProgress < playbackIntervalDuration) {
      historyThreshold = playbackInterval.startPosition + remainingProgress;
    }

    // if the progress definition has been reached
    remainingProgress = progress - cumulativeProgress;
    if(remainingProgress < playbackIntervalDuration) {
      progress = playbackInterval.startPosition + remainingProgress;
      break;
    }

    playbackIntervalIdx += 1;
    cumulativeProgress += playbackIntervalDuration;
  }

  return [progress, displayThreshold, historyThreshold];
}


/*
 * Generates the feed.
 */
export const feedUpdate = function(state) {
  return {
    ...state,
    feed: feedGenerate(state),
  }
}


export const feedAppSetContentContainer = function(state, payload) {
  const contentContainer = payload.contentContainer,
        feedApp = { ...state.feedApp, contentContainer };
  return { ...state, feedApp };
}
