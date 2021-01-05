import React from 'react';
import styles from './Queue.module.css';
import { fetchListQueues, fetchDeleteQueue } from './network'
import QueueItem from '../QueueItem/QueueItem'


class Queue extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    this.state = {
      // UI
      errorMessage: null,
      // Data
      queues: [],
    };

    // This binding is necessary to make `this` work in the callback.
    this.destroyQueueItem = this.destroyQueueItem.bind(this);
    this.destroyChildQueueItem = this.destroyChildQueueItem.bind(this);
  }

  /*
   * Load queues.
   */
  async componentDidMount() {
    const jsonResponse = await fetchListQueues();
    if(jsonResponse.system.status !== 200) {
      this.errorMessage = jsonResponse.system.message;
    } else {
      const { nextUpQueues } = jsonResponse.data;
      this.setState({ queues: nextUpQueues });
      if(!nextUpQueues.length) {
        localStorage.setItem('lastQueueUuid', '');
        return;
      }
      const lastQueueUuid = nextUpQueues[nextUpQueues.length - 1].uuid;
      localStorage.setItem('lastQueueUuid', lastQueueUuid);
    }
  }

  /*
   * Called inside a child component, this first deletes the queue from the
   * backend, then, on success, it deletes it from the front-end model and
   * view.
   */
  async destroyQueueItem(queueUuid) {
    await fetchDeleteQueue(queueUuid);
    const queues = this.state.queues;
    const filteredQueues = queues.filter(i => i.uuid !== queueUuid);
    await this.setState({ queues: filteredQueues });
  }

  async destroyChildQueueItem(parentQueueUuid, childQueueUuid) {
    await fetchDeleteQueue(childQueueUuid);

    const queuesCopy = [...this.state.queues];
    const parentIndex = queuesCopy.findIndex(i => i.uuid === parentQueueUuid);

    const children = queuesCopy[parentIndex].children;
    const filteredChildren = children.filter(i => i.uuid !== childQueueUuid);
    queuesCopy[parentIndex].children = filteredChildren;

    await this.setState({ queues: queuesCopy });
  }

  /*
   * 🎨
   */
  render() {
    return (
      <div className={styles.Queue}>
        <div>
          {this.state.queues.map((value, index) => (
            <QueueItem key={index} data={value} destroy={this.destroyQueueItem} destroyChild={this.destroyChildQueueItem}></QueueItem>
          ))}
        </div>
      </div>
    );
  }

}

Queue.propTypes = {};

Queue.defaultProps = {};

export default Queue;
