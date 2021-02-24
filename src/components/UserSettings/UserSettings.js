import React, { useState } from "react";
import { connect } from 'react-redux';
import { fetchUpdateUserSettings } from './network';


function UserSettings(props) {

  // TODO actually impliment the disabled behavior
  // eslint-disable-next-line
  // const [idleControls, setIdleControls] = useState(true);
  // const [voiceControls, setVoiceControls] = useState(true);
  // const [focusControls, setFocusControls] = useState(true);

  if (!props.userSettings) {
    return <></>;
  }

  // function updateUserSettings(event) {
  //   props.dispatch({type: 'userSettings/update', payload:{
  //     event.target.checked
  //   }});
  //   fetchUpdateUserSettings(, event.target.checked);
  // }

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
    <div>
      <a href={props.userSettings.spotify.authorizationUrl}>Connect Your Spotify Account</a>

      <div>
        <label>
          <input type="checkbox" checked={props.userSettings.idleQueue} onChange={updateIdleQueue} disabled={!controlsEnabled}/>
          Idle After Queue
        </label><br/>
        <label>
          <input type="checkbox" checked={props.userSettings.speakVoice} onChange={updateSpeakVoice} disabled={!controlsEnabled}/>
          Speak Voice Recordings
        </label><br/>
        <label>
          <input type="checkbox" checked={props.userSettings.focusMode} onChange={updateFocusMode} disabled={!controlsEnabled}/>
          Focus Mode
        </label><br/>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  userSettings: state.userSettings
});

export default connect(mapStateToProps)(UserSettings);
