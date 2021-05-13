import { createStore } from 'redux';
import { feedUpdate } from './reducers/feed';
import {
  markerCreate,
  markerDelete,
  markerList,
} from './reducers/marker';
import {
  playbackAppleMusic,
  playbackSpotify,
  playbackYouTube,
  playbackYouTubeTriggerAutoplay,
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
  playbackLoadAudius,
  playbackCycleVolumeLevelAudio,
} from './reducers/playback';
import {
  queueListSet,
  queueDeleteNode,
  queueDeleteChildNode,
} from './reducers/queue';
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
  textCommentClearModifications,
} from './reducers/textCommentModification';
import {
  voiceRecordingListSet,
  voiceRecordingCreate,
  voiceRecordingDelete,
} from './reducers/voiceRecording';
import {
  userSettingsUpdate,
  userGetSettings,
} from './reducers/userSettings';
import {
  sideBarSelectTab,
} from './reducers/sideBar';


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
    youTubeApi: undefined,
    youTubeAutoplay: 0,
    appleMusic: {},
    isPlaying: false,
    queuedUp: false,
    noopNextTrack: false,
    addToQueueTimeoutId: undefined,
    isReady: false,
    files: {},
    volumeLevel: {
      audio: 1.00,
      voice: 1.00,
    },
  },
  // UI
  search: {
    serviceSpotify: true,
    serviceYouTube: true,
    serviceAppleMusic: true,
    serviceJukeboxRadio: true,
    serviceAudius: true,
  },
  sideBar: {
    tab: null,
  }
}


const searchToggleServiceOff = function(state, payload) {
  return {
    ...state,
    search : {
      serviceSpotify: false,
      serviceYouTube: false,
      serviceAppleMusic: false,
      serviceJukeboxRadio: false,
      serviceAudius: false,
      ...payload
    }
  }
}

const searchToggleService = function(state, payload) {
  const newState = { ...state },
        newSearch = { ...state.search };

  newSearch[payload.serviceName] = !newSearch[payload.serviceName]
  newState.search = newSearch;
  return newState;
}


const reducer = (state = initialState, action) => {
  switch (action.type) {
    ////////////////////////////////////////////////////////////////////////////
    // STREAM
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
    ////////////////////////////////////////////////////////////////////////////
    // QUEUE
    case "queue/listSet":
      return queueListSet(state, action.payload);
    case "queue/deleteNode":
      return queueDeleteNode(state, action);
    case "queue/deleteChildNode":
      return queueDeleteChildNode(state, action);
    case "textComment/listSet":
    ////////////////////////////////////////////////////////////////////////////
    // TEXT COMMENT
      return textCommentListSet(state, action.payload);
    case "textComment/create":
      return textCommentCreate(state, action.payload);
    case "textComment/delete":
      return textCommentDelete(state, action.payload);
    case "textCommentModification/create":
      return textCommentModificationCreate(state, action.payload);
    case "textComment/clearModifications":
      return textCommentClearModifications(state, action.payload);
    ////////////////////////////////////////////////////////////////////////////
    // VOICE RECORDING
    case "voiceRecording/create":
      return voiceRecordingCreate(state, action);
    case "voiceRecording/listSet":
      return voiceRecordingListSet(state, action.payload);
    case "voiceRecording/delete":
      return voiceRecordingDelete(state, action);
    ////////////////////////////////////////////////////////////////////////////
    // FEED
    case "feed/update":
      return feedUpdate(state);
    ////////////////////////////////////////////////////////////////////////////
    // USER
    case "user/get-settings":
      return userGetSettings(state, action);
    case "userSettings/update":
      return userSettingsUpdate(state, action.payload);
    ////////////////////////////////////////////////////////////////////////////
    // MARKER
    case "marker/create":
      return markerCreate(state, action.payload);
    case "marker/delete":
      return markerDelete(state, action.payload);
    case "marker/list":
      return markerList(state, action.payload);
    ////////////////////////////////////////////////////////////////////////////
    // QUEUE INTERVAL
    case "queueInterval/create":
      return queueIntervalCreate(state, action.payload);
    case "queueInterval/delete":
      return queueIntervalDelete(state, action.payload);
    ////////////////////////////////////////////////////////////////////////////
    // PLAYBACK
    case "playback/disable":
      return playbackDisable(state);
    case "playback/enable":
      return playbackEnable(state);
    case "playback/appleMusic":
      return playbackAppleMusic(state, action.payload);
    case "playback/spotify":
      return playbackSpotify(state, action.payload);
    case "playback/youTube":
      return playbackYouTube(state, action.payload);
    case "playback/youTubeTriggerAutoplay":
      return playbackYouTubeTriggerAutoplay(state, action.payload);
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
    case "playback/loadFiles":
      return playbackLoadFiles(state, action.payload);
    case "playback/loadAudius":
      return playbackLoadAudius(state, action.payload);
    case "playback/cycleVolumeLevelAudio":
      return playbackCycleVolumeLevelAudio(state);
    case "search/toggleServiceOff":
      return searchToggleServiceOff(state, action.payload);
    case "search/toggleService":
      return searchToggleService(state, action.payload);
    case "sideBar/selectTab":
      return sideBarSelectTab(state, action.payload);
    // case "@redux/INIT":
    //   return state;
    default:
      return state;
      // throw new Error(`Unregistered Redux event: ${action.type}`);
  }
}


export const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({ trace: true }));
