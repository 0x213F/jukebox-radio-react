import React, { useState } from "react";
import { fetchBackend } from '../../utils/network'

function UserSettings() {

  const authenticateSpotify = async() => {
    await fetchBackend("http://localhost:8000/users/user-connect-spotify")
    .then((response) => response.json())
    .then((data) =>{
      this.setState({spotifyAuthenticated: data.status });
      if (!data.status) {
        fetchBackend("http://localhost:8000/users/user-connect-spotify")
        .then((response) =>  response.json())
        .then((data) => {
          window.location = data.url;
        });
      }
    });
  }
    return (
      <button type="submit" onClick={authenticateSpotify}>Connect Your Spotify Account</button>
    );
}

export default UserSettings;