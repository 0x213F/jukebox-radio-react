import React, { useState } from "react";
import Modal from 'react-modal';
import styles from './Upload.module.css';
import modalStyles from '../../styles/Modal.module.css';

import { fetchCreateTrack } from './network';

import { iconBack } from './../../icons';


function Upload(props) {

  /*
   * 🏗
   */
  const [inputKey, setInputKey] = useState(0);

  const [isDisabled, setIsDisabled] = useState(false);
  const [audioFile, setAudioFile] = useState('');
  const [imageFile, setImageFile] = useState('');
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');

  const isOpen = props.isOpen,
        closeModal = props.closeModal;

  /*
   * When the user initializes a login attempt.
   */
  const handleSubmit = async function() {

    // Hit the server.
    setIsDisabled(true);
    await fetchCreateTrack(
      audioFile,
      imageFile,
      trackName,
      artistName,
      albumName,
    );

    // Reset the form.
    setIsDisabled(false);
    setInputKey(prev => prev + 2);
    setTrackName('');
    setArtistName('');
    setAlbumName('');

    // Close the modal.
    closeModal();
  }

  return (
    <Modal isOpen={isOpen}
           ariaHideApp={false}
           className={modalStyles.Modal}
           overlayClassName={modalStyles.ModalOverlay}>

      <button className={modalStyles.CloseModal}
              onClick={closeModal}>
        {iconBack}
      </button>

      <div className={styles.Login}>
        <h3>Upload</h3>

        <label className={styles.FormBlock}>
          Audio file
          <input type="file"
                 name="audioFile"
                 onChange={(e) => {setAudioFile(e.target.files[0])}}
                 disabled={isDisabled}
                 key={inputKey} />
        </label>

        <label className={styles.FormBlock}>
          Image file
          <input type="file"
                 name="imageFile"
                 onChange={(e) => {setImageFile(e.target.files[0])}}
                 disabled={isDisabled}
                 key={inputKey + 1} />
        </label>

        <label className={styles.FormBlock}>
          Track name
          <input type="text"
                 name="trackName"
                 placeholder="Track name"
                 value={trackName}
                 onChange={(e) => {setTrackName(e.target.value)}}
                 disabled={isDisabled} />
        </label>

        <label className={styles.FormBlock}>
          Artist name
          <input type="text"
                 name="artistName"
                 placeholder="Artist name"
                 value={artistName}
                 onChange={(e) => {setArtistName(e.target.value)}}
                 disabled={isDisabled} />
        </label>

        <label className={styles.FormBlock}>
          Album name
          <input type="text"
                 name="albumName"
                 placeholder="Album name"
                 value={albumName}
                 onChange={(e) => {setAlbumName(e.target.value)}}
                 disabled={isDisabled} />
        </label>

        <br></br>

        <div className={styles.FormBlock}>
          <button type="submit"
                  onClick={handleSubmit}
                  disabled={isDisabled}>
            Submit
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default Upload;
