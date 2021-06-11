import { connect } from 'react-redux'
import styles from './MiniQueue.module.css';
import { getQueues, getQueueDuration } from '../utils';
import ReactTimeAgo from 'react-time-ago';


function MiniQueue(props) {

  const nextUpQueueUuids = props.nextUpQueueUuids,
        stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid];

  const nextUpQueues = getQueues(nextUpQueueUuids, queueMap);

  // TODO needs to add however much is left inside now playing.
  const queueDuration = getQueueDuration(nextUpQueues, nowPlaying);
  const endsAt = new Date(Date.now() + queueDuration);

  /*
   * 🎨
   */
  return (
    <div className={styles.MiniQueue}>
      <h3>Queue</h3>
      {queueDuration ?
        (
          <p>
            Playback will end&nbsp;
            <ReactTimeAgo future date={endsAt} locale="en-US" />
          </p>
        ) : (
          <p>
            There is nothing in the queue.
          </p>
        )
      }
    </div>
  );
}


const mapStateToProps = (state) => ({
  nextUpQueueUuids: state.nextUpQueueUuids,
  stream: state.stream,
  queueMap: state.queueMap,
});


export default connect(mapStateToProps)(MiniQueue);
