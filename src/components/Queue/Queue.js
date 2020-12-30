import React from 'react';
import PropTypes from 'prop-types';
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
  }

  /*
   * Load queues.
   */
  async componentDidMount() {
    const jsonResponse = await fetchListQueues();
    if(jsonResponse.system.status !== 200) {
      this.errorMessage = jsonResponse.system.message;
    } else {
      this.setState({ queues: jsonResponse.data });
    }
  }

  /*
   * Called inside a child component, this first deletes the queue from the
   * backend, then, on success, it deletes it from the front-end model and
   * view.
   */
  async destroyQueueItem(uuid) {
    const jsonResponse = await fetchDeleteQueue(uuid);
    if(jsonResponse.system.status !== 200) {
      this.errorMessage = jsonResponse.system.message;
      return;
    }
    const queues = this.state.queues;
    const filteredQueues = queues.filter(i => i.uuid !== uuid);
    await this.setState({ queues: filteredQueues });
  }

  /*
   * 🎨
   */
  render() {
    return (
      <div className={styles.Queue}>
        <div>
          {this.state.queues.map((value, index) => (
            <QueueItem key={index} data={value} destroy={this.destroyQueueItem}></QueueItem>
          ))}
        </div>
      </div>
    );
  }

}

Queue.propTypes = {};

Queue.defaultProps = {};

export default Queue;
