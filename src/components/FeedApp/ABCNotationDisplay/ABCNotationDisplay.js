import React, { useState } from "react";

import { connect } from 'react-redux';
import { Notation } from 'react-abc';

import { fetchDeleteTextComment } from '../TextComment/network';
import { iconTrash } from '../icons';

import styles from './ABCNotationDisplay.module.css';


function ABCNotationDisplay(props) {

  /*
   * 🏗
   */
  const abcNotationUuid = props.textCommentUuid,  // yes
        abcNotation = props.textCommentMap[abcNotationUuid];  // yes

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
   * Deletes a music notation graphic.
   *
   * NOTE: ABCNotation is a proxy model of TextComment. Everything underneath
   * the hood runs inside TextComment.
   */
  const deleteAbcNotation = async function() {
    const responseJson = await fetchDeleteTextComment(abcNotationUuid);
    props.dispatch(responseJson.redux);
  }

  if(!abcNotation) {
    return (
      <div className={styles.ABCNotationDisplayContainer}>
        <div className={styles.ABCNotationDisplayDeleted}>
          <p>Redacted</p>
        </div>
      </div>
    );
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.ABCNotationDisplayContainer}
         onMouseEnter={onMouseEnter}
         onMouseLeave={onMouseLeave}>

      <div className={styles.HoverBuffer}>
      </div>

      <div className={styles.ABCNotationDisplay}>
        <Notation notation={abcNotation.text}
                  engraverParams={{ staffwidth: 278 }} />

        {hovering &&
          <div className={styles.HoverContainer}>
            <button type="button" onClick={deleteAbcNotation}>
              {iconTrash}
            </button>
          </div>
        }
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({
  textCommentMap: state.textCommentMap,
});


export default connect(mapStateToProps)(ABCNotationDisplay);
