import { connect } from 'react-redux'
import styles from './QueueTrack.module.css';


function QueueTrack(props) {

  /*
   * 🏗
   */
  const queue = props.data,
        stream = props.stream,
        lastUp = props.lastUp;

  /*
   * 🎨
   */
  const currentIndex = stream?.nowPlaying?.index || lastUp?.index;
  const isNextUp = !currentIndex || currentIndex < queue.index;
  const indent = queue.parentUuid && isNextUp ? '-' : '';
  return (
    <div className={styles.QueueTrack}>
      <span>
        {indent}
        {queue.track.name}
      </span>
      {isNextUp &&
        <button className={styles.Button} type="button" onClick={async (e) => { await props.destroy(queue); }}>
          Delete
        </button>
      }
    </div>
  );
}

const mapStateToProps = (state) => ({
  stream: state.stream,
  lastUp: state.lastUp,
});

export default connect(mapStateToProps)(QueueTrack);
