import React from "react";
import { connect } from 'react-redux';

function UserSettings(props) {
  console.log(props.userSettings);
  if (!props.userSettings) {
    return <></>;
  }

  return (
    <a href={props.userSettings.spotify.authorizationUrl}>Connect Your Spotify Account</a>
  );
}

const mapStateToProps = (state) => ({
  userSettings: state.userSettings,
});

export default connect(mapStateToProps)(UserSettings);