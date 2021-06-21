import React, { useState } from "react";

import { connect } from 'react-redux';

import { iconTrash } from '../icons';

import styles from './VoiceRecording.module.css';
import { fetchDeleteVoiceRecording } from './network';


function VoiceRecording(props) {

  /*
   * 🏗
   */
  const voiceRecordingUuid = props.voiceRecordingUuid,
        voiceRecording = props.voiceRecordingMap[voiceRecordingUuid];

  const [hovering, setHovering] = useState(false);

  /*
   * When the mouse enters the area, show the contextual buttons.
   */
  const onMouseEnter = function() {
    setHovering(true);
  }

  /*
   * When the mouse leaves the area, hide the contextual buttons.
   */
  const onMouseLeave = function() {
    setHovering(false);
  }

  /*
   * Delete a voice recording.
   */
  const handleDelete = async function() {
    const responseJson = await fetchDeleteVoiceRecording(voiceRecordingUuid);
    props.dispatch(responseJson.redux);
  }

  if(!voiceRecording) {
    return (
      <div className={styles.VoiceRecordingContainer}>
        <div className={styles.VoiceRecordingDeleted}>
          <p>Redacted</p>
        </div>
      </div>
    );
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
          {
            voiceRecording.transcriptFinal === 'null' ?
              '<transcript not available>' :
              voiceRecording.transcriptFinal
          }
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


const mapStateToProps = (state) => ({
  stream: state.stream,
  voiceRecordingMap: state.voiceRecordingMap,
});


export default connect(mapStateToProps)(VoiceRecording);
