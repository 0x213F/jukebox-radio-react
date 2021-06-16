/*
 * ...
 */
export const voiceRecordingListSet = function(state, payload) {
  const voiceRecordings = payload.voiceRecordings,
        trackUuid = payload.trackUuid,
        voiceRecordingMap = { ...state.voiceRecordingMap },
        feedApp = { ...state.feedApp },
        trackMap = { ...state.feedApp.trackMap };

  for(let voiceRecording of voiceRecordings) {
    voiceRecordingMap[voiceRecording.uuid] = voiceRecording;
  }

  if(!trackMap.hasOwnProperty(trackUuid)) {
    trackMap[trackUuid] = {};
  }
  const voiceRecordingUuids = voiceRecordings.map(obj => obj.uuid);
  trackMap[trackUuid].voiceRecordingUuids = voiceRecordingUuids;
  feedApp.trackMap = trackMap;

  return { ...state, feedApp, voiceRecordingMap };
}


/*
 * ...
 */
export const voiceRecordingCreate = function(state, payload) {
  const voiceRecording = payload.voiceRecording,
        trackUuid = voiceRecording.trackUuid,
        voiceRecordingMap = { ...state.voiceRecordingMap },
        feedApp = { ...state.feedApp },
        voiceRecordingUuids = [...state.feedApp.trackMap[trackUuid].voiceRecordingUuids];

  // TODO: set lastRender

  voiceRecording.forceDisplay = true;
  voiceRecordingMap[voiceRecording.uuid] = voiceRecording;
  voiceRecordingUuids.push(voiceRecording.uuid);
  feedApp.trackMap[trackUuid].voiceRecordingUuids = voiceRecordingUuids;

  return { ...state, feedApp, voiceRecording, voiceRecordingMap };
}


/*
 * ...
 */
export const voiceRecordingDelete = function(state, payload) {
  const voiceRecordingUuid = payload.voiceRecordingUuid,
        trackUuid = payload.trackUuid,
        voiceRecordingMap = { ...state.voiceRecordingMap },
        feedApp = { ...state.feedApp },
        trackMap = { ...state.feedApp.trackMap };

  let voiceRecordingUuids;
  const deleteByUuid = uuid => uuid !== voiceRecordingUuid;
  voiceRecordingUuids = [...trackMap[trackUuid].voiceRecordingUuids];
  voiceRecordingUuids = voiceRecordingUuids.filter(deleteByUuid);

  trackMap[trackUuid].voiceRecordingUuids = voiceRecordingUuids;
  feedApp.trackMap = trackMap;

  delete voiceRecordingMap[voiceRecordingUuid];

  return { ...state, feedApp, voiceRecordingMap };
}
