import { getPositionMilliseconds } from '../../components/PlaybackApp/utils';


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


/*
 * ...
 */
export const voiceRecordingPause = function(state, payload) {
  const currentlyPlayingUuids = state.voiceRecordings.currentlyPlayingUuids;

  for(let voiceRecordingUuid of currentlyPlayingUuids) {
    const audio = state.playback.files[voiceRecordingUuid];
    audio.pause();
  }

  clearTimeout(state.voiceRecordingTimeoutId);

  return {
    ...state,
    voiceRecordings: {
      ...state.voiceRecordings,
      currentlyPlayingUuids: new Set(),
      update: state.voiceRecordings.update + 1,
    }
  };
}


export const voiceRecordingPlay = function(state, payload) {
  const currentlyPlayingUuids = state.voiceRecordings.currentlyPlayingUuids,
        voiceRecordingMap = { ...state.voiceRecordingMap },
        files = { ...state.playback.files },
        nowPlaying = state.queueMap[state.playback.nowPlayingUuid],
        arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
        position = arr[0],
        playback = { ...state.playback };

  let voiceRecordingUuids = [...(state.feedApp.trackMap[nowPlaying.track.uuid]?.voiceRecordingUuids || [])];
  voiceRecordingUuids = voiceRecordingUuids.filter(x => !currentlyPlayingUuids.has(x));

  for(let voiceRecordingUuid of voiceRecordingUuids) {
    const voiceRecording = voiceRecordingMap[voiceRecordingUuid],
          lowerBound = voiceRecording.timestampMilliseconds,
          upperBound = lowerBound + voiceRecording.durationMilliseconds;
    if(position < lowerBound || position > upperBound) {
      continue;
    }

    let audio = state.playback.files[voiceRecordingUuid];
    if(!audio) {
      audio = new Audio(voiceRecording.audioUrl);
      playback.files[voiceRecordingUuid] = audio;
    }
    if(!audio.paused) {
      continue;
    }

    const positionMilliseconds = position - voiceRecording.timestampMilliseconds;
    if(positionMilliseconds > 10) {
      audio.currentTime = positionMilliseconds / 1000;
    }

    audio.play();

    files[voiceRecording.uuid] = audio;
    currentlyPlayingUuids.add(voiceRecording.uuid)
  }

  return {
    ...state,
    playback,
    voiceRecordings: {
      ...state.voiceRecordings,
      currentlyPlayingUuids: currentlyPlayingUuids,
      update: state.voiceRecordings.update + 1,
    },
    voiceRecordingTimeoutId: null,
  };
}


export const voiceRecordingSchedulePlay = function(state, payload) {
  const voiceRecordingTimeoutId = payload.timeoutId;

  return { ...state, voiceRecordingTimeoutId };
}
