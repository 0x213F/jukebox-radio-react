import React from "react";
import { Switch, Route, Link } from "react-router-dom";
import styles from './Session.module.css';

import FeedApp from '../../FeedApp/FeedApp';
import MiniFeed from '../../FeedApp/MiniFeed/MiniFeed';
import QueueApp from '../../QueueApp/QueueApp';
import MiniQueue from '../../QueueApp/MiniQueue/MiniQueue';
import SearchApp from '../../SearchApp/SearchApp';
import Player from '../../PlaybackApp/Player/Player';
import MiniPlayer from '../../PlaybackApp/MiniPlayer/MiniPlayer';

import BottomBar from '../BottomBar/BottomBar';
import SideBar from '../SideBar/SideBar';


function Session(props) {

  /*
   * 🏗
   */

   /*
    * 🎨
    */
  return (
    <div className={styles.Session}>

      <div className={styles.Top}>
        <SideBar />

        <div className={styles.Content}>

        <Switch>
          {/* FEED */}
          <Route path="/app/feed">
            <div className={styles.PrimaryContent}>
              <FeedApp />
            </div>
          </Route>
          {/* PLAYER */}
          <Route path="/app/player">
            <div className={styles.PrimaryContent}>
              <Player nextTrack={props.playbackControls.nextTrack}
                      prevTrack={props.playbackControls.prevTrack}
                      seek={props.playbackControls.seek}
                      pause={props.playbackControls.pause}
                      play={props.playbackControls.play} />
            </div>
            <div className={styles.SecondaryContent}>
              <Link to="/app/feed">
                <MiniFeed />
              </Link>
            </div>
          </Route>
          {/* QUEUE */}
          <Route path="/app/queue">
            <div className={styles.PrimaryContent}>
              <QueueApp />
            </div>
            <div className={styles.SecondaryContent}>
              <Link to="/app/player">
                <MiniPlayer />
              </Link>
            </div>
          </Route>
          {/* SEARCH */}
          <Route path="/app/search">
            <div className={styles.PrimaryContent}>
              <SearchApp />
            </div>
            <div className={styles.SecondaryContent}>
            <Link to="/app/queue">
              <MiniQueue />
            </Link>
            </div>
          </Route>
        </Switch>

        </div>
      </div>
      <BottomBar playbackControls={props.playbackControls} />

    </div>
  );
}

export default Session;
