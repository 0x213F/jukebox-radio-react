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
      <div style={{width: "100%"}}>

        <div className={styles.QueueItemContainer}>
          <div className={styles.QueueItemLast}>
            <div>
              <img alt="" src={lastUp?.track?.imageUrl} />
            </div>
            <h5>
              {lastUp?.track?.name || "Nothing..."}
            </h5>
          </div>

          <div className={styles.QueueItemCurrent}>
            <div>
              <img alt="" src={imageUrl} />
            </div>
            <h5>
              {track?.name}
            </h5>
            <h6>
              {track?.artistName}
            </h6>
          </div>

          <div className={styles.QueueItemNext}>
            <div>
              <img alt="" src={nextUp?.track?.imageUrl} />
            </div>
            <h5>
              {nextUp?.track.name || "Nothing..."}
            </h5>
          </div>
        </div>

        <div className={styles.PlaybackControls}>
          <button onClick={props.prevTrack}
                  disabled={!playback.controlsEnabled}>
            {iconPrevTrack}
          </button>
          <button onClick={props.nextTrack}
                  disabled={!playback.controlsEnabled}>
            {iconNextTrack}
          </button>
        </div>

        {stream?.nowPlaying && stream?.nowPlaying.track &&
          <div className={styles.ProgressBarContainer}>
            <ParentProgressBar queue={stream?.nowPlaying}
                               stream={stream}
                               mode={"player"}>
            </ParentProgressBar>
          </div>
        }
      </div>
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
