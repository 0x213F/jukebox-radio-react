import React, { useState } from "react";
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { fetchUpdateUserSettings } from './network';
import styles from './UserSettings.module.css';
import { iconBack } from './../../../icons';


function UserSettings(props) {

  /*
   * 🏗
   */
  const userSettings = props.userSettings;

  const [controlsEnabled, setControlsEnabled] = useState(true);

  const closeModal = function() {
    props.dispatch({ type: "modal/close" });
  }

  const handleAppleMusic = function() {
    const music = window.MusicKit.getInstance();
    music.authorize();
  }

  function updateIdleQueue(event) {
    props.dispatch({
      type: 'userSettings/update',
      payload: { idleQueue: event.target.checked },
    });
    fetchUpdateUserSettings('idle_after_now_playing', event.target.checked);
  }

  function updateSpeakVoice(event) {
    props.dispatch({
      type: 'userSettings/update',
      payload: { speakVoice: event.target.checked },
    });
    fetchUpdateUserSettings('mute_voice_recordings', event.target.checked);
  }

  function updateFocusMode(event) {
    props.dispatch({
      type: 'userSettings/update',
      payload: { focusMode: event.target.checked },
    });
    fetchUpdateUserSettings('focus_mode', event.target.checked);
  }

  return (
    <>
      <button className={styles.ModalClose}
              onClick={closeModal}>
        {iconBack}
      </button>

      <div className={styles.ModalContent}>
        <h3 className={styles.Title}>
          Settings
        </h3>

        <label className={styles.FormLabel}>
          <span>Spotify Premium</span>
          <a href={userSettings.spotify.authorizationUrl}>Connect</a>
        </label>

        <label className={styles.FormLabel}>
          <span>Apple Music</span>
          <a href="#" onClick={handleAppleMusic}>Connect</a>
        </label>

        <label className={styles.FormLabel}>
          <span>Idle after queue</span>
          <input type="checkbox" checked={userSettings.idleQueue} onChange={updateIdleQueue} disabled={!controlsEnabled} />
        </label>

        <label className={styles.FormLabel}>
          <span>Speak voice recordings</span>
          <input type="checkbox" checked={userSettings.speakVoice} onChange={updateSpeakVoice} disabled={!controlsEnabled} />
        </label>

        <label className={styles.FormLabel}>
          <span>Focus mode</span>
          <input type="checkbox" checked={userSettings.focusMode} onChange={updateFocusMode} disabled={!controlsEnabled} />
        </label>
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  userSettings: state.userSettings
});

export default connect(mapStateToProps)(UserSettings);
