import React from "react";

import { connect } from 'react-redux';

import styles from './MiniPlayer.module.css';


function MiniPlayer(props) {

  /*
   * 🏗
   */
  const playback = props.playback,
        queueMap = props.queueMap,
        nowPlaying = queueMap[playback.nowPlayingUuid],
        imageUrl = nowPlaying?.track?.imageUrl,
        nowPlayingTrackName = nowPlaying?.track?.name;

  /*
   * 🎨
   */
  return (
    <div className={styles.MiniPlayer}>
      <h3>Player</h3>
      {imageUrl &&
        <img alt=""
             src={imageUrl} />
      }
      {nowPlayingTrackName ?
        (
          <p>{nowPlayingTrackName}</p>
        ) : (
          <p>Nothing is playing...</p>
        )
      }
    </div>
  );
}


const mapStateToProps = (state) => ({
    playback: state.playback,
    queueMap: state.queueMap,
});


export default connect(mapStateToProps)(MiniPlayer);
