/*
 * - history: A tag given to a feed item which signifies that it is no longer
 *            relevant. This is because it has been lingering on for a
 *            significant amount of time since its original context.
 * - display: A tag given to a feed item which signifies that it is still
 *            "fresh." It is within a reasonable amount of time since its
 *            original context.
 */
const FADE_AT_THRESHOLD = 10000,
      REMOVE_AT_THRESHOLD = FADE_AT_THRESHOLD + 10000,
      PRELOAD_DURATION = 5000;

/*
 * ...
 */
export const feedGenerate = function(state) {

  const stream = state.stream,
        historicalProgresses = [0, PRELOAD_DURATION],
        arr = getPositionMilliseconds(stream, historicalProgresses),
        [progress, preloadAt] = arr;

  if(!progress) {
    return [];
  }

  const now = Date.now(),
        feed = state.feed,
        feedUuids = feed.map(i => i.uuid),
        feedUuidsSet = new Set(feedUuids);

  const textComments = [...state.textComments],
        voiceRecordings = [...state.voiceRecordings];
  let aggregateFeed;

  // console.log(feedUuidsSet)

  aggregateFeed = [...textComments, ...voiceRecordings];
  aggregateFeed = aggregateFeed.filter(i => !feedUuidsSet.has(i.uuid));
  aggregateFeed = aggregateFeed.map(el => {
    const timestamp = el.timestampMilliseconds,
          shouldSetDisplay = (
            timestamp <= progress &&
            timestamp > progress - 10000 &&
            !el.displayAt
          ),
          shouldSetPreLoad = (
            timestamp <= preloadAt &&
            timestamp > preloadAt - 10000 &&
            !el.preloadAt
          ),
          duration = el.durationMilliseconds || 0;
    if(shouldSetDisplay) {
      el.preloadAt = now;
      el.displayAt = now;
      el.fadeAt = now + duration + FADE_AT_THRESHOLD;
      el.removeAt = now + duration + REMOVE_AT_THRESHOLD;
      el.preloadStatus = 'init';
    } else if(shouldSetPreLoad) {
      el.preloadAt = now;
      el.displayAt = now + PRELOAD_DURATION + duration;
      el.fadeAt = now + PRELOAD_DURATION + duration + FADE_AT_THRESHOLD;
      el.removeAt = now + PRELOAD_DURATION + duration + REMOVE_AT_THRESHOLD;
      el.preloadStatus = 'init';
    }
    return { ...el };
  });
  aggregateFeed = aggregateFeed.filter(i => !!i.displayAt);
  aggregateFeed = [...feed, ...aggregateFeed];
  aggregateFeed = aggregateFeed.filter(i => i.removeAt > now)
  aggregateFeed = aggregateFeed.sort((a, b) => {
    return a.timestampMilliseconds - b.timestampMilliseconds;
  });
  return aggregateFeed;
}


export const getPositionMilliseconds = function(stream, progressDeltas) {

  if(!stream?.nowPlaying?.track) {
    const progressMarks = new Array(progressDeltas.length).fill(undefined);
    return progressMarks;
  }

  const startedAt = stream.startedAt,
        progressMarks = [],
        endOfTrack = stream.nowPlaying.totalDurationMilliseconds;

  for(let delta of progressDeltas) {
    if(delta <= 0) {
      progressMarks.push(0);
    } else {
      progressMarks.push(endOfTrack);
    }
  }

  let progress = (
        stream.isPlaying ? Date.now() - startedAt : stream.pausedAt - startedAt
      ),
      playbackIntervalIdx = 0,
      cumulativeProgress = 0;

  while(true) {
    const playbackIntervals = stream.nowPlaying.playbackIntervals;
    if(playbackIntervalIdx >= playbackIntervals.length) {
      break;
    }

    const playbackInterval = playbackIntervals[playbackIntervalIdx],
          playbackIntervalDuration = playbackInterval[1] - playbackInterval[0];
    let remainingProgress;

    for(let i = 0; i < progressDeltas.length; i++) {
      const delta = progressDeltas[i],
            relativeProgress = (progress + delta);
      remainingProgress = relativeProgress - cumulativeProgress;
      if(remainingProgress >= 0 && remainingProgress < playbackIntervalDuration) {
        progressMarks[i] = playbackInterval[0] + remainingProgress;
      }
    }

    playbackIntervalIdx += 1;
    cumulativeProgress += playbackIntervalDuration;
  }

  return progressMarks;
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
