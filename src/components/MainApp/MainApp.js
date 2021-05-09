import React from "react";

import { Switch, Route } from "react-router-dom";

import SpotifySync from '../SpotifySync/SpotifySync';
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
        <span>PROFILE</span>
      </Route>
      <Route path="/spotify">
        <SpotifySync />
      </Route>
      <Route>
        <Session playbackControls={props.playbackControls} />
      </Route>
    </Switch>
  );
}


export default MainApp;