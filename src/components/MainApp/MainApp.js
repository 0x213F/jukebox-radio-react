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
    </Switch>
  )

  /*
   * 🎨
   */
  // return (
  //   <>
  //   {/* nav bar */}
  //   <nav>
  //     <ul>
  //       <li>
  //         <Link to="/settings">Settings</Link>
  //       </li>
  //       <li>
  //         <Link to="/feed">Feed</Link>
  //       </li>
  //       <li>
  //         <Link to="/player">Player</Link>
  //       </li>
  //       <li>
  //         <Link to="/queue">Queue</Link>
  //       </li>
  //       <li>
  //         <Link to="/search">Search</Link>
  //       </li>
  //       <li>
  //         <Link to="/upload">Upload</Link>
  //       </li>
  //     </ul>
  //   </nav>
  //
  //   {/* main section */}
  //   <div className="app-main-container">
  //     <div className="app-main">
  //
  //       <Switch>
  //         <Route path="/settings">
  //           <UserSettings />
  //         </Route>
  //         <Route path="/feed">
  //           <FeedApp />
  //         </Route>
  //         <Route path="/player">
  //           <Player nextTrack={props.playbackControls.nextTrack}
  //                   prevTrack={props.playbackControls.prevTrack}
  //                   seek={props.playbackControls.seek}
  //                   pause={props.playbackControls.pause}
  //                   play={props.playbackControls.play} />
  //         </Route>
  //         <Route path="/queue">
  //           <QueueApp />
  //         </Route>
  //         <Route path="/search">
  //           <Search />
  //         </Route>
  //         <Route path="/upload">
  //           <Upload />
  //         </Route>
  //         <Route path="/spotify">
  //           <SpotifySync />
  //         </Route>
  //       </Switch>
  //     </div>
  //   </div>
  //   </>
  // );
}


export default MainApp;
