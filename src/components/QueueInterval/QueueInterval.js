import React, { useState, useEffect } from "react";
import { connect } from 'react-redux'
import { fetchDeleteQueueInterval } from './network';


function QueueInterval(props) {

  const queueInterval = props.data;

  const deleteQueueInterval = async function() {
    await fetchDeleteQueueInterval(queueInterval.uuid);
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

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(QueueInterval);
