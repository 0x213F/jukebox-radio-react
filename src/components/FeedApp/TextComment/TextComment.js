import React, { useState } from "react";

import { connect } from 'react-redux';

import NotableText from '../NotableText/NotableText';
import { iconTrash, iconErase, iconPlay } from '../icons';

import styles from './TextComment.module.css';
import {
  fetchDeleteTextComment,
  fetchListDeleteTextCommentModifications,
} from './network';


function TextComment(props) {

  /*
   * 🏗
   */
  const textComment = props.data,
        textCommentUuid = textComment.uuid,
        stream = props.stream,
        nowPlayingTrackUuid = stream?.nowPlaying?.track?.uuid;

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
   * Deletes a text comment.
   */
  const deleteTextComment = async function() {
    const responseJson = await fetchDeleteTextComment(textCommentUuid);
    props.dispatch(responseJson.redux);
  }

  /*
   * Clears all styled modifications on this text comment.
   */
  const clearModifications = async function() {
    const responseJson = await fetchListDeleteTextCommentModifications(textCommentUuid);
    await props.dispatch(responseJson.redux);
  }

  const handleSeek = function() {
    if(stream.nowPlaying.status === 'paused') {
      props.playbackControls.play(textComment.timestampMilliseconds);
    } else {
      props.playbackControls.seek(textComment.timestampMilliseconds);
    }
  }

  // TODO: change styles with a class instead of injecting CSS
  let textColor;
  if(textComment.renderStatus === 'history') {
    textColor = 'grey';
  } else if(textComment.renderStatus === 'display') {
    textColor = 'black';
  } else {
    textColor = 'red';
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.TextCommentContainer}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}>

      <div className={styles.HoverBuffer}>
      </div>

      <div className={styles.TextComment}>
        <NotableText data={textComment} textColor={textColor}></NotableText>

        {hovering &&
          <div className={styles.HoverContainer}>
            <button type="button" onClick={deleteTextComment}>
              {iconTrash}
            </button>

            <button type="button" onClick={clearModifications}>
              {iconErase}
            </button>

            {textComment.trackUuid === nowPlayingTrackUuid &&
              <button type="button" onClick={handleSeek}>
                {iconPlay}
              </button>
            }
          </div>
        }
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({
  stream: state.stream,
});


export default connect(mapStateToProps)(TextComment);
