import React from "react";
import { connect } from 'react-redux';
import styles from './VoiceRecording.module.css';
import { fetchDeleteVoiceRecording } from './network';
import { getPositionMilliseconds } from '../../PlaybackApp/utils';


function VoiceRecording(props) {

  /*
   * 🏗
   */
  const voiceRecording = props.data,
        voiceRecordingUuid = voiceRecording.uuid,
        playback = props.playback,
        stream = props.stream;

  /*
   * Delete a voice recording.
   */
  const handleDelete = async function() {
    await fetchDeleteVoiceRecording(voiceRecordingUuid);
    props.dispatch({
      type: 'voiceRecording/delete',
      voiceRecordingUuid: voiceRecordingUuid,
    });
  }

  if(voiceRecording.preloadStatus === 'loaded' && stream.isPlaying) {
    props.dispatch({
      type: 'voiceRecording/play',
      payload: { voiceRecordingUuid },
    });
    const audio = playback.files[voiceRecordingUuid].audio,
          arr = getPositionMilliseconds(stream, stream.startedAt),
          progress = arr[0],
          voiceRecordingTimestamp = voiceRecording.timestampMilliseconds,
          voiceRecordingProgress = progress - voiceRecordingTimestamp;
    audio.currentTime = voiceRecordingProgress / 1000;
    audio.play();
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.VoiceRecording}>
      <p>
        <i>
          {
            voiceRecording.transcriptFinal === 'null' ?
              '<transcript not available>' :
              voiceRecording.transcriptFinal
          }
        </i>
      </p>
      <button type="submit" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}


const mapStateToProps = (state) => ({
  playback: state.playback,
  stream: state.stream,
});


export default connect(mapStateToProps)(VoiceRecording);
