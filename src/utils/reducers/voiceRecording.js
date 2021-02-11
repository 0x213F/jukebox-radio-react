import { generateFeed } from './feed';


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
    feed: generateFeed(updatedState),
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
    feed: generateFeed(updatedState),
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
    feed: generateFeed(updatedState),
  };
}
