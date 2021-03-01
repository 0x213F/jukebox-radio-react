import { connect } from 'react-redux'
import styles from './MiniQueue.module.css';
import { getQueueDuration, flattenQueues } from '../utils';
import ReactTimeAgo from 'react-time-ago';


function MiniQueue(props) {

  const nextUpQueues = props.nextUpQueues,
        flattenedQueue = flattenQueues([nextUpQueues[0]]),
        expandedQueues = [...flattenedQueue, ...nextUpQueues.slice(1)],
        stream = props.stream;

  console.log(expandedQueues)

  // TODO needs to add however much is left inside now playing.
  const queueDuration = getQueueDuration(nextUpQueues, stream);
  const endsAt = new Date(Date.now() + queueDuration);

  /*
   * 🎨
   */
  return (
    <div className={styles.MiniQueue}>
      <h3><i>Next up...</i></h3>
      {queueDuration ?
        (
          <p><i>
            Playback will end&nbsp;
            <ReactTimeAgo future date={endsAt} locale="en-US" />
          </i></p>
        ) : (
          <p><i>
            There is nothing in the queue.
          </i></p>
        )
      }
      <div>
        {expandedQueues.map((queue, index) => {
          return (
            <div className={styles.MiniQueueItem}>
              {queue.track?.name || queue.collection?.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({
  nextUpQueues: state.nextUpQueues,
  stream: state.stream,
});


export default connect(mapStateToProps)(MiniQueue);
