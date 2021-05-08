import React, { useState, useEffect } from "react";

import { connect } from 'react-redux';

import { iconTrash } from '../icons';

import styles from './VoiceRecording.module.css';
import { fetchDeleteVoiceRecording } from './network';


function VoiceRecording(props) {

  /*
   * 🏗
   */
  const voiceRecording = props.data,
        voiceRecordingUuid = voiceRecording.uuid,
        stream = props.stream;

  const [hovering, setHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
    await fetchDeleteVoiceRecording(voiceRecordingUuid);
    props.dispatch({
      type: 'voiceRecording/delete',
      voiceRecordingUuid: voiceRecordingUuid,
    });
  }

  useEffect(function() {
    if(isPlaying) {
      return;
    }
    setIsPlaying(true);
    if(!stream.isPlaying || voiceRecording.created) {
      return;
    }
    let audio = new Audio(voiceRecording.audioUrl);
    audio.play();
  // eslint-disable-next-line
  }, [isPlaying])

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
});


export default connect(mapStateToProps)(VoiceRecording);
