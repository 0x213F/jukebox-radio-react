import React from "react";
import { connect } from 'react-redux';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cycleVolumeLevel } from '../../PlaybackApp/utils';
import { playbackChangeVolume } from '../../PlaybackApp/controls';
import styles from './BottomBar.module.css';
import {
  iconScanForward,
  iconScanBackward,
  iconPlayCircle,
  iconPauseCircle,
  iconMusic,
  // iconMic,
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
        playPauseDisabled = !playback.controlsEnabled;

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

      <div className={styles.Volume}>
        <button className={styles.VolumeButton}
                onClick={handleCycleVolumeLevel}>
          <CircularProgressbarWithChildren
                value={audioVolumeLevel * 100}
                circleRatio={0.75}
                styles={buildStyles({
                  rotation: 1 / 2 + 1 / 8,
                  strokeLinecap: "butt",
                  trailColor: "#eee",
                })} >
            {iconMusic}
          </CircularProgressbarWithChildren>
        </button>
      </div>

      <div className={styles.Playback}>
        <button className={styles.PlaybackButton}
                onClick={() => { handleSeek('backward'); }}
                disabled={scanDisabled} >
          {iconScanBackward}
        </button>
        <button className={styles.PlaybackButton}
                onClick={() => { handlePlayPause(); }}
                disabled={playPauseDisabled} >
          {stream.nowPlaying && stream.isPlaying ?
            iconPauseCircle : iconPlayCircle
          }
        </button>
        <button className={styles.PlaybackButton}
                onClick={() => { handleSeek('forward'); }}
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
