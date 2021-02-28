import { connect } from 'react-redux'
import styles from './MiniQueue.module.css';
import { getQueueDuration } from '../utils';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)


function MiniQueue(props) {

  const nextUpQueues = props.nextUpQueues,
        stream = props.stream;

  // TODO needs to add however much is left inside now playing.
  const queueDuration = getQueueDuration(nextUpQueues, stream);
  const endsAt = new Date(Date.now() + queueDuration);

  const msToTime = function(ms) {
    return new Date(ms).toISOString().slice(11, -1);
  }
  console.log(queueDuration)

  /*
   * 🎨
   */
  return (
    <div className={styles.MiniQueue}>
      <h3><i>Next up...</i></h3>
      {queueDuration ?
        (
          <p><i>
            The queue will end&nbsp;
            <ReactTimeAgo future date={endsAt} locale="en-US" />
          </i></p>
        ) : (
          <p><i>
            There is nothing in the queue.
          </i></p>
        )
      }
      <div>
        {nextUpQueues.map((queue, index) => {
          return (
            <div>
              {queue.collection?.name || queue.track?.name}
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
