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
