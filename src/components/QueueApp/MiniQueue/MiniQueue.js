import { connect } from 'react-redux'
import styles from './MiniQueue.module.css';
import { getQueueDuration, flattenQueues } from '../utils';
import ReactTimeAgo from 'react-time-ago';


function MiniQueue(props) {

  const nextUpQueues = props.nextUpQueues,
        stream = props.stream;

  let flattenedQueue, expandedQueues;
  if(nextUpQueues.length) {
    flattenedQueue = flattenQueues([nextUpQueues[0]]);
    expandedQueues = [...flattenedQueue, ...nextUpQueues.slice(1)];
  } else {
    expandedQueues = [];
  }

  // TODO needs to add however much is left inside now playing.
  const queueDuration = getQueueDuration(nextUpQueues, stream);
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
      <ol>
        {expandedQueues.map((queue, index) => {
          return (
            <li key={index} className={styles.MiniQueueItem}>
              {queue.track?.name || queue.collection?.name}
            </li>
          );
        })}
      </ol>
    </div>
  );
}


const mapStateToProps = (state) => ({
  nextUpQueues: state.nextUpQueues,
  stream: state.stream,
});


export default connect(mapStateToProps)(MiniQueue);
