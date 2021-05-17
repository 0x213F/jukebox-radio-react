import React, { useState } from "react";

import { connect } from 'react-redux';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { cycleVolumeLevel } from '../../PlaybackApp/utils';
import { playbackChangeVolume } from '../../PlaybackApp/controls';
import ParentProgressBar from '../../PlaybackApp/ParentProgressBar/ParentProgressBar';
import { iconSpotify, iconYouTube, iconAppleMusic, iconLogoAlt, iconAudius } from '../../../icons';
import { SERVICE_SPOTIFY, SERVICE_YOUTUBE, SERVICE_APPLE_MUSIC, SERVICE_JUKEBOX_RADIO, SERVICE_AUDIUS } from '../../../config/services';
import UserSettings from '../../UserSettings/UserSettings'

import styles from './BottomBar.module.css';
import {
  iconGear,
  iconScanForward,
  iconScanBackward,
  iconPlayCircle,
  iconPauseCircle,
} from './icons';


function BottomBar(props) {

  /*
   * 🏗
   */
  const playbackControls = props.playbackControls,
        stream = props.stream,
        playback = props.playback,
        audioVolumeLevel = playback.volumeLevel.audio;

  const scanDisabled = (
          !stream.nowPlaying ||
          stream.isPaused ||
          !playback.controlsEnabled
        ),
        playPauseDisabled = !playback.controlsEnabled,
        nowPlayingTrackService = stream.nowPlaying?.track?.service;

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
  const handleSeek = function(direction) {
    if(scanDisabled) {
      return;
    }
    playbackControls.seek(direction);
  };

  /*
   * Modify playback to play or pause, whichever one is relevant.
   * NOTE: If no song is currently playing, then the "play button" will
   *       actually perform the "nextTrack" action.
   */
  const handlePlayPause = function() {
    if(playPauseDisabled) {
      return;
    }
    if(stream.isPlaying) {
      playbackControls.pause();
    } else if(stream.isPaused) {
      playbackControls.play();
    } else {
      playbackControls.nextTrack();
    }
  }

  /*
   * When a user toggles volume level. It cycles through predefined volume
   * levels.
   */
  const handleCycleVolumeLevel = function() {
    const nextVolumeLevel = cycleVolumeLevel(audioVolumeLevel);
    playbackChangeVolume(playback, stream, nextVolumeLevel);
    props.dispatch({ type: 'playback/cycleVolumeLevelAudio' });
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.BottomBar}>

      <div className={styles.ProgressBarContainer}>
        <ParentProgressBar queue={stream?.nowPlaying}
                           stream={stream}
                           mode={"player"}
                           playbackControls={props.playbackControls}>
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
        <button onClick={() => { handleSeek('backward'); }}
                disabled={scanDisabled} >
          {iconScanBackward}
        </button>
        <button onClick={() => { handlePlayPause(); }}
                disabled={playPauseDisabled} >
          {stream.nowPlaying && stream.isPlaying ?
            iconPauseCircle : iconPlayCircle
          }
        </button>
        <button onClick={() => { handleSeek('forward'); }}
                disabled={scanDisabled} >
          {iconScanForward}
        </button>
      </div>

    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
    playback: state.playback,
});


export default connect(mapStateToProps)(BottomBar);
