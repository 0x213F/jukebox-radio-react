import React, { useState } from "react";
import Modal from 'react-modal';

import { connect } from 'react-redux';

import { fetchTextCommentCreate } from './../network';
import { iconBack } from './../../../icons';
import { FORMAT_ABC_NOTATION } from '../constants';
import TheoryNotation from '../TheoryNotation/TheoryNotation';

import styles from './ABCNotationCompose.module.css';


function ABCNotationCompose(props) {

  /*
   * 🏗
   */
  const textCommentTrackUuid = props.textCommentTrackUuid,
        textCommentTimestamp = props.textCommentTimestamp,
        isOpen = props.isOpen,
        closeModal = props.closeModal;

  const [isDisabled, setIsDisabled] = useState(false);
  const [text, setText] = useState('');

  /*
   * When a user submits a new comment.
   */
  const createABCNotation = async function() {
    setIsDisabled(true);

    const responseJson = await fetchTextCommentCreate(
      text, FORMAT_ABC_NOTATION, textCommentTrackUuid, textCommentTimestamp
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
    <Modal isOpen={isOpen}
           ariaHideApp={false}
           className={styles.Modal}
           overlayClassName={styles.ModalOverlay}>
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

    </Modal>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(ABCNotationCompose);
