import React from "react";
import { connect } from 'react-redux';
import { Notation } from 'react-abc';
import styles from './ABCNotationDisplay.module.css';
import { fetchDeleteTextComment } from '../TextComment/network';


function ABCNotationDisplay(props) {

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
    const responseJson = await fetchDeleteTextComment(abcNotationUuid);
    props.dispatch(responseJson.redux);
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.ABCNotationDisplay}>

      <Notation notation={abcNotation.text}
                engraverParams={{ staffwidth: 278 }}/>

      <button type="button" onClick={deleteAbcNotation}>
        Delete
      </button>
    </div>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(ABCNotationDisplay);
