import React from "react";
import { connect } from 'react-redux';


function UserSettings(props) {
  if (!props.userSettings) {
    return <></>;
  }

  function updateIdleQueue(event) {
    props.dispatch({type: 'userSettings/update', payload:{
      idleQueue: event.target.checked
    }})

  }

  function updateSpeakVoice(event) {
    props.dispatch({type: 'userSettings/update', payload:{
      speakVoiceRecordings: event.target.checked
    }})
  }

  function updateFocusMode(event) {
    props.dispatch({type: 'userSettings/update', payload:{
      focusMode: event.target.checked
    }})
  }

  return (
    <div>
      <a href={props.userSettings.spotify.authorizationUrl}>Connect Your Spotify Account</a>

      <form>
        <label>
          <input type="checkbox" name="idleQueue" checked={props.userSettings.idleQueue} onChange={updateIdleQueue}/>
          Idle After Queue
        </label><br/>
        <label>
          <input type="checkbox" name="idleQueue" checked={props.userSettings.speakVoice} onChange={updateSpeakVoice}/>
          Speak Voice Recordings
        </label><br/>
        <label>
          <input type="checkbox" name="focusMode" checked={props.userSettings.focusMOde} onChange={updateFocusMode}/>
          Focus Mode
        </label><br/>
      </form>
    </div>
  );
}

const mapStateToProps = (state) => ({
  userSettings: state.userSettings
});

export default connect(mapStateToProps)(UserSettings);
