import React, { useState } from "react";
import { connect } from 'react-redux';

function UserSettings(props) {
  const [ idleQueue, setIdleQueue] = useState(false);
  const [ speakVoice, setSpeakVoice] = useState(true);
  const [ focusMode, setFocusMode] = useState(false);

  if (!props.userSettings) {
    return <></>;
  }

  return (
    <div>
      <a href={props.userSettings.spotify.authorizationUrl}>Connect Your Spotify Account</a>

      <form>
        <label>
          <input type="checkbox" name="idleQueue" checked={idleQueue} onChange={() => setIdleQueue(!idleQueue)}/>
          Idle After queue
        </label><br/>
        <label>
          <input type="checkbox" name="speakVoiceRecordings" checked={speakVoice} onChange={() => setSpeakVoice(!speakVoice)}/>
          Speak Voice Recordings
        </label><br/>
        <label>
          <input type="checkbox" name="focusMode" checked={focusMode} onChange={() => setFocusMode(!focusMode)}/>
          Focus Mode
        </label>
      </form>
    </div>
  );
}

const mapStateToProps = (state) => ({
  userSettings: state.userSettings,
});

export default connect(mapStateToProps)(UserSettings);
