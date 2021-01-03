import React from 'react';
import styles from './QueueItem.module.css';


class QueueItem extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    this.state = {
      // UI
      reveal: false,
    }

    // This binding is necessary to make `this` work in the callback.
    this.handleDelete = this.handleDelete.bind(this);
    this.toggleReveal = this.toggleReveal.bind(this);
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
   * When...
   */
  toggleReveal(event) {
    this.setState({ reveal: !this.state.reveal });
  }

  /*
   * 🎨
   */
  render() {
    const queue = this.props.data;
    const indent = '-'.repeat(queue.depth) + ' ';
    return (
      <div className={styles.QueueItem}>
        <span>
          {indent}
          {!queue.isDeleted && (queue.trackName || queue.collectionName)}
        </span>
        {!queue.isDeleted && queue.depth === 0 &&
          <button type="button" onClick={async (e) => { await this.props.destroy(this.props.data.uuid); }}>
            Delete
          </button>
        }
        {!queue.isDeleted && queue.depth === 1 &&
          <button type="button" onClick={async (e) => { await this.props.destroyChild(this.props.parentQueueUuid, this.props.data.uuid); }}>
            Delete
          </button>
        }
        {queue.children.length > 0 && !this.state.reveal &&
          <button type="button" onClick={this.toggleReveal}>
            More
          </button>
        }
        {queue.children.length > 0 && this.state.reveal &&
          <>
            <button type="button" onClick={this.toggleReveal}>
              Less
            </button>
            <div>
              {queue.children.map((value, index) => (
                <QueueItem key={index} data={value} destroy={this.props.destroy} destroyChild={this.props.destroyChild} parentQueueUuid={queue.uuid}></QueueItem>
              ))}
            </div>
          </>
        }
      </div>
    );
  }

}

QueueItem.propTypes = {};

QueueItem.defaultProps = {};

export default QueueItem;
