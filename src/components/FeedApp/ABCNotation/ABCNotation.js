import React from "react";
import { connect } from 'react-redux';
import { Notation } from 'react-abc';
import styles from './ABCNotation.module.css';
import { fetchDeleteTextComment } from '../TextComment/network';


function ABCNotation(props) {

  /*
   * 🏗
   */
  const abcNotation = props.data,
        abcNotationUuid = abcNotation.uuid;

  /*
   * Deletes a music notation graphic.
   *
   * NOTE: ABCNotation is a proxy model of TextComment. Everything underneath
   * the hood runs inside TextComment.
   */
  const deleteAbcNotation = async function() {
    await fetchDeleteTextComment(abcNotationUuid);
    await props.dispatch({
      type: 'textComment/delete',
      textCommentUuid: abcNotationUuid,
    });
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.ABCNotation}>

      <Notation notation={abcNotation.text}
                engraverParams={{ staffwidth: 278 }}/>

      <button type="button" onClick={deleteAbcNotation}>
        Delete
      </button>
    </div>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(ABCNotation);
