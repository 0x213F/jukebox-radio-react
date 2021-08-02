import React, { useState } from "react";
import { connect } from 'react-redux';

import styles from './Upload.module.css';

import { fetchCreateTrack } from './network';

import { iconBack } from './../../../icons';


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

  const closeModal = function() {
    props.dispatch({ type: "modal/close" });
  }

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
    props.dispatch({ type: 'modal/close' });
  }

  return (
    <>
      <button className={styles.ModalClose}
              onClick={closeModal}>
        {iconBack}
      </button>

      <div className={styles.ModalContent}>
        <h3 className={styles.Title}>Upload</h3>

        <label className={styles.FormLabel}>
          <span>Audio file</span>
          <input type="file"
                 name="audioFile"
                 onChange={(e) => {setAudioFile(e.target.files[0])}}
                 disabled={isDisabled}
                 className={styles.FileInput}
                 key={inputKey} />
        </label>

        <label className={styles.FormLabel}>
          <span>Image file</span>
          <input type="file"
                 name="imageFile"
                 onChange={(e) => {setImageFile(e.target.files[0])}}
                 disabled={isDisabled}
                 className={styles.FileInput}
                 key={inputKey + 1} />
        </label>

        <label className={styles.FormLabel}>
          <span>Track name</span>
          <input type="text"
                 name="trackName"
                 placeholder="Track name"
                 value={trackName}
                 spellCheck="false"
                 onChange={(e) => {setTrackName(e.target.value)}}
                 disabled={isDisabled} />
        </label>

        <label className={styles.FormLabel}>
          <span>Artist name</span>
          <input type="text"
                 name="artistName"
                 placeholder="Artist name"
                 value={artistName}
                 spellCheck="false"
                 onChange={(e) => {setArtistName(e.target.value)}}
                 disabled={isDisabled} />
        </label>

        <label className={styles.FormLabel}>
          <span>Album name</span>
          <input type="text"
                 name="albumName"
                 placeholder="Album name"
                 value={albumName}
                 spellCheck="false"
                 onChange={(e) => {setAlbumName(e.target.value)}}
                 disabled={isDisabled} />
        </label>

        <button type="submit"
                className={styles.FormSubmit}
                onClick={handleSubmit}
                disabled={isDisabled}>
          Submit
        </button>
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(Upload);
