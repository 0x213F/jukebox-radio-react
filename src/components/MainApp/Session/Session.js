import React, { useState, useEffect } from "react";

import { Switch, Route, Link } from "react-router-dom";
import { connect } from 'react-redux';

import FeedApp from '../../FeedApp/FeedApp';
import QueueApp from '../../QueueApp/QueueApp';
import MiniQueue from '../../QueueApp/MiniQueue/MiniQueue';
import SearchApp from '../../SearchApp/SearchApp';
import WelcomeApp from '../../WelcomeApp/WelcomeApp';
import Player from '../../PlaybackApp/Player/Player';
import MiniPlayer from '../../PlaybackApp/MiniPlayer/MiniPlayer';

import BottomBar from '../BottomBar/BottomBar';
import SideBar from '../SideBar/SideBar';

import styles from './Session.module.css';


function Session(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        nextUpQueues = props.nextUpQueues;

  const [showModal, setShowModal] = useState(false);
  const [forceHideModal, setForceHideModal] = useState(false);

  /*
   * Closes the "Welcome" modal.
   */
  const closeModal = function() {
    setShowModal(false);
  }

  /*
   * Switches the active tab, updating styles in the side bar.
   */
  const handleTab = function(tab) {
    props.dispatch({
      type: "sideBar/selectTab",
      payload: { tab },
    });
  }

  useEffect(() => {
    const shouldDisplayModal = (
      stream.nowPlaying?.status !== "played" &&
      stream.nowPlaying?.status !== 'paused' &&
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

        {/* SIDE BAR */}
        <SideBar />

        <div className={styles.Content}>
          <Switch>

            {/* FEED */}
            <Route path="/app/feed">
              <FeedApp playbackControls={props.playbackControls}/>
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
                <QueueApp playbackControls={props.playbackControls}/>
              </div>
              <Link to="/app/player" onClick={() => { handleTab("player"); }} style={{ textDecoration: 'none', color: "#000" }}>
                <div className={styles.SecondaryContent}>
                    <MiniPlayer />
                </div>
              </Link>
            </Route>

            {/* SEARCH */}
            <Route path="/app/search">
              <div className={styles.PrimaryContent}>
                <SearchApp />
              </div>
              <Link to="/app/queue" onClick={() => { handleTab("queue"); }} style={{ textDecoration: 'none', color: "#000" }}>
                <div className={styles.SecondaryContent}>
                  <MiniQueue />
                </div>
              </Link>
            </Route>

          </Switch>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <BottomBar playbackControls={props.playbackControls} />

    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
    nextUpQueues: state.nextUpQueues,
});


export default connect(mapStateToProps)(Session);
