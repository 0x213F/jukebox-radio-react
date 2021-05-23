import React, { useState } from "react";
import { connect } from 'react-redux'
import TrackDetailApp from '../../TrackDetailApp/TrackDetailApp'
import styles from './QueueTrack.module.css';
import { iconEdit, iconRemove } from '../icons';
import { durationPretty } from '../utils';


function QueueTrack(props) {

  /*
   * 🏗
   */
  const queue = props.data;

  const stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid];

  const [showModal, setShowModal] = useState(false);
  const [shouldPlayOnClose, setShouldPlayOnClose] = useState(false);

  const openModal = function() {
    if(nowPlaying?.status === 'played') {
      props.playbackControls.pause();
      setShouldPlayOnClose(true);
    }
    props.dispatch({
      type: "playback/modalOpen",
      payload: { queue },
    });
    setShowModal(true);
  }

  const closeModal = function() {
    props.dispatch({
      type: "playback/modalClose",
      payload: {},
    });
    setShowModal(false);
    if(shouldPlayOnClose) {
      // props.playbackControls.play();
      setShouldPlayOnClose(false);
    }
  }

  const mainClass = queue.parentUuid ? "QueueTrackChild" : "QueueTrackHead",
        infoClass = queue.parentUuid ? "QueueInformationChild" : "QueueInformationHead",
        buttonClass = queue.parentUuid ? "ButtonChild" : "ButtonHead",
        durationClass = queue.parentUuid ? "DurationContainerChild" : "DurationContainerHead";

  /*
   * 🎨
   */
  return (
    <div className={styles[mainClass]}>
      {!queue.parentUuid &&
        <div className={[styles.AlbumArtContainer, styles[queue.track.service]].join(' ')}>
          <img src={queue.track.imageUrl} alt={"Album Art"} />
        </div>
      }

      <div className={styles[infoClass]}>
        <h5>{queue.track.name}</h5>
        {!queue.parentUuid && <h6>{queue.track.artistName}</h6>}
      </div>

      <div className={styles[durationClass]}>
        {durationPretty(queue.track.durationMilliseconds)}
      </div>

      <div className={styles.ButtonContainer}>
        <button className={styles[buttonClass]} type="button" onClick={openModal}>
          {iconEdit}
        </button>
        <button className={styles[buttonClass]} type="button" onClick={async (e) => { await props.destroy(queue); }}>
          {iconRemove}
        </button>
      </div>
      <TrackDetailApp data={queue}
                      isOpen={showModal}
                      closeModal={closeModal} />
    </div>
  );
}

const mapStateToProps = (state) => ({
  stream: state.stream,
  queueMap: state.queueMap,
});

export default connect(mapStateToProps)(QueueTrack);
