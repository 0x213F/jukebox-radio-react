import React from "react";
import { connect } from 'react-redux';
import styles from './MiniPlayer.module.css';


function MiniPlayer(props) {

  const stream = props.stream,
        imageUrl = stream.nowPlaying?.track?.imageUrl,
        nowPlayingTrackName = stream?.nowPlaying?.track?.name;

  return (
    <div>
      <h3><i>Now playing...</i></h3>
      {imageUrl &&
        <img alt=""
             src={imageUrl}
             className={styles.Image} />
      }
      {nowPlayingTrackName ?
        (
          <p>{nowPlayingTrackName}</p>
        ) : (
          <p><i>Nothing is playing...</i></p>
        )
      }
    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
});


export default connect(mapStateToProps)(MiniPlayer);
