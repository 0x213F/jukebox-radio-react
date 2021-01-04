import React from "react";
import styles from './VoiceRecording.module.css';
import { fetchDeleteVoiceRecording } from './network';


function VoiceRecording(props) {

  /*
   * When the user deletes a text comment.
   */
  const handleDelete = async function(e) {
    e.preventDefault();
    const voiceRecordingUuid = props.data.uuid;
    await fetchDeleteVoiceRecording(voiceRecordingUuid);
    await props.destroy(voiceRecordingUuid);
  }

  /*
   * 🎨
   */
  const voiceRecording = props.data;
  return (
    <div className={styles.VoiceRecording}>
      <p><i>
        {
          voiceRecording.transcriptFinal === 'null' ?
          '<transcript not available>' : voiceRecording.transcriptFinal
        }
      </i></p>
      <form onSubmit={async (e) => { await handleDelete(e); }}>
        <button type="submit">
          Delete
        </button>
      </form>
    </div>
  );

}

export default VoiceRecording;
