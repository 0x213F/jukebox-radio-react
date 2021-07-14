import { createStore } from 'redux';

import * as modal from './reducers/modal';

import {
  feedUpdate,
  feedTakeAction,
  feedAppSetContentContainer,
  feedAppSetTextComment,
  feedAppResetTextComment,
} from './reducers/feed';
import {
  markerCreate,
  markerDelete,
} from './reducers/marker';
import {
  playbackMount,
  playbackSpotify,
  playbackLoaded,
  playbackYouTube,
  playbackYouTubeTriggerAutoplay,
  playbackSetSeekTimeoutId,
  playbackClearSeekTimeoutId,
  playbackDisable,
  playbackEnable,
  playbackLoadFiles,
  playbackLoadAudius,
  playbackCycleVolumeLevelAudio,
  playbackAction,
} from './reducers/playback';
import {
  queueListSet,
  queueUpdate,
  queueDeleteNode,
  queueDeleteChildNode,
} from './reducers/queue';
import {
  mainEnable,
  mainDisable,
  mainAddAction,
  mainActionShift,
  mainActionStart,
  mainSetAutoplayTimeoutId,
  mainClearAutoplayTimeoutId,
} from './reducers/main';
import {
  streamSetWrapper,
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
  notesAppSet
} from './reducers/notesApp';
import {
  textCommentModificationCreate,
  textCommentClearModifications,
} from './reducers/textCommentModification';
import {
  voiceRecordingListSet,
  voiceRecordingCreate,
  voiceRecordingDelete,
  voiceRecordingPause,
  voiceRecordingPlay,
  voiceRecordingSchedulePlay,
} from './reducers/voiceRecording';
import {
  userSettingsUpdate,
  userGetSettings,
} from './reducers/userSettings';
import {
  sideBarSelectTab,
} from './reducers/sideBar';
import {
  searchSetService,
  searchSetQuery,
  searchSetCache,
} from './reducers/search';


const initialState = {
  nextUpQueueUuids: [],
  lastUpQueueUuids: [],
  _lastPlayed: undefined,
  userSettings: undefined,
  markerMap: {},
  queueMap: {},
  textCommentMap: {},
  voiceRecordingMap: {},
  voiceRecordings: {
    currentlyPlayingUuids: new Set(),
    update: 0,
  },
  voiceRecordingTimeoutId: -1,
  main: {
    actions: [],
    enabled: true,
    autoplayTimeoutId: false,
  },
  playback: {
    spotifyApi: undefined,
    youTubeApi: undefined,
    youTubeAutoplay: 0,
    isPlaying: false,
    // queuedUp: false,
    // addToQueueTimeoutId: undefined,
    seekTimeoutId: false,
    files: {},
    volumeLevel: {
      audio: 1.00,
      voice: 1.00,
    },
    loaded: {
      spotify: false,
      youTube: false,
      appleMusic: false,
      audius: true,
      jukeboxRadio: true,
    },
    pending: {
      spotify: false,
      youtube: false,
      appleMusic: false,
      audius: false,
      jukeboxRadio: false,
    },
    action: null,
    nowPlayingUuid: undefined,
  },
  // UI
  search: {
    service: (localStorage.getItem('searchService') || null),
    query: '',
    cache: {},
  },
  feedApp: {
    contentContainer: null,
    feed: [],
    trackMap: {},
    lastRender: {},
    textComment: {
      text: '',
      trackUuid: undefined,
      position: undefined,
    },
  },
  notesApp: {
    store: (JSON.parse(localStorage.getItem('notesStore')) || {}),
  },
  sideBar: {
    tab: null,
  },
  modal: modal.initialState(),
}


