import React from 'react';
import styles from './QueueItem.module.css';


class QueueItem extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    // This binding is necessary to make `this` work in the callback.
    this.handleDelete = this.handleDelete.bind(this);
  }

  /*
   * When the user deletes a text comment.
   */
  async handleDelete(event) {
    event.preventDefault();
    const queueUuid = this.props.data.uuid;
    await this.props.destroy(queueUuid);
  }

  /*
   * 🎨
   */
  render() {
    const queue = this.props.data;
    return (
      <div className={styles.QueueItem}>
        <span>{queue.trackName || queue.collectionName}</span>
        <form onSubmit={async (e) => { await this.handleDelete(e); }}>
          <button type="submit">
            Delete
          </button>
        </form>
      </div>
    );
  }

}

QueueItem.propTypes = {};

QueueItem.defaultProps = {};

export default QueueItem;
