import { store } from '../../utils/redux';
import { getPositionMilliseconds } from '../PlaybackApp/utils';


export const scheduleSpeakVoiceRecordings = function() {
  const state = store.getState(),
        feedApp = state.feedApp,
        playback = state.playback,
        queueMap = state.queueMap,
        voiceRecordingTimeoutId = state.voiceRecordingTimeoutId,
        voiceRecordingMap = state.voiceRecordingMap;

  if(voiceRecordingTimeoutId) {
    return;
  }

  const nowPlaying = queueMap[playback.nowPlayingUuid];

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
          state.dispatch({ type: "voiceRecording/play" });
        }, nextVoiceRecordingDelay);

  store.dispatch({
    type: "voiceRecording/schedulePlay",
    payload: { timeoutId },
  });
// eslint-disable-next-line
}
