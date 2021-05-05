import React from "react";
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { useHistory } from "react-router-dom";
import { iconLogo, iconSpotify, iconYouTube, iconAppleMusic } from '../../icons';
import styles from './WelcomeApp.module.css';
import { iconFolder } from './icons';


function WelcomeApp(props) {

  const history = useHistory();

  const userSettings = props.userSettings,
        playback = props.playback;

  const isOpen = props.isOpen,
        closeModal = props.closeModal;

  const handleAppleMusic = function() {
    const music = window.MusicKit.getInstance();
    if(!music.musicUserToken) {
      playback.appleMusic.api.authorize();
    } else {
      props.dispatch({
        type: 'search/toggleServiceOff',
        payload: { serviceAppleMusic: true },
      });
      history.push("/app/search");
      closeModal();
    }
  }

  const handleSpotify = function () {
    if(userSettings && !userSettings.spotify.accessToken) {
      window.location.href = props.userSettings.spotify.authorizationUrl;
    } else {
      props.dispatch({
        type: 'search/toggleServiceOff',
        payload: { serviceSpotify: true },
      });
      history.push("/app/search");
      closeModal();
    }
  }

  const handleYouTube = function () {
    props.dispatch({
      type: 'search/toggleServiceOff',
      payload: { serviceYouTube: true },
    });
    history.push("/app/search");
    closeModal();
  }

  const handleLibrary = function () {
    props.dispatch({
      type: 'search/toggleServiceOff',
      payload: { serviceJukeboxRadio: true },
    });
    history.push("/app/search");
    closeModal();
  }

   /*
    * 🎨
    */
  return (
    <Modal isOpen={isOpen}
           ariaHideApp={false}
           className={styles.Modal}
           overlayClassName={styles.ModalOverlay}>

      <div className={styles.Logo}>
        {iconLogo}
      </div>

      <div className={styles.WelcomeAppContainer}>

        <div>
          <div className={styles.WelcomeHeader}>
            <h2>Welcome</h2>
            <h5>Where do you want to start?</h5>
          </div>

          <div className={styles.PlaybackOptionContainer}>

            <div className={styles.PlaybackOption}
                    onClick={handleSpotify}
                    disabled={!userSettings}>
              <div className={styles.PlaybackOptionLogo}
                   style={{backgroundColor: "#FFF", borderRadius: "50%"}}>
                {iconSpotify}
              </div>
              <div className={styles.PlaybackOptionService}>
                Spotify
              </div>
              <div className={styles.PlaybackOptionDescription}>
                Connect your Spotify Premium account
              </div>
            </div>

            <div className={styles.PlaybackOption}
                 onClick={handleYouTube}>
              <div className={styles.PlaybackOptionLogo}>
                {iconYouTube}
              </div>
              <div className={styles.PlaybackOptionService}>
                YouTube
              </div>
              <div className={styles.PlaybackOptionDescription}>
                Free access to the YouTube catalog
              </div>
            </div>

            <div className={styles.PlaybackOption}
                    onClick={handleAppleMusic}
                    disabled={!playback.appleMusic.api}>
              <div className={styles.PlaybackOptionLogo}>
                {iconAppleMusic}
              </div>
              <div className={styles.PlaybackOptionService}>
                Apple Music
              </div>
              <div className={styles.PlaybackOptionDescription}>
                Click to connect your Apple Music account
              </div>
            </div>

            <div className={styles.PlaybackOption}
                 onClick={handleLibrary}>
              <div className={styles.PlaybackOptionLogo}>
                {iconFolder}
              </div>
              <div className={styles.PlaybackOptionService}>
                Library
              </div>
              <div className={styles.PlaybackOptionDescription}>
                Upload or search files in your cloud storage
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}


const mapStateToProps = (state) => ({
  userSettings: state.userSettings,
  playback: state.playback,
});


export default connect(mapStateToProps)(WelcomeApp);
