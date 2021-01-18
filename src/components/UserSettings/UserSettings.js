import React, { useState } from "react";
import styles from './UserSettings.module.css'

import { fetchGetUserSettings } from './network';

function UserSettings() {

  // users/user/get-settings

    return (
      <button type="submit" onClick={}>Connect Your Spotify Account</button>
    );
}

const mapStateToProps = (state) => ({

});

export default UserSettings;