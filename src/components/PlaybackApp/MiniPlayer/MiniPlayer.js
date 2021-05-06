import React from "react";

import { connect } from 'react-redux';

import styles from './MiniPlayer.module.css';


function MiniPlayer(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        imageUrl = stream.nowPlaying?.track?.imageUrl,
        nowPlayingTrackName = stream?.nowPlaying?.track?.name;

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
    stream: state.stream,
});


export default connect(mapStateToProps)(MiniPlayer);
