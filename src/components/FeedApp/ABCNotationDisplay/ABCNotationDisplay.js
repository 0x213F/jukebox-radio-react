import React, { useState } from "react";
import { connect } from 'react-redux';
import { Notation } from 'react-abc';
import styles from './ABCNotationDisplay.module.css';
import { fetchDeleteTextComment } from '../TextComment/network';
import { iconTrash } from '../icons';


function ABCNotationDisplay(props) {

  /*
   * 🏗
   */
  const abcNotation = props.data,
        abcNotationUuid = abcNotation.uuid;

  const [hovering, setHovering] = useState(false);

  const onMouseEnter = function() {
    setHovering(true);
  }

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


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(ABCNotationDisplay);
