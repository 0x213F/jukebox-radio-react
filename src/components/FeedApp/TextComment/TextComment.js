import React from "react";
import { connect } from 'react-redux';
import NotableText from '../NotableText/NotableText';
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
        textCommentUuid = textComment.uuid;

  /*
   * Deletes a text comment.
   */
  const deleteTextComment = async function() {
    await fetchDeleteTextComment(textCommentUuid);
    await props.dispatch({
      type: 'textComment/delete',
      textCommentUuid: textCommentUuid,
    });
  }

  /*
   * Clears all styled modifications on this text comment.
   */
  const clearModifications = async function() {
    await fetchListDeleteTextCommentModifications(textCommentUuid);
    await props.dispatch({
      type: 'textComment/clearModifications',
      textCommentUuid: textCommentUuid,
    });
  }

  let textColor;
  const now = Date.now();
  if(textComment.fadeAt > now) {
    textColor = 'black';
  } else {
    textColor = 'grey';
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.TextComment}>
      <NotableText data={textComment} textColor={textColor}></NotableText>

      <button type="button" onClick={clearModifications}>
        Clear modifications
      </button>

      <button type="button" onClick={deleteTextComment}>
        Delete
      </button>
    </div>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(TextComment);
