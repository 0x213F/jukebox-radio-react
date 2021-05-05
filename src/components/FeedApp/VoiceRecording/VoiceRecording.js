import React, { useState } from "react";
import { connect } from 'react-redux';
import styles from './VoiceRecording.module.css';
import { fetchDeleteVoiceRecording } from './network';
import { iconTrash } from '../icons';


function VoiceRecording(props) {

  /*
   * 🏗
   */
  const voiceRecording = props.data,
        voiceRecordingUuid = voiceRecording.uuid;

  const [hovering, setHovering] = useState(false);

  const onMouseEnter = function() {
    setHovering(true);
  }

  const onMouseLeave = function() {
    setHovering(false);
  }

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
    <div className={styles.VoiceRecordingContainer}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}>

      <div className={styles.HoverBuffer}>
      </div>

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

        {hovering &&
          <div className={styles.HoverContainer}>
            <button type="button" onClick={handleDelete}>
              {iconTrash}
            </button>
          </div>
        }
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(VoiceRecording);
