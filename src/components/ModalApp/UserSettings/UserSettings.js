import React, { useState } from "react";
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
    setControlsEnabled(false);
    props.dispatch({
      type: 'userSettings/update',
      payload: { idleQueue: event.target.checked },
    });
    fetchUpdateUserSettings('idle_after_now_playing', event.target.checked);
    setControlsEnabled(true);
  }

  function updateSpeakVoice(event) {
    setControlsEnabled(false);
    props.dispatch({
      type: 'userSettings/update',
      payload: { speakVoice: event.target.checked },
    });
    fetchUpdateUserSettings('mute_voice_recordings', event.target.checked);
    setControlsEnabled(true);
  }

  function updateFocusMode(event) {
    setControlsEnabled(false);
    props.dispatch({
      type: 'userSettings/update',
      payload: { focusMode: event.target.checked },
    });
    fetchUpdateUserSettings('focus_mode', event.target.checked);
    setControlsEnabled(true);
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
          <button onClick={handleAppleMusic}>Connect</button>
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
