import React, { useState } from "react";
import { connect } from 'react-redux'
import TrackDetailApp from '../../TrackDetailApp/TrackDetailApp'
import styles from './QueueTrack.module.css';


function QueueTrack(props) {

  /*
   * 🏗
   */
  const queue = props.data,
        stream = props.stream,
        lastUp = props.lastUp;

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

  /*
   * 🎨
   */
  const currentIndex = stream?.nowPlaying?.index || lastUp?.index,
        isNextUp = !currentIndex || currentIndex < queue.index,
        indent = queue.parentUuid && isNextUp ? '-' : '';
  return (
    <div className={styles.QueueTrack}>
      <span>
        {indent}
        {queue.track.name}
      </span>
      {isNextUp &&
        <>
          <button className={styles.Button} type="button" onClick={async (e) => { await props.destroy(queue); }}>
            Delete
          </button>
          <button className={styles.Button} type="button" onClick={initializeModal}>
            Edit
          </button>
        </>
      }
      <TrackDetailApp data={queue}
                 isOpen={showModal}
                 shouldOpenModal={shouldOpenModal}
                 setShouldOpenModal={setShouldOpenModal}
                 openModal={openModal}
                 closeModal={closeModal} />
    </div>
  );
}

const mapStateToProps = (state) => ({
  stream: state.stream,
  lastUp: state.lastUp,
});

export default connect(mapStateToProps)(QueueTrack);
