import React from "react";
import { connect } from 'react-redux';
import styles from './VoiceRecording.module.css';
import { fetchDeleteVoiceRecording } from './network';


function VoiceRecording(props) {

  /*
   * 🏗
   */
  const voiceRecording = props.data,
        voiceRecordingUuid = voiceRecording.uuid;

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


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(VoiceRecording);
