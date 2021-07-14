import React, { useState } from "react";
import { connect } from 'react-redux'
import styles from './QueueTrack.module.css';
import { iconEdit, iconRemove } from '../icons';
import { durationPretty } from '../utils';

import * as services from '../../../config/services';
import * as modalViews from '../../../config/views/modal';


function QueueTrack(props) {

  /*
   * 🏗
   */
  const queueMap = props.queueMap,
        queueUuid = props.queueUuid,
        queue = queueMap[queueUuid];

  const stream = props.stream,
        main = props.main,
        playback = props.playback,
        nowPlaying = queueMap[stream.nowPlayingUuid];

  const [showModal, setShowModal] = useState(false);
  const [shouldPlayOnClose, setShouldPlayOnClose] = useState(false);

  const loadTrack = function(queue) {
    const rawAudioServices = new Set();
    rawAudioServices.add(services.JUKEBOX_RADIO);
    rawAudioServices.add(services.AUDIUS);
    if(!rawAudioServices.has(queue.track.service)) {
      // We only need to load audio from raw audio services.
      return;
    }

    const queuesAlreadyLoading = new Set(
      main.actions
      .filter(a => a.name === 'loadAudio')
      .map(a => a.queue.uuid)
    );
    if(queuesAlreadyLoading.has(queue.uuid) || playback.files.hasOwnProperty(queue.track.uuid)) {
      // Audio is already loading or loaded.
      return;
    }

    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "loadAudio",
          queue: queue,
          status: "kickoff",
          fake: true,  // symbolic, not functional
        },
      },
    });
  }

  const openModal = function() {
    if(nowPlaying?.status === 'played') {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "pause",
            status: "kickoff",
            fake: false,
          },
        },
      });
      setShouldPlayOnClose(true);
    }

    loadTrack(queue);

    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "mount",
          queue: queue,
          status: "kickoff",
          fake: true,  // symbolic, not functional
        },
      },
    });

    props.dispatch({
      type: "modal/open",
      payload: { view: modalViews.TRACK_DETAIL },
    });
  }

  const closeModal = function() {

    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "mount",
          stream: stream,
          status: "kickoff",
          fake: true,  // symbolic, not functional
        },
      },
    });

    props.dispatch({ type: "modal/close" });
    if(shouldPlayOnClose) {
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
    </div>
  );
}

const mapStateToProps = (state) => ({
  stream: state.stream,
  queueMap: state.queueMap,
  main: state.main,
  playback: state.playback,
});

export default connect(mapStateToProps)(QueueTrack);
