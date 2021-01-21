import React, { useState, useEffect } from "react";
import { connect } from 'react-redux'
import { fetchStreamQueueIntervalDelete } from './network';


function QueueInterval(props) {

  const { queueInterval, queueUuid, parentQueueUuid } = props.data;

  const deleteQueueInterval = async function() {
    await fetchStreamQueueIntervalDelete(queueInterval.uuid, queueUuid, parentQueueUuid);
  }

  const lowerBound = queueInterval.lowerBound ?
    queueInterval.lowerBound.timestampMilliseconds / 1000 : 'beginning';
  const upperBound = queueInterval.upperBound ?
    queueInterval.upperBound.timestampMilliseconds / 1000 : 'end';

  return (
    <div>
      <span>
        {lowerBound} =>
        {upperBound}
        ({queueInterval.isMuted ? 'muted' : 'played'})
      </span>
      <button onClick={deleteQueueInterval}>Delete</button>
    </div>
  );
}

const mapStateToProps = (state) => ({
  nextUpQueues: state.nextUpQueues,
});

export default connect(mapStateToProps)(QueueInterval);
