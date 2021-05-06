import React, { useState } from "react";
import { connect } from 'react-redux'
import TrackDetailApp from '../../TrackDetailApp/TrackDetailApp'
import styles from './QueueTrack.module.css';
import { iconEdit, iconRemove } from '../icons';
// import { durationPretty } from '../utils';


function QueueTrack(props) {

  /*
   * 🏗
   */
  const queue = props.data;

  const [showModal, setShowModal] = useState(false);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);

  const initializeModal = function() {
    setShouldOpenModal(true);
  }

  const openModal = function() {
    setShowModal(true);
  }

  const closeModal = function() {
    setShowModal(false);
  }

  const mainClass = queue.parentUuid ? "QueueTrackChild" : "QueueTrackHead",
        buttonClass = queue.parentUuid ? "ButtonChild" : "ButtonHead";
        // infoClass = queue.parentUuid ? "TrackInfoContainerChild" : "TrackInfoContainerHead";



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

      <div className={styles.QueueInformation}>
        <h5>{queue.track.name}</h5>
        {!queue.parentUuid && <h6>{queue.track.artistName}</h6>}
      </div>

      <div className={styles.ButtonContainer}>
        <button className={styles[buttonClass]} type="button" onClick={initializeModal}>
          {iconEdit}
        </button>
        <button className={styles[buttonClass]} type="button" onClick={async (e) => { await props.destroy(queue); }}>
          {iconRemove}
        </button>
      </div>
      <TrackDetailApp data={queue}
                 isOpen={showModal}
                 shouldOpenModal={shouldOpenModal}
                 setShouldOpenModal={setShouldOpenModal}
                 openModal={openModal}
                 closeModal={closeModal} />
    </div>
  );
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(QueueTrack);
