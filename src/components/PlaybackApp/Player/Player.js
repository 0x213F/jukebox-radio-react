import { useState, useEffect } from "react";
import { connect } from 'react-redux';
import {
  getLeafQueue,
} from '../../../components/QueueApp/utils';
import { iconNextTrack, iconPrevTrack } from '../icons';
// import { featureIsEnabled } from '../utils';
import styles from './Player.module.css';


function Player(props) {

  /*
   * 🏗
   */
  const stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid],
        imageUrl = nowPlaying?.track?.imageUrl,
        track = stream?.nowPlaying?.track,
        lastUp = getLeafQueue(props.lastUpQueueUuids[props.lastUpQueueUuids.length - 1], props.queueMap),
        nextUp = getLeafQueue(props.nextUpQueueUuids[0], props.queueMap);

  // NOTE: This is a temporary mechanism to allow the user to refresh the
  //       progress value on the front-end.
  // eslint-disable-next-line
  const [counter, setCounter] = useState(0);

  const handleRefreshProgress = function() {
    setCounter(prev => prev + 1);
  }

  // BUG: Edge case needed to refresh the webpage. In the future, there should
  //      be an API endpoint to fetch additional past queue items.
  if(stream?.nowPlaying && stream?.nowPlaying?.index !== 1 && !lastUp) {
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
      <div className={styles.QueueItemContainer}>
        <div className={styles.QueueItemLast}>
          <div className={styles[lastUp?.track?.service]}>
            <img alt="" src={lastUp?.track?.imageUrl} />
          </div>
          <h5>
            {lastUp?.track?.name || "Nothing..."}
          </h5>
        </div>

        <div className={styles.QueueItemCurrent}>
          <div className={[styles.LargeImgContainer, styles[track?.service]].join(' ')}>
            <img alt="" src={imageUrl} />
          </div>
          <div className={styles.PlaybackControls}>
            <button onClick={props.prevTrack}
                    disabled={true}>
              {iconPrevTrack}
            </button>
            <button onClick={props.nextTrack}
                    disabled={true}>
              {iconNextTrack}
            </button>
          </div>
          <h5>
            {track?.name}
          </h5>
          <h6>
            {track?.artistName}
          </h6>
        </div>

        <div className={styles.QueueItemNext}>
          <div className={styles[nextUp?.track?.service]}>
            <img alt="" src={nextUp?.track?.imageUrl} />
          </div>
          <h5>
            {nextUp?.track.name || "Nothing..."}
          </h5>
        </div>
      </div>

    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
    queueMap: state.queueMap,
    lastUpQueueUuids: state.lastUpQueueUuids,
    nextUpQueueUuids: state.nextUpQueueUuids,
    playback: state.playback,
});


export default connect(mapStateToProps)(Player);
