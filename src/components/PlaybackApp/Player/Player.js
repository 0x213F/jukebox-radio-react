import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import {
  getNextUpQueue,
  getLastUpQueue,
} from '../../../components/QueueApp/utils';
import ParentProgressBar from '../ParentProgressBar/ParentProgressBar';
import { iconNextTrack, iconPrevTrack } from '../icons';
import styles from './Player.module.css';


function Player(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        playback = props.playback,
        imageUrl = stream.nowPlaying?.track?.imageUrl,
        track = stream?.nowPlaying?.track,
        lastUp = getLastUpQueue(props.lastUpQueues),
        nextUp = getNextUpQueue(props.nextUpQueues);

  // NOTE: This is a temporary mechanism to allow the user to refresh the
  //       progress value on the front-end.
  // eslint-disable-next-line
  const [counter, setCounter] = useState(0);

  const handleRefreshProgress = function() {
    setCounter(prev => prev + 1);
  }

  // BUG: Edge case needed to refresh the webpage. In the future, there should
  //      be an API endpoint to fetch additional past queue items.
  if(stream?.nowPlaying?.index !== 1 && !lastUp) {
    window.location.reload();
  }

  //////////////////////////////////////////////////////////////////////////////
  // RELOAD PROGRESS BAR
  useEffect(() => {
    const periodicTask = setInterval(() => {
      handleRefreshProgress();
    }, 100);

    return () => {
      clearInterval(periodicTask);
    }
  // eslint-disable-next-line
  }, []);

  return (
    <div className={styles.Player}>
      <div className={styles.Div}>
        <h4><i>Last...</i></h4>
        <p>{lastUp?.track?.name}</p>
      </div>

      <br></br>

      <div className={styles.Div}>
        <h2><i>Now playing...</i></h2>
        {imageUrl &&
          <img alt=""
               src={imageUrl}
               className={styles.Image} />
        }
        {(stream?.isPlaying || stream?.isPaused) &&
          <h3>{track?.name}</h3>
        }
        {(!stream?.isPlaying && !stream?.isPaused) &&
          <h3><i>Waiting...</i></h3>
        }
      </div>

      <div className={styles.Div}>
        <ParentProgressBar queue={stream?.nowPlaying}></ParentProgressBar>
      </div>

      <div className={styles.Div}>
        <button className={styles.Button}
                onClick={props.prevTrack}
                disabled={!playback.controlsEnabled}>
          {iconPrevTrack}
        </button>
        <button className={styles.Button}
                onClick={props.nextTrack}
                disabled={!playback.controlsEnabled}>
          {iconNextTrack}
        </button>
      </div>

      <br></br>

      <div className={styles.Div}>
        <h4><i>Next...</i></h4>
        <p>{nextUp?.track.name}</p>
      </div>

      <Link to="/app/queue">
        <button className={styles.MoreNextUp}>
          More
        </button>
      </Link>
    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
    lastUpQueues: state.lastUpQueues,
    nextUpQueues: state.nextUpQueues,
    playback: state.playback,
});


export default connect(mapStateToProps)(Player);
