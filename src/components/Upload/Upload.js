import React, { useState } from "react";
import styles from './Upload.module.css';

import { fetchCreateTrack } from './network';


function Upload(props) {

  /*
   * 🏗
   */
  const [audioFile, setAudioFile] = useState('');
  const [imageFile, setImageFile] = useState('');
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [albumName, setAlbumName] = useState('');

  /*
   * When the user initializes a login attempt.
   */
  const handleSubmit = async function(e) {
    e.preventDefault();
    await fetchCreateTrack(
      audioFile,
      imageFile,
      trackName,
      artistName,
      albumName,
    );
    setTrackName('');
    setArtistName('');
    setAlbumName('');
  }

  return (
    <form className={styles.Login} onSubmit={async (e) => { await handleSubmit(e); }}>
      <h3>Upload</h3>

      <label className={styles.FormBlock}>
        Audio file
        <input type="file"
               name="audioFile"
               onChange={(e) => {setAudioFile(e.target.files[0])}} />
      </label>

      <label className={styles.FormBlock}>
        Image file
        <input type="file"
               name="imageFile"
               onChange={(e) => {setImageFile(e.target.files[0])}} />
      </label>

      <br></br>

      <label className={styles.FormBlock}>
        Track name
        <input type="text"
               name="trackName"
               placeholder="Track name"
               value={trackName}
               onChange={(e) => {setTrackName(e.target.value)}} />
      </label>

      <label className={styles.FormBlock}>
        Artist name
        <input type="text"
               name="artistName"
               placeholder="Artist name"
               value={artistName}
               onChange={(e) => {setArtistName(e.target.value)}} />
      </label>

      <label className={styles.FormBlock}>
        Album name
        <input type="text"
               name="albumName"
               placeholder="Album name"
               value={albumName}
               onChange={(e) => {setAlbumName(e.target.value)}} />
      </label>

      <br></br>

      <div className={styles.FormBlock}>
        <button type="submit">
          Submit
        </button>
      </div>
    </form>
  );
}

export default Upload;
