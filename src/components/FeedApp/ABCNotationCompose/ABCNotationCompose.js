import React, { useState } from "react";
import Modal from 'react-modal';
import { Notation } from 'react-abc';
import { connect } from 'react-redux';
import { fetchTextCommentCreate } from './../network';
import styles from './ABCNotationCompose.module.css';
import { iconBack } from './../../../icons';


function ABCNotationCompose(props) {

  /*
   * 🏗
   */
  const trackUuid = props.trackUuid,
        textCommentTimestamp = props.textCommentTimestamp,
        format = 'abc_notation',
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
      text, format, trackUuid, textCommentTimestamp
    );

    props.dispatch(responseJson.redux);
    closeModal();
    setText('');
    setIsDisabled(false);
  }

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
                    spellcheck="false"
                    onChange={handleTextChange}
                    disabled={isDisabled} />
        </div>

        <div className={styles.RenderingContainer}>
          <h4>
            Rendering
          </h4>
          <div className={styles.RenderingWrapper}>
            <Notation notation={text}
                      engraverParams={{ staffwidth: 278 }}/>
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
