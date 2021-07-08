import React, { useState } from "react";
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { fetchUpdateUserSettings } from './network';
import styles from './UserSettings.module.css';
import modalStyles from '../../styles/Modal.module.css';
import { iconBack } from './../../icons';


function UserSettings(props) {

  /*
   * 🏗
   */
  const isOpen = props.isOpen,
        closeModal = props.closeModal;

  // TODO actually impliment the disabled behavior
  // eslint-disable-next-line
  const [controlsEnabled, setControlsEnabled] = useState(true);

  if (!props.userSettings) {
    return <></>;
  }

  const handleAppleMusic = function() {
    const music = window.MusicKit.getInstance();
    if(!music.musicUserToken) {
      music.authorize();
    }
  }

  function updateIdleQueue(event) {
    props.dispatch({type: 'userSettings/update', payload:{
      idleQueue: event.target.checked
    }});
    fetchUpdateUserSettings('idle_after_now_playing', event.target.checked);
  }

  function updateSpeakVoice(event) {
    props.dispatch({type: 'userSettings/update', payload:{
      speakVoice: event.target.checked
    }})
    fetchUpdateUserSettings('mute_voice_recordings', event.target.checked);
  }

  function updateFocusMode(event) {
    props.dispatch({type: 'userSettings/update', payload:{
      focusMode: event.target.checked
    }})
    fetchUpdateUserSettings('focus_mode', event.target.checked);
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

      <div className={styles.Body}>
        <h3>
          Settings
        </h3>

        <a href={props.userSettings.spotify.authorizationUrl}>Connect your Spotify Premium account.</a>

        <a href={"#apple-music"} onClick={handleAppleMusic}>Connect your Apple Music account.</a>

        <div>
          <label>
            <input type="checkbox" checked={props.userSettings.idleQueue} onChange={updateIdleQueue} disabled={!controlsEnabled}/>
            Idle After Queue
          </label>
          <label>
            <input type="checkbox" checked={props.userSettings.speakVoice} onChange={updateSpeakVoice} disabled={!controlsEnabled}/>
            Speak Voice Recordings
          </label>
          <label>
            <input type="checkbox" checked={props.userSettings.focusMode} onChange={updateFocusMode} disabled={!controlsEnabled}/>
            Focus Mode
          </label>
        </div>
      </div>
    </Modal>
  );
}

const mapStateToProps = (state) => ({
  userSettings: state.userSettings
});

export default connect(mapStateToProps)(UserSettings);
