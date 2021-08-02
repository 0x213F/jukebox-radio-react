import { store } from '../../../utils/redux';
import * as modalViews from '../../../config/views/modal';
import { getPositionMilliseconds } from '../utils';


export const scheduleSpeakVoiceRecordings = function() {
  const state = store.getState(),
        feedApp = state.feedApp,
        playback = state.playback,
        queueMap = state.queueMap,
        voiceRecordingTimeoutId = state.voiceRecordingTimeoutId,
        voiceRecordingMap = state.voiceRecordingMap;

  if(voiceRecordingTimeoutId > 0) {
    return;
  }

  const nowPlaying = queueMap[playback.nowPlayingUuid];
  if(!nowPlaying) {
    return;
  }

  const arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
        position = arr[0],
        voiceRecordingUuids = [...(feedApp.trackMap[nowPlaying.track.uuid]?.voiceRecordingUuids || [])];

  let voiceRecordings;
  voiceRecordings = voiceRecordingUuids.map(uuid => voiceRecordingMap[uuid]);
  voiceRecordings = voiceRecordings.filter(obj => obj.timestampMilliseconds > position);
  if(!voiceRecordings.length) {
    return;
  }
  voiceRecordings = voiceRecordings.sort(function(a, b) {
    return a.timeoutMilliseconds - b.voiceRecordings;
  });

  const nextVoiceRecordingDelay = voiceRecordings[0].timestampMilliseconds - position,
        timeoutId = setTimeout(() => {
          store.dispatch({ type: "voiceRecording/play" });
        }, nextVoiceRecordingDelay);

  store.dispatch({
    type: "voiceRecording/schedulePlay",
    payload: { timeoutId },
  });
}

export const closeModal = function() {
  store.dispatch({ type: 'main/actionStart' });
  store.dispatch({ type: "modal/close" });
  store.dispatch({ type: 'main/actionShift' });
}
