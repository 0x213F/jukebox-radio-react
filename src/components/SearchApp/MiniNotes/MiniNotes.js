import React from 'react';

import { connect } from 'react-redux';

import {
  SERVICE_YOUTUBE,
  SERVICE_APPLE_MUSIC,
} from '../../../config/services';
import styles from './MiniNotes.module.css';



function MiniNotes(props) {

  const notesApp = props.notesApp,
        stream = props.stream,
        playback = props.playback,
        queueMap = props.queueMap,
        content = notesApp.store[stream.uuid],
        nowPlaying = queueMap[playback.nowPlayingUuid];

  const handleTextChange = function(e) {
    const nextContent = e.target.value;
    props.dispatch({
      type: "notesApp/set",
      payload: { key: stream.uuid, value: nextContent },
    });
  }

  let extraStyle;
  if((nowPlaying?.track?.service === SERVICE_YOUTUBE || nowPlaying?.track?.service === SERVICE_APPLE_MUSIC) && nowPlaying?.track?.format === 'video') {
    if(stream.nowPlayingUuid === playback.nowPlayingUuid) {
      extraStyle = {
        marginTop: "205px",
      };
    } else {
      extraStyle = {};
    }
  } else {
    extraStyle = {};
  }


  return (
    <div className={styles.MiniNotes} style={extraStyle}>
      <h3>Notes</h3>
      <textarea value={content}
                spellCheck="false"
                onChange={handleTextChange}>
      </textarea>
    </div>
  );
}


const mapStateToProps = (state) => ({
  notesApp: state.notesApp,
  stream: state.stream,
  playback: state.playback,
  queueMap: state.queueMap,
});


export default connect(mapStateToProps)(MiniNotes);
