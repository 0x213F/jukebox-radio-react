import React from "react";
import { Switch, Route, Link } from "react-router-dom";

import FeedApp from '../FeedApp/FeedApp';
import QueueApp from '../QueueApp/QueueApp';
import Search from '../Search/Search';
import SpotifySync from '../SpotifySync/SpotifySync';
import Upload from '../Upload/Upload';
import Player from '../Player/Player';
import UserSettings from '../UserSettings/UserSettings';
import ProfileApp from '../ProfileApp/ProfileApp';


function MainApp(props) {

  /*
   * 🎨
   */
  return (
    <>
    {/* nav bar */}
    <nav>
      <ul>
        <li>
          <Link to="/settings">Settings</Link>
        </li>
        <li>
          <Link to="/feed">Feed</Link>
        </li>
        <li>
          <Link to="/player">Player</Link>
        </li>
        <li>
          <Link to="/queue">Queue</Link>
        </li>
        <li>
          <Link to="/search">Search</Link>
        </li>
        <li>
          <Link to="/upload">Upload</Link>
        </li>
      </ul>
    </nav>

    {/* main section */}
    <div className="app-main-container">
      <div className="app-main">

        <Switch>
        <Route path="/u/">
            <ProfileApp />
          </Route>
          <Route path="/settings">
            <UserSettings />
          </Route>
          <Route path="/feed">
            <FeedApp />
          </Route>
          <Route path="/player">
            <Player nextTrack={props.playbackControls.nextTrack}
                    prevTrack={props.playbackControls.prevTrack}
                    seek={props.playbackControls.seek}
                    pause={props.playbackControls.pause}
                    play={props.playbackControls.play} />
          </Route>
          <Route path="/queue">
            <QueueApp />
          </Route>
          <Route path="/search">
            <Search />
          </Route>
          <Route path="/upload">
            <Upload />
          </Route>
          <Route path="/spotify">
            <SpotifySync />
          </Route>
        </Switch>
      </div>
    </div>
    </>
  );
}


export default MainApp;
