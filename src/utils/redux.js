import { createStore } from 'redux';
import { feedUpdate } from './reducers/feed';
import {
  markerCreate,
  markerDelete,
  markerList,
} from './reducers/marker';
import {
  playbackSpotify,
  playbackAddToQueue,
  playbackPlannedNextTrack,
  playbackStart,
  playbackStarted,
  playbackAddToQueueReschedule,
  playbackAddToQueueScheduled,
  playbackNextSeekScheduled,
  playbackDisable,
  playbackEnable,
  playbackLoadFiles,
} from  './reducers/playback';
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
  textCommentCreate,
  textCommentDelete,
} from './reducers/textComment';
import {
  textCommentModificationCreate,
} from './reducers/textCommentModification';
import {
  voiceRecordingListSet,
  voiceRecordingCreate,
  voiceRecordingPreloadStatusPending,
  voiceRecordingLoadFile,
  voiceRecordingPlay,
  voiceRecordingDelete,
} from './reducers/voiceRecording';
import {
  userSettingsUpdate,
} from './reducers/userSettings';


const initialState = {
  nextUpQueues: [],
  lastUpQueues: [],
  _lastPlayed: undefined,
  textComments: [],
  voiceRecordings: [],
  feed: [],
  userSettings: undefined,
  trackMarkerMap: {},
  playback: {
    controlsEnabled: false,
    spotifyApi: undefined,
    isPlaying: false,
    queuedUp: false,
    noopNextTrack: false,
    addToQueueTimeoutId: undefined,
    isReady: false,
    files: {},
  },
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


function textCommentClearModifications(state, action) {
  const textCommentIndex = state.textComments.findIndex(t => t.uuid === action.textCommentUuid),
        textComments = [...state.textComments];

  textComments[textCommentIndex].modifications = [];

  return {
    ...state,
    textComments: textComments,
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
    case "textCommentModification/create":
      return textCommentModificationCreate(state, action.payload);
    case "textComment/clearModifications":
      return textCommentClearModifications(state, action);
    case "voiceRecording/create":
      return voiceRecordingCreate(state, action);
    case "voiceRecording/preloadStatusPending":
      return voiceRecordingPreloadStatusPending(state, action.payload);
    case "voiceRecording/loadFile":
      return voiceRecordingLoadFile(state, action.payload);
    case "voiceRecording/play":
      return voiceRecordingPlay(state, action.payload);
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
    case "playback/disable":
      return playbackDisable(state);
    case "playback/enable":
      return playbackEnable(state);
    case "playback/spotify":
      return playbackSpotify(state, action.payload);
    case "playback/addToQueue":
      return playbackAddToQueue(state);
    case "playback/plannedNextTrack":
      return playbackPlannedNextTrack(state, action.payload);
    case "playback/start":
      return playbackStart(state);
    case "playback/started":
      return playbackStarted(state);
    case "playback/addToQueueReschedule":
      return playbackAddToQueueReschedule(state);
    case "playback/addToQueueScheduled":
      return playbackAddToQueueScheduled(state, action.payload);
    case "playback/nextSeekScheduled":
      return playbackNextSeekScheduled(state, action.payload);
    case "userSettings/update":
      return userSettingsUpdate(state, action.payload);
    case "playback/loadFiles":
      return playbackLoadFiles(state, action.payload);
    case "feed/update":
      return feedUpdate(state);
    default:
      return state;
  }
}


export const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({ trace: true }));
