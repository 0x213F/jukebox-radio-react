import React from "react";
import { connect } from 'react-redux';
import Modal from 'react-modal';

import Upload from './Upload/Upload';
import TrackDetail from './TrackDetail/TrackDetail';
import UserSettings from './UserSettings/UserSettings';
import NotationCompose from './NotationCompose/NotationCompose';
import Welcome from './Welcome/Welcome';

import * as services from '../../config/services';
import styles from './ModalApp.module.css';
import * as modalViews from '../../config/views/modal';


function ModalApp(props) {

  /*
   * 🏗
   */
  const modal = props.modal,
        playback = props.playback,
        queueMap = props.queueMap,
        nowPlaying = queueMap[playback.nowPlayingUuid];

  if(!modal.isOpen) {
    return <></>;
  }

  const videoCurrentlyPlaying = (
    (
      nowPlaying?.track?.service === services.APPLE_MUSIC ||
      nowPlaying?.track?.service === services.YOUTUBE
    ) && nowPlaying?.track?.format === 'video'
  );
  const modalClassName = videoCurrentlyPlaying ? 'ModalSecondary' : 'ModalPrimary';

  /*
   * 🎨
   */
  return (
    <div className={styles.ModalOverlay}>
      <div className={styles[modalClassName]}>
        {modal.view === modalViews.UPLOAD_TRACK &&
          <Upload />
        }
        {modal.view === modalViews.TRACK_DETAIL &&
          <TrackDetail />
        }
        {modal.view === modalViews.USER_SETTINGS &&
          <UserSettings />
        }
        {modal.view === modalViews.NOTATION_COMPOSE &&
          <NotationCompose />
        }
        {modal.view === modalViews.WELCOME &&
          <Welcome />
        }
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  modal: state.modal,
  playback: state.playback,
  queueMap: state.queueMap,
  nowPlaying: state.nowPlaying,
});

export default connect(mapStateToProps)(ModalApp);
