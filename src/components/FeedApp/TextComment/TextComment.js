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
  const textCommentUuid = props.textCommentUuid,
        textComment = props.textCommentMap[textCommentUuid],
        stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid],
        nowPlayingTrackUuid = nowPlaying?.track?.uuid;

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
    if(nowPlaying.status === 'paused') {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "play",
            timestampMilliseconds: textComment.timestampMilliseconds,
            status: "kickoff",
            fake: { api: false },
          },
        },
      });
    } else {
      const action = {
        name: "seek",
        timestampMilliseconds: textComment.timestampMilliseconds,
        status: "kickoff",
        fake: false,
      };
      props.dispatch({
        type: "main/addAction",
        payload: { action },
      });
    }
  }

  if(!textComment) {
    return (
      <div className={styles.TextCommentContainer}>

        <div className={styles.TextCommentDeleted}>
          <p>Retracted</p>
        </div>
      </div>
    );
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
        <NotableText textCommentUuid={textCommentUuid}></NotableText>

        {hovering &&
          <div className={styles.HoverContainer}>
            <button type="button" onClick={deleteTextComment}>
              {iconTrash}
            </button>

            <button type="button" onClick={clearModifications} style={{top: "-1px"}}>
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
  queueMap: state.queueMap,
  textCommentMap: state.textCommentMap,
});


export default connect(mapStateToProps)(TextComment);
