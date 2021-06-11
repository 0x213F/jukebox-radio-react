import React, { useState } from "react";

import { connect } from 'react-redux';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { cycleVolumeLevel, featureIsEnabled } from '../../PlaybackApp/utils';
import { playbackChangeVolume } from '../../PlaybackApp/controls';
import { iconNextTrack, iconPrevTrack } from '../../PlaybackApp/icons';
import ParentProgressBar from '../../PlaybackApp/ParentProgressBar/ParentProgressBar';
import { iconSpotify, iconYouTube, iconAppleMusic, iconLogoAlt, iconAudius } from '../../../icons';
import { SERVICE_SPOTIFY, SERVICE_YOUTUBE, SERVICE_APPLE_MUSIC, SERVICE_JUKEBOX_RADIO, SERVICE_AUDIUS } from '../../../config/services';
import UserSettings from '../../UserSettings/UserSettings'

import styles from './BottomBar.module.css';
import {
  iconGear,
  // eslint-disable-next-line
  iconScanForward,
  // eslint-disable-next-line
  iconScanBackward,
  iconPlayCircle,
  iconPauseCircle,
} from './icons';


function BottomBar(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid],
        playback = props.playback,
        audioVolumeLevel = playback.volumeLevel.audio;

  // eslint-disable-next-line
  const controlsEnabled = featureIsEnabled(props),
        nowPlayingTrackService = nowPlaying?.track?.service;

  const [showModal, setShowModal] = useState(false);

  /*
   * Opens the "User Settings" modal.
   */
  const openModal = function() {
    setShowModal(true);
  }

  /*
   * Closes the "User Settings" modal.
   */
  const closeModal = function() {
    setShowModal(false);
  }

  let serviceSvg;
  if(nowPlayingTrackService === SERVICE_SPOTIFY) {
    serviceSvg = iconSpotify;
  } else if(nowPlayingTrackService === SERVICE_YOUTUBE) {
    serviceSvg = iconYouTube;
  } else if(nowPlayingTrackService === SERVICE_APPLE_MUSIC) {
    serviceSvg = iconAppleMusic;
  } else if(nowPlayingTrackService === SERVICE_JUKEBOX_RADIO) {
    serviceSvg = iconLogoAlt;
  } else if(nowPlayingTrackService === SERVICE_AUDIUS) {
    serviceSvg = iconAudius;
  }

  /*
   * Modify playback to seek in a certain diretion ('forward' or 'backward').
   */
  const handleNext = function(direction) {
    if(!controlsEnabled) {
      return;
    }
    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "pause",
          status: "kickoff",
          fake: true,
        },
      },
    });
    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "next",
          status: "kickoff",
          fake: false,
        },
      },
    });
    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "play",
          status: "kickoff",
          fake: true,
        },
      },
    });
  };

  /*
   * Modify playback to seek in a certain diretion ('forward' or 'backward').
   */
  const handlePrev = function(direction) {
    if(!controlsEnabled) {
      return;
    }
    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "pause",
          status: "kickoff",
          fake: true,
        },
      },
    });
    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "prev",
          status: "kickoff",
          fake: false,
        },
      },
    });
    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "play",
          timestampMilliseconds: 0,
          status: "kickoff",
          fake: true,
        },
      },
    });
  };

  /*
   * Modify playback to play or pause, whichever one is relevant.
   * NOTE: If no song is currently playing, then the "play button" will
   *       actually perform the "nextTrack" action.
   */
  const handlePlayPause = async function() {
    if(!controlsEnabled) {
      return;
    }
    if(nowPlaying?.status === "played") {
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
    } else if(nowPlaying?.status === 'paused') {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "play",
            timestampMilliseconds: nowPlaying.statusAt - nowPlaying.startedAt,
            status: "kickoff",
            fake: false,
          },
        },
      });
    } else {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "next",
            status: "kickoff",
            fake: false,
          },
        },
      });
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "play",
            status: "kickoff",
            fake: false,
          },
        },
      });
    }
  }

  /*
   * When a user toggles volume level. It cycles through predefined volume
   * levels.
   */
  const handleCycleVolumeLevel = function() {
    const nextVolumeLevel = cycleVolumeLevel(audioVolumeLevel);
    playbackChangeVolume(playback, nowPlaying, nextVolumeLevel);
    props.dispatch({ type: 'playback/cycleVolumeLevelAudio' });
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.BottomBar}>

      <div className={styles.ProgressBarContainer}>
        <ParentProgressBar queue={nowPlaying}
                           mode={"player"}
                           playbackControls={props.playbackControls}
                           allowMarkerSeek={true}
                           allowMarkerDelete={false}
                           allowIntervalPlay={false}
                           allowIntervalDelete={false}>
        </ParentProgressBar>
      </div>

      <div className={styles.Settings}>
        <button onClick={openModal}>
          {iconGear}
        </button>
      </div>
      <UserSettings isOpen={showModal}
                    closeModal={closeModal} />

      <button className={styles.Volume} onClick={handleCycleVolumeLevel}>
        <CircularProgressbarWithChildren
              value={audioVolumeLevel * 100}
              circleRatio={0.75}
              strokeWidth={3}
              styles={buildStyles({
                rotation: 1 / 2 + 1 / 8,
                strokeLinecap: "butt",
                pathColor: "#0047FF",
                trailColor: "#EAEAEA",
                pathTransitionDuration: 0.15,
              })} >
          <div className={styles.IconContainer}>
            {serviceSvg}
          </div>
        </CircularProgressbarWithChildren>
      </button>

      <div className={styles.Playback}>
        <button onClick={handlePrev}
                disabled={!controlsEnabled} >
          {iconPrevTrack}
        </button>
        <button onClick={handlePlayPause}
                disabled={!controlsEnabled} >
          {nowPlaying && nowPlaying.status === "played" ?
            iconPauseCircle : iconPlayCircle
          }
        </button>
        <button onClick={handleNext}
                disabled={!controlsEnabled} >
          {iconNextTrack}
        </button>
      </div>

    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
    queueMap: state.queueMap,
    playback: state.playback,
    main: state.main,
});


export default connect(mapStateToProps)(BottomBar);
