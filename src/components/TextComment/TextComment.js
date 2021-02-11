import React from "react";
import { connect } from 'react-redux';
import NotableText from '../NotableText/NotableText';
import { Notation } from 'react-abc';
import styles from './TextComment.module.css';
import {
  fetchDeleteTextComment,
  fetchListDeleteTextCommentModifications,
} from './network';


function TextComment(props) {

  const textComment = props.data,
        textCommentUuid = textComment.uuid;

  const deleteTextComment = async function() {
    await fetchDeleteTextComment(textCommentUuid);
    await props.dispatch({
      type: 'textComment/delete',
      textCommentUuid: textCommentUuid,
    });
  }

  const clearModifications = async function() {
    await fetchListDeleteTextCommentModifications(textCommentUuid);
    await props.dispatch({
      type: 'textComment/clearModifications',
      textCommentUuid: textCommentUuid,
    });
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.TextComment}>

      {textComment.format === 'text' ?
        <NotableText data={textComment}></NotableText> :
        <Notation notation={textComment.text} engraverParams={{ staffwidth: 278 }}/>
      }

      {textComment.format === 'text' &&
        <button type="button" onClick={clearModifications}>
          Clear modifications
        </button>
      }

      <button type="button" onClick={deleteTextComment}>
        Delete
      </button>
    </div>
  );

}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(TextComment);