const reducer = (state = initialState, action) => {

  const reducers = {
    modal,
  };
  for(const [reducerCategory, reducerObject] of Object.entries(reducers)) {
    // reducerCategory:  e.g. "modal"
    // reducerObject:    e.g. "./reducers/modal.js"

    for(const [reducerName, reducerFunc] of Object.entries(reducerObject)) {
      // reducerName:    e.g. "close"
      // reducerFunc:    e.g. "(state, payload) => { ... }"

      if(reducerName === "initialState") {
        continue;
      }

      if(action.type === `${reducerCategory}/${reducerName}`) {
        return reducerFunc(state, action.payload);
      }
    }
  }

  switch (action.type) {
    ////////////////////////////////////////////////////////////////////////////
    // STREAM
    case "stream/set":
      return streamSetWrapper(state, action.payload);
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
    case "queue/update":
      return queueUpdate(state, action.payload);
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
      return voiceRecordingCreate(state, action.payload);
    case "voiceRecording/listSet":
      return voiceRecordingListSet(state, action.payload);
    case "voiceRecording/delete":
      return voiceRecordingDelete(state, action.payload);
    case "voiceRecording/pause":
      return voiceRecordingPause(state, action.payload);
    case "voiceRecording/play":
      return voiceRecordingPlay(state, action.payload);
    case "voiceRecording/schedulePlay":
      return voiceRecordingSchedulePlay(state, action.payload);
    ////////////////////////////////////////////////////////////////////////////
    // FEED
    case "feed/update":
      return feedUpdate(state);
    case "feed/takeAction":
      return feedTakeAction(state, action.payload);
    case "feedApp/setContentContainer":
      return feedAppSetContentContainer(state, action.payload);
    case "feedApp/setTextComment":
      return feedAppSetTextComment(state, action.payload);
    case "feedApp/resetTextComment":
      return feedAppResetTextComment(state, action.payload);
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
    ////////////////////////////////////////////////////////////////////////////
    // PLAYBACK
    case "playback/mount":
      return playbackMount(state, action.payload);
    case "playback/disable":
      return playbackDisable(state);
    case "playback/enable":
      return playbackEnable(state);
    case "playback/spotify":
      return playbackSpotify(state, action.payload);
    case "playback/loaded":
      return playbackLoaded(state, action.payload);
    case "playback/youTube":
      return playbackYouTube(state, action.payload);
    case "playback/youTubeTriggerAutoplay":
      return playbackYouTubeTriggerAutoplay(state, action.payload);
    case "playback/setSeekTimeoutId":
      return playbackSetSeekTimeoutId(state, action.payload);
    case "playback/clearSeekTimeoutId":
      return playbackClearSeekTimeoutId(state, action.payload);
    case "playback/loadFiles":
      return playbackLoadFiles(state, action.payload);
    case "playback/loadAudius":
      return playbackLoadAudius(state, action.payload);
    case "playback/cycleVolumeLevelAudio":
      return playbackCycleVolumeLevelAudio(state);
    case "playback/action":
      return playbackAction(state, action.payload);
    case "main/enable":
      return mainEnable(state, action.payload);
    case "main/disable":
      return mainDisable(state, action.payload);
    case "main/addAction":
      return mainAddAction(state, action.payload);
    case "main/actionShift":
      return mainActionShift(state, action.payload);
    case "main/actionStart":
      return mainActionStart(state, action.payload);
    case "main/setAutoplayTimeoutId":
      return mainSetAutoplayTimeoutId(state, action.payload);
    case "main/clearAutoplayTimeoutId":
      return mainClearAutoplayTimeoutId(state, action.payload);
    case "search/setService":
      return searchSetService(state, action.payload);
    case "search/setQuery":
      return searchSetQuery(state, action.payload);
    case "search/setCache":
      return searchSetCache(state, action.payload);
    case "sideBar/selectTab":
      return sideBarSelectTab(state, action.payload);
    case "notesApp/set":
      return notesAppSet(state, action.payload);
    // case "@redux/INIT":
    //   return state;
    default:
      return state;
      // throw new Error(`Unregistered Redux event: ${action.type}`);
  }
}


export const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({ trace: true }));
