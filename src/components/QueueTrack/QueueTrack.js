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
   * When the user deletes a text comment.
   */
  const handleDelete = async function(e) {
    e.preventDefault();
    await props.destroy(queue.uuid);
  }

  /*
   * 🎨
   */
  const currentIndex = stream?.nowPlaying?.index || lastUp.index;
  const isNextUp = currentIndex < queue.index;
  const indent = queue.parentUuid && isNextUp ? '-' : '';
  return (
    <div className={styles.QueueTrack}>
      <span>
        {indent}
        {queue.track.name}
      </span>
      {isNextUp &&
        <button type="button" onClick={async (e) => { await props.destroy(queue); }}>
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
