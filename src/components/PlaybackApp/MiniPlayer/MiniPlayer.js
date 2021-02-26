import React from "react";
import { connect } from 'react-redux';
import styles from './MiniPlayer.module.css';


function MiniPlayer(props) {

  const stream = props.stream;

  return (
    <div>
      <h3><i>Now playing...</i></h3>
        <img alt=""
             src={stream.nowPlaying?.track?.imageUrl}
             className={styles.Image} />
      <p>{stream.nowPlaying?.track?.name}</p>
    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
});


export default connect(mapStateToProps)(MiniPlayer);
