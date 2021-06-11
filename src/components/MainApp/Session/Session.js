import React, { useState, useEffect } from "react";

import { Switch, Route, Link } from "react-router-dom";
import { connect } from 'react-redux';

import FeedApp from '../../FeedApp/FeedApp';
import QueueApp from '../../QueueApp/QueueApp';
import MiniQueue from '../../QueueApp/MiniQueue/MiniQueue';
import SearchApp from '../../SearchApp/SearchApp';
import MiniNotes from '../../SearchApp/MiniNotes/MiniNotes';
import WelcomeApp from '../../WelcomeApp/WelcomeApp';

import BottomBar from '../BottomBar/BottomBar';
import SideBar from '../SideBar/SideBar';

import styles from './Session.module.css';


function Session(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid],
        nextUpQueueUuids = props.nextUpQueueUuids;

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
      nowPlaying?.status !== "played" &&
      nowPlaying?.status !== 'paused' &&
      !nextUpQueueUuids.length &&
      !forceHideModal
    )
    if(!shouldDisplayModal) {
      return;
    }
    setShowModal(true);
    setForceHideModal(true);
  }, [nowPlaying, nextUpQueueUuids, forceHideModal])

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

            {/* QUEUE */}
            <Route path="/app/queue">
              <div className={styles.PrimaryContent}>
                <QueueApp playbackControls={props.playbackControls}/>
              </div>
              <div className={styles.SecondaryContent}>
                <MiniNotes />
              </div>
            </Route>

            {/* SEARCH */}
            <Route path="/app/search">
              <div className={styles.PrimaryContent}>
                <SearchApp />
              </div>
                <div className={styles.SecondaryContent}>
                  <MiniNotes />
                  <Link to="/app/queue" onClick={() => { handleTab("queue"); }} style={{ textDecoration: 'none', color: "#000" }}>
                    <MiniQueue />
                  </Link>
                </div>
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
    queueMap: state.queueMap,
    nextUpQueueUuids: state.nextUpQueueUuids,
});


export default connect(mapStateToProps)(Session);
