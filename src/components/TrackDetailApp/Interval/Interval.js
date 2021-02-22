import React from "react";
import { connect } from 'react-redux';
import { fetchStreamQueueIntervalDelete } from './network';


function Interval(props) {

  const { queueInterval, queueUuid, parentQueueUuid } = props.data;

  const deleteQueueInterval = async function() {
    const responseJson = await fetchStreamQueueIntervalDelete(
      queueInterval.uuid, queueUuid, parentQueueUuid
    );
    await props.dispatch(responseJson.redux);
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

export default connect(mapStateToProps)(Interval);
