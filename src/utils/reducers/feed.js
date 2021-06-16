/*
 * - hide:    A tag given to a feed item which should not be shown.
 * - history: A tag given to a feed item which signifies that it is no longer
 *            relevant. This is because it has been lingering on for a
 *            significant amount of time since its original context.
 * - display: A tag given to a feed item which signifies that it is still
 *            "fresh." It is within a reasonable amount of time since its
 *            original context.
 */
const DISPLAY_DURATION = 1000,
      HISTORY_DURATION = 60000;

/*
 * Regenerates the feed. When regenerating the feed, it takes the previous
 * feed, then adds new items and removes stale items. This is exported because
 * other reducers need to re-generate the feed.
 */
export const feedUpdate = function(state, payload) {

  const feedApp = { ...state.feedApp };

  const stream = state.stream,
        queueMap = state.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid];

  if(!nowPlaying?.track?.uuid || nowPlaying.status === 'paused') {
    return { ...state, feedApp };
  }

  // eslint-disable-next-line
  const [progress, displayThreshold, historyThreshold] = getPositionMilliseconds(nowPlaying);
  const now = Date.now();
  let feed = [...state.feedApp.feed];

  // Remove stale items from the feed.
  feed = feed.filter(el => {
    if(el.stickiedAt) {
      return true;
    }
    return now < el.hiddenAt + el.stickyDuration;
  });

  // Get relevant feed items
  const textCommentUuids = [...(state.feedApp.trackMap[nowPlaying.track.uuid]?.textCommentUuids || [])],
        voiceRecordingUuids = [...(state.feedApp.trackMap[nowPlaying.track.uuid]?.voiceRecordingUuids || [])];

  const textCommentMap = { ...state.textCommentMap },
        voiceRecordingMap = { ...state.voiceRecordingMap };

  const textComments = textCommentUuids.map(uuid => textCommentMap[uuid]),
        voiceRecordings = voiceRecordingUuids.map(uuid => voiceRecordingMap[uuid]);

  // Determine the last time the feed was generated
  const lastRender = feedApp.lastRender,
        lowerBound = (
          (
            lastRender?.trackUuid &&
            lastRender.trackUuid === nowPlaying.track.uuid &&
            lastRender.timestampMilliseconds  // TODO is int
          ) ?
          lastRender.timestampMilliseconds : nowPlaying.allIntervals[0].startPosition
        );

  // Get items that should be added to the feed
  let addedFeed;
  addedFeed = [...textComments, ...voiceRecordings];
  addedFeed = addedFeed.filter(el => {
    return (
      (
        el.timestampMilliseconds > lowerBound &&
        el.timestampMilliseconds <= progress
      ) ||
      el.forceDisplay
    );
  });

  // Sort them by timestamp
  addedFeed = addedFeed.sort((a, b) => {
    return a.timestampMilliseconds - b.timestampMilliseconds;
  });

  // Set statistics for current generation/ rendering
  const lastItem = addedFeed[addedFeed.length - 1];
  if(lastItem) {
    feedApp.lastRender = {
      trackUuid: lastItem.trackUuid,
      timestampMilliseconds: lastItem.timestampMilliseconds,
    };
  }

  // Modify and slim down the feed data
  addedFeed = addedFeed.map(el => {
    if(el.forceDisplay) {
      if(el.class === 'TextComment') {
        delete el.forceDisplay;
        textCommentMap[el.uuid] = { ...el };
      } else if(el.class === 'VoiceRecording') {
        delete el.forceDisplay;
        voiceRecordingMap[el.uuid] = { ...el };
      }
    }
    return {
      uuid: el.uuid,
      class: el.class,
      format: el.format,
      displayedAt: now,
      hiddenAt: now + 60000,
      stickiedAt: null,
      stickyDuration: 0,
    }
  });

  // NOTE: The feed must be sorted once more by the displayedAt property - this
  //       is important!
  feed = [...feed, ...addedFeed];
  feed = feed.sort((a, b) => {
    return a.displayedAt - b.displayedAt;
  });

  feedApp.feed = feed;

  return { ...state, feedApp, textCommentMap, voiceRecordingMap };
}


/*
 * Helper method which gets the timestamp marker thresholds to help define
 * which comments should be displayed.

 DELETE MEEMEEMEMEMEMEM
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
export const feedTakeAction = function(state, payload) {
  const feedApp = { ...state.feedApp },
        action = payload.action,
        now = Date.now();
  let feed = [...state.feedApp.feed];

  feed.push({
    class: "SystemAction",
    timestampMilliseconds: payload.timestampMilliseconds,
    trackUuid: payload.trackUuid,
    action: payload.action,
    displayedAt: now,
    hiddenAt: now + 60000,
    stickiedAt: null,
    stickyDuration: 0,
  });

  if(action === "paused") {
    feed = feed.map(el => {
      return {
        ...el,
        stickiedAt: now,
      };
    });
  } else if(action === 'played') {
    feed = feed.map(el => {
      const stickyDuration = (
        el.stickiedAt ?
        el.stickyDuration + (now - el.stickiedAt) : 0
      );
      return { ...el, stickyDuration, stickiedAt: null };
    });
  }

  feedApp.feed = feed;
  feedApp.lastRender = {
    trackUuid: payload.trackUuid,
    timestampMilliseconds: payload.timestampMilliseconds,
  };
  return { ...state, feedApp };
}



export const feedAppSetContentContainer = function(state, payload) {
  const contentContainer = payload.contentContainer,
        feedApp = { ...state.feedApp, contentContainer };
  return { ...state, feedApp };
}
