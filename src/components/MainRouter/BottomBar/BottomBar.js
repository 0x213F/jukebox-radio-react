import React from "react";

import { connect } from 'react-redux';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import { cycleVolumeLevel, featureIsEnabled } from '../../PlaybackApp/utils';
import * as controls from '../../PlaybackApp/PlaybackEngine/controls';
import { iconNextTrack, iconPrevTrack } from '../../PlaybackApp/icons';
import ProgressBar from '../../PlaybackApp/ProgressBar/ProgressBar';
import { iconSpotify, iconYouTube, iconAppleMusic, iconLogoAlt, iconAudius } from '../../../icons';
import * as services from '../../../config/services';
import * as modalViews from '../../../config/views/modal';

import styles from './BottomBar.module.css';
import * as bottomBarIcons from './icons';


function BottomBar(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        queueMap = props.queueMap,
        playback = props.playback,
        modal = props.modal,
        nowPlaying = queueMap[playback.nowPlayingUuid],
        audioVolumeLevel = playback.volumeLevel.audio;

  // eslint-disable-next-line
  const controlsEnabled = featureIsEnabled(props),
        nowPlayingTrackService = nowPlaying?.track?.service;

  const playbackIsStream = stream.nowPlayingUuid === playback.nowPlayingUuid;

  /*
   * Opens the "User Settings" modal.
   */
  const openModal = function() {
    props.dispatch({
      type: "modal/open",
      payload: { view: modalViews.USER_SETTINGS },
    });
  }

  let serviceSvg;
  if(nowPlayingTrackService === services.SPOTIFY) {
    serviceSvg = iconSpotify;
  } else if(nowPlayingTrackService === services.YOUTUBE) {
    serviceSvg = iconYouTube;
  } else if(nowPlayingTrackService === services.APPLE_MUSIC) {
    serviceSvg = iconAppleMusic;
  } else if(nowPlayingTrackService === services.JUKEBOX_RADIO) {
    serviceSvg = iconLogoAlt;
  } else if(nowPlayingTrackService === services.AUDIUS) {
    serviceSvg = iconAudius;
  } else {
    serviceSvg = iconLogoAlt;
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
          name: "next",
          status: "kickoff",
          fake: false,
          settings: {
            pause: true,
            skip: false,
            play: true,
          },
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
          name: "prev",
          status: "kickoff",
          fake: false,
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
            name: "pause",            // Pause
            status: "kickoff",        // Kickoff
            fake: !playbackIsStream,  // Hit the API
          },
        },
      });
    } else if(nowPlaying?.status === 'paused' || !playbackIsStream) {
      if(playbackIsStream || nowPlaying?.status === 'paused') {
        props.dispatch({
          type: "main/addAction",
          payload: {
            action: {
              name: "play",
              timestampMilliseconds: nowPlaying.statusAt - nowPlaying.startedAt,
              status: "kickoff",
              fake: { api: !playbackIsStream },
            },
          },
        });
      } else {
        props.dispatch({
          type: "main/addAction",
          payload: {
            action: {
              name: "play",
              status: "kickoff",
              fake: { api: true },
            },
          },
        });
      }
    } else {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "next",
            status: "kickoff",
            fake: false,
            settings: {
              pause: false,
              skip: false,
              play: true,
            },
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
    controls.volume(playback, nowPlaying, nextVolumeLevel);
    props.dispatch({ type: 'playback/cycleVolumeLevelAudio' });
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.BottomBar}>

      <div className={styles.ProgressBarContainer}>
        <ProgressBar queue={nowPlaying}
                           playbackControls={props.playbackControls}
                           allowIntervalDelete={false}>
        </ProgressBar>
      </div>

      <div className={styles.Settings}>
        <button onClick={openModal}>
          {bottomBarIcons.iconGear}
        </button>
      </div>

      <button className={styles.Volume} onClick={handleCycleVolumeLevel}>
        <CircularProgressbarWithChildren
              value={audioVolumeLevel * 100}
              circleRatio={0.75}
              strokeWidth={3}
              styles={buildStyles({
                rotation: 1 / 2 + 1 / 8,
                strokeLinecap: "butt",
                pathColor: "#0047FF",
                trailColor: "#BCBCBC",
                pathTransitionDuration: 0.15,
              })} >
          <div className={styles.IconContainer}>
            {serviceSvg}
          </div>
        </CircularProgressbarWithChildren>
      </button>

      {modal.view === modalViews.TRACK_DETAIL ?
        <div className={styles.Playback}>
          <button onClick={handleNext}
                  disabled={!controlsEnabled} >
            {bottomBarIcons.iconBackward1000}
          </button>
          <button onClick={handleNext}
                  disabled={!controlsEnabled} >
            {bottomBarIcons.iconBackward100}
          </button>
          <button onClick={handlePlayPause}
                  disabled={!controlsEnabled} >
            {controlsEnabled ? (
              nowPlaying && nowPlaying.status === "played" ?
                bottomBarIcons.iconPauseCircle : bottomBarIcons.iconPlayCircle
              ) : <></>
            }
            {!controlsEnabled &&
              <i className={styles.ggSpinner}></i>
            }
          </button>
          <button onClick={handleNext}
                  disabled={!controlsEnabled} >
            {bottomBarIcons.iconForward100}
          </button>
          <button onClick={handleNext}
                  disabled={!controlsEnabled} >
            {bottomBarIcons.iconForward1000}
          </button>
        </div>
        :
        <div className={styles.Playback}>
          <button onClick={handlePrev}
                  disabled={!controlsEnabled} >
            {iconPrevTrack}
          </button>
          <button onClick={handlePlayPause}
                  disabled={!controlsEnabled} >
            {controlsEnabled ? (
              nowPlaying && nowPlaying.status === "played" ?
                bottomBarIcons.iconPauseCircle : bottomBarIcons.iconPlayCircle
              ) : <></>
            }
            {!controlsEnabled &&
              <i className={styles.ggSpinner}></i>
            }
          </button>
          <button onClick={handleNext}
                  disabled={!controlsEnabled} >
            {iconNextTrack}
          </button>
        </div>
      }

    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
    queueMap: state.queueMap,
    playback: state.playback,
    main: state.main,
    modal: state.modal,
});


export default connect(mapStateToProps)(BottomBar);
