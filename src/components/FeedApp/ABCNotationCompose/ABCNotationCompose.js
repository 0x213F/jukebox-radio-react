import React, { useState } from "react";
import Modal from 'react-modal';
import { Notation } from 'react-abc';
import { connect } from 'react-redux';
import { fetchTextCommentCreate } from './../network';


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
           ariaHideApp={false}>
      <button onClick={closeModal}
              disabled={isDisabled}>
        Close
      </button>

      <br></br><br></br>

      <div>
        <textarea type="text"
                  name="text"
                  placeholder="text"
                  value={text}
                  onChange={handleTextChange}
                  disabled={isDisabled} />

        <Notation notation={text}
                  engraverParams={{ staffwidth: 278 }}/>
      </div>

      <button onClick={createABCNotation}
              disabled={isDisabled}>
        Post
      </button>
    </Modal>
  );
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(ABCNotationCompose);
