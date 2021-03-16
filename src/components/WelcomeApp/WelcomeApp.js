import React from "react";
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { useHistory } from "react-router-dom";
import styles from './WelcomeApp.module.css';
import { iconPlug } from './icons';


function WelcomeApp(props) {

  const history = useHistory();

  const userSettings = props.userSettings,
        playback = props.playback;

  const isOpen = props.isOpen,
        closeModal = props.closeModal;

  const handleAppleMusic = function() {
    if(playback.appleMusic.api.musicUserToken) {
      playback.appleMusic.api.authorize();
    } else {
      history.push("/app/search");
    }
    closeModal();
  }

  const handleSpotify = function () {
    if(userSettings && !userSettings.spotify.accessToken) {
      window.location.href = props.userSettings.spotify.authorizationUrl;
    } else {
      history.push("/app/search");
    }
    closeModal();
  }

  const handleYouTube = function () {
    history.push("/app/search");
    closeModal();
  }

  const handleLibrary = function () {
    history.push("/app/search");
    closeModal();
  }

   /*
    * 🎨
    */
  return (
    <Modal isOpen={isOpen}
           ariaHideApp={false}>
      <div className={styles.WelcomeApp}>
        <button onClick={closeModal}>
          Close
        </button>
        <h2>Welcome</h2>
        <p>Where do you want to start?</p>

        <button className={styles.Button}
                onClick={handleAppleMusic}
                disabled={!playback.appleMusic.api}>
          {playback.appleMusic.api && !playback.appleMusic.api?.musicUserToken && iconPlug}
          Apple Music
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;

        <button className={styles.Button}
                onClick={handleSpotify}
                disabled={!userSettings}>
          {userSettings && !userSettings.spotify.accessToken && iconPlug}
          Spotify
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;

        <button className={styles.Button}
                onClick={handleYouTube}>
          YouTube
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;

        <button className={styles.Button}
                onClick={handleLibrary}>
          Library
        </button>
      </div>
    </Modal>
  );
}


const mapStateToProps = (state) => ({
  userSettings: state.userSettings,
  playback: state.playback,
});


export default connect(mapStateToProps)(WelcomeApp);
