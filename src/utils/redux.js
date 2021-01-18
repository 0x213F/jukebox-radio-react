import { createStore } from 'redux';


const initialState = {
  nextUpQueues: [],
  lastUpQueues: [],
  _lastPlayed: undefined,
  textComments: [],
  voiceRecordings: [],
  feed: [],
  playback: {
    nowPlaying: undefined,
  },
}


function streamSet(state, action) {
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


function streamPrevTrack(state, action) {
  const lastUpQueues = [...state.lastUpQueues];
  const nowPlaying = lastUpQueues[lastUpQueues.length - 1];
  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: action.startedAt,
        nowPlaying: nowPlaying,
        isPlaying: true,
        isPaused: false,
      },
      _lastPlayed: undefined,
  };
}


function streamNextTrack(state, action) {
  const nextUpQueues = [...state.nextUpQueues];
  const nowPlaying = (
    nextUpQueues[0].children.length ?
      nextUpQueues[0].children[0] :
      nextUpQueues[0]
  );
  return {
      ...state,
      stream: {
        ...state.stream,
        startedAt: action.startedAt,
        nowPlaying: nowPlaying,
        isPlaying: true,
        isPaused: false,
      },
      _lastPlayed: undefined,
  };
}


function streamExpire(state, action) {
  const stream = { ...state.stream },
        _lastPlayed = stream.nowPlaying;

  stream.isPlaying = false;
  stream.isPaused = false;
  stream.nowPlaying = undefined;

  return { ...state, stream: stream, _lastPlayed: _lastPlayed };
}


function playbackPlay(state, action) {
  return {
    ...state,
    playback: {
      ...state.playback,
      nowPlaying: state.stream.nowPlaying,
    },
  };
}


function queueListSet(state, action) {
  const lastUpQueues = action.lastUpQueues,
        nextUpQueues = action.nextUpQueues,
        _lastPlayed = state._lastPlayed;

  if(_lastPlayed) {
    lastUpQueues.push(_lastPlayed);
  }

  let stream = state.stream;
  if(!stream.isPlaying && !stream.isPaused && stream.nowPlaying) {
    lastUpQueues.push(stream.nowPlaying);
    stream = { ...stream, nowPlaying: undefined }
  }

  const lastUp = (
          !lastUpQueues.length ?
            undefined :
            lastUpQueues[lastUpQueues.length - 1]
        ),
        nextUp = (
          !nextUpQueues.length ? undefined : (
            !nextUpQueues[0].children.length ?
              nextUpQueues[0] :
              nextUpQueues[0].children[0]
          )
        );
  return {
    ...state,
    stream: stream,
    lastUp: lastUp,
    lastUpQueues: lastUpQueues,
    nextUp: nextUp,
    nextUpQueues: nextUpQueues,
  }
}


function queueDeleteNode(state, action) {
  const queues = state.nextUpQueues,
        filteredQueues = queues.filter(i => i.uuid !== action.queueUuid);

  return {
    ...state,
    nextUpQueues: filteredQueues,
  }
}


function queueDeleteChildNode(state, action) {
  let queues = [...state.nextUpQueues];
  const parentIndex = queues.findIndex(i => i.uuid === action.parentUuid),
        children = queues[parentIndex].children,
        filteredChildren = children.filter(i => i.uuid !== action.queueUuid);

  queues[parentIndex].children = filteredChildren;

  if(!filteredChildren.length) {
    queues = queues.filter(i => i.uuid !== action.parentUuid);
  }

  return {
    ...state,
    nextUpQueues: queues,
  }
}


function textCommentListSet(state, action) {
  const textComments = action.textComments,
        aggregateFeed = [...textComments, ...state.voiceRecordings];

  const feed = aggregateFeed.sort((a, b) => {
    return a.timestampMilliseconds - b.timestampMilliseconds;
  });

  return {
    ...state,
    textComments: action.textComments,
    feed: feed,
  }
}


function textCommentCreate(state, action) {
  const textComments = [...state.textComments, action.textComment],
        aggregateFeed = [...textComments, ...state.voiceRecordings],
        feed = aggregateFeed.sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });

  return {
    ...state,
    textComments: textComments,
    feed: feed,
  }
}


// function textCommentClearModifications(state, action) {
//   const textCommentIndex = state.textComments.findIndex(t => t.uuid === action.textCommentUuid),
//         textComments = [...state.textComments];
//
//   textComments[textCommentIndex].modifications = [];
//
//   const aggregateFeed = [...textComments, ...state.voiceRecordings],
//         feed = aggregateFeed.sort((a, b) => {
//           return a.timestampMilliseconds - b.timestampMilliseconds;
//         });
//
//   return {
//     ...state,
//     textComments: textComments,
//     feed: feed,
//   }
// }


function textCommentDelete(state, action) {
  const textComments = state.textComments.filter(i => i.uuid !== action.textCommentUuid),
        aggregateFeed = [...textComments, ...state.voiceRecordings],
        feed = aggregateFeed.sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });

  return {
    ...state,
    textComments: textComments,
    feed: feed,
  }
}


function voiceRecordingCreate(state, action) {
  const voiceRecordings = [...state.voiceRecordings, action.voiceRecording],
        aggregateFeed = [...state.textComments, ...voiceRecordings],
        feed = aggregateFeed.sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });

  return {
    ...state,
    voiceRecordings: voiceRecordings,
    feed: feed,
  }
}


function voiceRecordingListSet(state, action) {
  const voiceRecordings = action.voiceRecordings,
        aggregateFeed = [...state.textComments, ...voiceRecordings],
        feed = aggregateFeed.sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });

  return {
    ...state,
    voiceRecordings: action.voiceRecordings,
    feed: feed,
  }
}


function voiceRecordingDelete(state, action) {
  const voiceRecordings = state.voiceRecordings.filter(i => i.uuid !== action.voiceRecordingUuid),
        aggregateFeed = [...state.textComments, ...voiceRecordings],
        feed = aggregateFeed.sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        });

  return {
    ...state,
    voiceRecordings: voiceRecordings,
    feed: feed,
  }
}


const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "stream/set":
      return streamSet(state, action);
    case "stream/prevTrack":
      return streamPrevTrack(state, action);
    case "stream/nextTrack":
      return streamNextTrack(state, action);
    case "stream/expire":
      return streamExpire(state, action);
    case "playback/play":
      return playbackPlay(state, action);
    case "queue/listSet":
      return queueListSet(state, action);
    case "queue/deleteNode":
      return queueDeleteNode(state, action);
    case "queue/deleteChildNode":
      return queueDeleteChildNode(state, action);
    case "textComment/listSet":
      return textCommentListSet(state, action);
    case "textComment/create":
      return textCommentCreate(state, action);
    case "textComment/delete":
      return textCommentDelete(state, action);
    // case "textComment/clearModifications":
    //   return textCommentClearModifications(state, action);
    case "voiceRecording/create":
      return voiceRecordingCreate(state, action);
    case "voiceRecording/listSet":
      return voiceRecordingListSet(state, action);
    case "voiceRecording/delete":
      return voiceRecordingDelete(state, action);
    default:
      return state;
  }
}


export const store = createStore(reducer);
