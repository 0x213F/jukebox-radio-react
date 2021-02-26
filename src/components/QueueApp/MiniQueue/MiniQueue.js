import { connect } from 'react-redux'
import styles from './MiniQueue.module.css';
import { getQueueDuration } from '../utils';


function MiniQueue(props) {

  const nextUpQueues = props.nextUpQueues,
        stream = props.stream;

  // TODO needs to add however much is left inside now playing.
  const queueDuration = getQueueDuration(nextUpQueues, stream);
  const endsAt = new Date(Date.now() + queueDuration);

  const msToTime = function(ms) {
    return new Date(ms).toISOString().slice(11, -1);
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.MiniQueue}>
      <h3><i>Next up...</i></h3>
      <div>
        {nextUpQueues.map((queue, index) => {
          return (
            <div>
              {queue.collection?.name || queue.track?.name}
            </div>
          );
        })}
      </div>

      <br></br>

      <p>
        Total of {msToTime(queueDuration)}
      </p>

      <p>
        Ends at {endsAt.toLocaleTimeString()}
      </p>
    </div>
  );
}


const mapStateToProps = (state) => ({
  nextUpQueues: state.nextUpQueues,
  stream: state.stream,
});


export default connect(mapStateToProps)(MiniQueue);
