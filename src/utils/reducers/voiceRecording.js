import { feedGenerate } from './feed';


/*
 * ...
 */
export const voiceRecordingListSet = function(state, payload) {
  const voiceRecordings = payload.voiceRecordings,
        updatedState = {
          ...state,
          voiceRecordings: voiceRecordings,
        };

  return {
    ...updatedState,
    feed: feedGenerate(updatedState),
  };
}


/*
 * ...
 */
export const voiceRecordingCreate = function(state, action) {
  const voiceRecordings = [...state.voiceRecordings, action.voiceRecording],
        updatedState = {
          ...state,
          voiceRecordings: voiceRecordings,
        };

  return {
    ...updatedState,
    feed: feedGenerate(updatedState),
  };
}


/*
 * ...
 */
export const voiceRecordingDelete = function(state, action) {
  const deleteByUuid = i => i.uuid !== action.voiceRecordingUuid,
        voiceRecordings = state.voiceRecordings.filter(deleteByUuid),
        updatedState = {
          ...state,
          voiceRecordings: voiceRecordings,
        };

  return {
    ...updatedState,
    feed: feedGenerate(updatedState),
  };
}


export const voiceRecordingPreloadStatusPending = function(state, payload) {
  const voiceRecordingUuid = payload.voiceRecordingUuid,
        feed = [...state.feed],
        idx = feed.findIndex(i => i.uuid === voiceRecordingUuid),
        voiceRecording  = { ...feed[idx] };

  voiceRecording.preloadStatus = 'fetching';
  feed[idx] = voiceRecording;

  const updatedState = {
    ...state,
    feed: feed,
  };

  return {
    ...updatedState,
    feed: feedGenerate(updatedState),
  };
}


export const voiceRecordingLoadFile = function(state, payload) {
  const voiceRecordingUuid = payload.voiceRecording.uuid,
        feed = [...state.feed],
        idx = feed.findIndex(i => i.uuid === voiceRecordingUuid),
        voiceRecording  = { ...feed[idx] };

  voiceRecording.preloadStatus = 'loaded';
  feed[idx] = voiceRecording;

  const updatedState = {
    ...state,
    feed: feed,
  };

  // update audio file!
  const playback = { ...state.playback },
        files = { ...state.playback.files };

  const audio = new Audio(payload.voiceRecording.audioUrl);

  files[voiceRecordingUuid] = {
    audio: audio,
  }

  return {
    ...updatedState,
    playback: {
      ...playback,
      files: files,
    },
    feed: feedGenerate(updatedState),
  };
}


export const voiceRecordingPlay = function(state, payload) {
  const voiceRecordingUuid = payload.voiceRecordingUuid,
        feed = [...state.feed],
        idx = feed.findIndex(i => i.uuid === voiceRecordingUuid),
        voiceRecording  = { ...feed[idx] };

  voiceRecording.preloadStatus = 'played';
  feed[idx] = voiceRecording;

  const updatedState = {
    ...state,
    feed: feed,
  };

  return {
    ...updatedState,
    feed: feedGenerate(updatedState),
  };
}
