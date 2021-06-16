import React, { useState, useEffect } from "react";

import { connect } from 'react-redux';

import { iconTrash } from '../icons';

import styles from './VoiceRecording.module.css';
import { getPositionMilliseconds } from '../../PlaybackApp/utils';
import { fetchDeleteVoiceRecording } from './network';


function VoiceRecording(props) {

  /*
   * 🏗
   */
  const voiceRecordingUuid = props.voiceRecordingUuid,
        voiceRecording = props.voiceRecordingMap[voiceRecordingUuid],
        stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid];

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
    const responseJson = await fetchDeleteVoiceRecording(voiceRecordingUuid);
    props.dispatch(responseJson.redux);
  }

  useEffect(function() {
    if(isPlaying) {
      return;
    }

    setIsPlaying(true);
    if(nowPlaying.status !== "played" || voiceRecording?.created) {
      return;
    }

    const arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
          position = arr[0],
          withinContext = (
            voiceRecording.timestampMilliseconds >= position - 2000 &&
            voiceRecording.timestampMilliseconds <= position + 2000
          );
    if(!withinContext) {
      return;
    }

    let audio = new Audio(voiceRecording.audioUrl);
    audio.play();
  // eslint-disable-next-line
  }, [isPlaying])

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
  queueMap: state.queueMap,
  voiceRecordingMap: state.voiceRecordingMap,
});


export default connect(mapStateToProps)(VoiceRecording);
