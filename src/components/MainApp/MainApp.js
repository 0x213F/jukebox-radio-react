import React from "react";
import { Switch, Route } from "react-router-dom";

import SpotifySync from '../SpotifySync/SpotifySync';
import ProfileApp from '../ProfileApp/ProfileApp';

import Session from './Session/Session';


function MainApp(props) {

  /*
   * 🎨
   */
  return (

    <Switch>
      <Route path="/app/:content">
        <Session playbackControls={props.playbackControls} />
      </Route>
      <Route path="/u/:username">
        <ProfileApp />
      </Route>
      <Route path="/spotify">
        <SpotifySync />
      </Route>
    </Switch>
  );
}


export default MainApp;
