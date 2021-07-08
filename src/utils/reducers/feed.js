import { getPositionMilliseconds } from '../../components/PlaybackApp/utils';

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
  const arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
        position = arr[0];
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
        el.timestampMilliseconds <= position
      ) ||
      el.forceDisplay
    );
  });

  // Sort them by timestamp
  addedFeed = addedFeed.sort((a, b) => {
    return a.timestampMilliseconds - b.timestampMilliseconds;
  });

  // Set statistics for current generation/ rendering
  feedApp.lastRender = {
    trackUuid: nowPlaying.track.uuid,
    timestampMilliseconds: position,
  };

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

export const feedAppSetTextComment = function(state, payload) {
  const { textComment } = payload;
  return { ...state, feedApp: { ...state.feedApp, textComment } };
}

export const feedAppResetTextComment = function(state, payload) {
  const textComment = { text: '', trackUuid: undefined, position: undefined };
  return { ...state, feedApp: { ...state.feedApp, textComment } };
}
