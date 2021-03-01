import React from "react";
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
// import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';
import styles from './BottomBar.module.css';
import {
  iconScanForward,
  iconScanBackward,
  iconPlayCircle,
  iconPauseCircle,
  // iconMusic,
  // iconMic,
} from './icons';


function BottomBar(props) {

  /*
   * 🏗
   */
  const playbackControls = props.playbackControls,
        stream = props.stream,
        playback = props.playback,
        nextUpQueues = props.nextUpQueues;

  const scanDisabled = (
          !stream.nowPlaying ||
          stream.isPaused ||
          !playback.controlsEnabled
        ),
        playPauseDisabled = (
          !stream.nowPlaying ||
          !playback.controlsEnabled
        );

  const displayStartPlayback = !stream.nowPlaying && !!nextUpQueues.length,
        displayAddToQueue = !stream.nowPlaying && !nextUpQueues.length;

  /*
   * Modify playback to play whatever is next in the queue.
   */
  const handleStartPlayback = function() {
    playbackControls.nextTrack();
  }

  /*
   * Modify playback to seek in a certain diretion ('forward' or 'backward').
   */
  const handleSeek = function(direction) {
    if(scanDisabled) {
      return;
    }
    playbackControls.seek(direction);
  }

  /*
   * Modify playback to play or pause, whichever one is relevant.
   */
  const handlePlayPause = function() {
    if(playPauseDisabled) {
      return;
    }
    if(stream.isPlaying) {
      playbackControls.pause();
    }
    if(stream.isPaused) {
      playbackControls.play();
    }
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.BottomBar}>

      <div className={styles.ExtraControl}>
        {displayStartPlayback && (
          <button className={styles.ExtraControlButton}
                  onClick={() => { handleStartPlayback(); }}>
            Start Playback
          </button>
        )}
        {displayAddToQueue && (
          <Link to="/app/search">
            <button className={styles.ExtraControlButton}>
              Add to Queue
            </button>
          </Link>
        )}
      </div>

      {/*
      <div className={styles.Volume}>
        <div className={styles.VolumeButton}>
          <CircularProgressbarWithChildren
                value={100}
                circleRatio={0.75}
                styles={buildStyles({
                  rotation: 1 / 2 + 1 / 8,
                  strokeLinecap: "butt",
                  trailColor: "#eee",
                })} >
            {iconMusic}
          </CircularProgressbarWithChildren>
        </div>

        <div className={styles.VolumeButton}>
          <CircularProgressbarWithChildren
                value={100}
                circleRatio={0.75}
                styles={buildStyles({
                  rotation: 1 / 2 + 1 / 8,
                  strokeLinecap: "butt",
                  trailColor: "#eee",
                })} >
            {iconMic}
          </CircularProgressbarWithChildren>
        </div>
      </div>
      */}

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
    nextUpQueues: state.nextUpQueues,
});


export default connect(mapStateToProps)(BottomBar);
