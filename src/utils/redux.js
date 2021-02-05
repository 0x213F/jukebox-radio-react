import { createStore } from 'redux';
import {
  markerCreate,
  markerDelete,
  markerList,
} from './reducers/marker';
import { playerSpotify } from './reducers/player';
import { queueListSet } from './reducers/queue';
import {
  queueIntervalCreate,
  queueIntervalDelete,
} from './reducers/queueInterval';
import {
  streamSet,
  streamPlay,
  streamPause,
  streamPrevTrack,
  streamNextTrack,
} from './reducers/stream';
import {
  textCommentListSet,
} from './reducers/textComment';
import {
  voiceRecordingListSet,
} from './reducers/voiceRecording';


const initialState = {
  nextUpQueues: [],
  lastUpQueues: [],
  _lastPlayed: undefined,
  textComments: [],
  voiceRecordings: [],
  feed: [],
  userSettings: undefined,
  trackMarkerMap: {},
}


function streamExpire(state, action) {
  const stream = { ...state.stream },
        _lastPlayed = stream.nowPlaying;

  stream.isPlaying = false;
  stream.isPaused = false;
  stream.nowPlaying = undefined;

  return { ...state, stream: stream, _lastPlayed: _lastPlayed };
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

function userGetSettings(state, action) {
  return {
    ...state,
    userSettings: action.userSettings,
  }
}


const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "stream/set":
      return streamSet(state, action.payload);
    case "stream/play":
      return streamPlay(state, action.payload);
    case "stream/pause":
      return streamPause(state, action.payload);
    case "stream/prevTrack":
      return streamPrevTrack(state, action.payload);
    case "stream/nextTrack":
      return streamNextTrack(state, action.payload);
    case "stream/expire":
      return streamExpire(state, action);
    case "queue/listSet":
      return queueListSet(state, action.payload);
    case "queue/deleteNode":
      return queueDeleteNode(state, action);
    case "queue/deleteChildNode":
      return queueDeleteChildNode(state, action);
    case "textComment/listSet":
      return textCommentListSet(state, action.payload);
    case "textComment/create":
      return textCommentCreate(state, action);
    case "textComment/delete":
      return textCommentDelete(state, action);
    // case "textComment/clearModifications":
    //   return textCommentClearModifications(state, action);
    case "voiceRecording/create":
      return voiceRecordingCreate(state, action);
    case "voiceRecording/listSet":
      return voiceRecordingListSet(state, action.payload);
    case "voiceRecording/delete":
      return voiceRecordingDelete(state, action);
    case "user/get-settings":
      return userGetSettings(state, action);
    case "marker/create":
      return markerCreate(state, action.payload);
    case "marker/delete":
      return markerDelete(state, action.payload);
    case "marker/list":
      return markerList(state, action.payload);
    case "queueInterval/create":
      return queueIntervalCreate(state, action.payload);
    case "queueInterval/delete":
      return queueIntervalDelete(state, action.payload);
    case "player/spotify":
      return playerSpotify(state, action.payload);
    default:
      return state;
  }
}


export const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
