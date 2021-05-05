import React, { useState, useEffect } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { connect } from 'react-redux';
import styles from './Session.module.css';

import FeedApp from '../../FeedApp/FeedApp';
import MiniFeed from '../../FeedApp/MiniFeed/MiniFeed';
import QueueApp from '../../QueueApp/QueueApp';
import MiniQueue from '../../QueueApp/MiniQueue/MiniQueue';
import SearchApp from '../../SearchApp/SearchApp';
import WelcomeApp from '../../WelcomeApp/WelcomeApp';
import Player from '../../PlaybackApp/Player/Player';
import MiniPlayer from '../../PlaybackApp/MiniPlayer/MiniPlayer';

import BottomBar from '../BottomBar/BottomBar';
import SideBar from '../SideBar/SideBar';


function Session(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        nextUpQueues = props.nextUpQueues;

  const [showModal, setShowModal] = useState(false);
  const [forceHideModal, setForceHideModal] = useState(false);

  const closeModal = function() {
    setShowModal(false);
  }

  useEffect(() => {
    const shouldDisplayModal = (
      !stream.isPlaying &&
      !stream.isPaused &&
      !nextUpQueues.length &&
      !forceHideModal
    )
    if(!shouldDisplayModal) {
      return;
    }
    setShowModal(true);
    setForceHideModal(true);
  }, [stream, nextUpQueues, forceHideModal])

   /*
    * 🎨
    */
  return (
    <div className={styles.Session}>

      <WelcomeApp isOpen={showModal}
                  closeModal={closeModal} />

      <div className={styles.Top}>
        <SideBar />

        <div className={styles.Content}>

        <Switch>
          {/* FEED */}
          <Route path="/app/feed">
            <FeedApp />
          </Route>
          {/* PLAYER */}
          <Route path="/app/player">
            <div className={styles.MainContent}>
              <Player nextTrack={props.playbackControls.nextTrack}
                      prevTrack={props.playbackControls.prevTrack}
                      seek={props.playbackControls.seek}
                      pause={props.playbackControls.pause}
                      play={props.playbackControls.play} />
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


const mapStateToProps = (state) => ({
    stream: state.stream,
    nextUpQueues: state.nextUpQueues,
});


export default connect(mapStateToProps)(Session);
