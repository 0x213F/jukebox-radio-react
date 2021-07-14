import React, { useEffect } from "react";

import { connect } from 'react-redux';
import { Switch, Route } from "react-router-dom";

import SpotifySync from '../SpotifySync/SpotifySync';
import Session from './Session/Session';


function MainRouter(props) {

  /*
   * 🎨
   */
  return (
    <Switch>
      <Route path="/app/:content">
        <Session />
      </Route>
      <Route path="/u/:username">
        <span>PROFILE</span>
      </Route>
      <Route path="/spotify">
        <SpotifySync />
      </Route>
      <Route>
        <Session />
      </Route>
    </Switch>
  );
}


const mapStateToProps = (state) => ({});


export default connect(mapStateToProps)(MainRouter);
