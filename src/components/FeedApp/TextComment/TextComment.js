import React, { useState } from "react";
import { connect } from 'react-redux';
import NotableText from '../NotableText/NotableText';
import styles from './TextComment.module.css';
import {
  fetchDeleteTextComment,
  fetchListDeleteTextCommentModifications,
} from './network';
import { iconTrash, iconErase } from '../icons';


function TextComment(props) {

  /*
   * 🏗
   */
  const textComment = props.data,
        textCommentUuid = textComment.uuid;

  const [hovering, setHovering] = useState(false);

  const onMouseEnter = function() {
    setHovering(true);
  }

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
          </div>
        }
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(TextComment);
