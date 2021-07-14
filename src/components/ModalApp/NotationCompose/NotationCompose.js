import React, { useState } from "react";

import { connect } from 'react-redux';

import { fetchTextCommentCreate } from '../../FeedApp/network';
import { iconBack } from './../../../icons';
import * as formats from './../../../config/formats';
import TheoryNotation from '../../TheoryNotation/TheoryNotation';

import styles from './NotationCompose.module.css';


function NotationCompose(props) {

  /*
   * 🏗
   */
  const textCommentTrackUuid = props.textCommentTrackUuid,
        textCommentTimestamp = props.textCommentTimestamp;

  const [isDisabled, setIsDisabled] = useState(false);
  const [text, setText] = useState('');

  const closeModal = function() {
    props.dispatch({ type: "modal/close" });
  }

  /*
   * When a user submits a new comment.
   */
  const createABCNotation = async function() {
    setIsDisabled(true);

    const responseJson = await fetchTextCommentCreate(
      text, formats.ABC_NOTATION, textCommentTrackUuid, textCommentTimestamp
    );
    props.dispatch(responseJson.redux);

    closeModal();
    setText('');
    setIsDisabled(false);
  }

  /*
   * Update the text on text change so the ABC Notation rendering can
   * re-render.
   */
  const handleTextChange = function(e) {
    setText(e.target.value);
  }

  return (
    <>
      <button className={styles.CloseModal}
              onClick={closeModal}
              disabled={isDisabled}>
        {iconBack}
      </button>

      <div className={styles.ContentContainer}>
        <div className={styles.NotationContainer}>
          <h4>
            Notation
          </h4>
          <textarea type="text"
                    name="text"
                    placeholder="text"
                    value={text}
                    spellCheck="false"
                    onChange={handleTextChange}
                    disabled={isDisabled} />
        </div>

        <div className={styles.RenderingContainer}>
          <h4>
            Rendering
          </h4>
          <div className={styles.RenderingWrapper}>
            <TheoryNotation text={text} />
          </div>
          <button onClick={createABCNotation}
                  disabled={isDisabled}>
            Post
          </button>
        </div>
      </div>
    </>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(NotationCompose);
