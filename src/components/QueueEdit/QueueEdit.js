import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import {
  fetchStreamMarkerCreate,
  fetchStreamMarkerList,
} from '../TrackMarker/network';
import {
  fetchStreamQueueIntervalCreate,
} from '../QueueInterval/network';
import TrackMarker from '../TrackMarker/TrackMarker'
import QueueInterval from '../QueueInterval/QueueInterval'


function QueueEdit(props) {

  const queue = props.data,
        queueUuid = queue.uuid,
        parentQueueUuid = queue.parentUuid,
        trackMarkerMap = props.trackMarkerMap;

  const markers = trackMarkerMap[queueUuid] || [];

  const [formMarkerTimestamp, setFormMarkerTimestamp] = useState('');
  const [lowerBoundMarkerUuid, setLowerBoundMarkerUuid] = useState('null');
  const [upperBoundMarkerUuid, setUpperBoundMarkerUuid] = useState('null');

  useEffect(() => {
    async function loadData() {
      await fetchStreamMarkerList(queue.track.uuid, queueUuid);
    }
    loadData();
  }, [queue, queueUuid])

  const createTrackMarker = async function() {
    await fetchStreamMarkerCreate(queue.track.uuid, formMarkerTimestamp, queueUuid);
    setFormMarkerTimestamp('');
  }

  const createQueueInterval = async function() {
    await fetchStreamQueueIntervalCreate(
      queue.uuid,
      lowerBoundMarkerUuid,
      upperBoundMarkerUuid,
      true,
      null,
      parentQueueUuid,
    )
  }

  return (
    <div>
      <p>Markers</p>
      {markers.map((value, index) => (
        <TrackMarker key={index}
                     data={{
                       trackMarker: value,
                       queueUuid: queueUuid,
                     }} />
      ))}
      <div>
        <input type="text"
               name="timestampMilliseconds"
               placeholder="timestamp"
               value={formMarkerTimestamp}
               onChange={(e) => {setFormMarkerTimestamp(e.target.value)}} />
        <button onClick={createTrackMarker}>Create Marker</button>
      </div>
      <p>Intervals</p>
      {queue.intervals.map((value, index) => (
        <QueueInterval key={index}
                       data={{
                         queueInterval: value,
                         queueUuid: queueUuid,
                         parentQueueUuid: parentQueueUuid,
                       }} />
      ))}
      <div>
        <select value={lowerBoundMarkerUuid} onChange={(e) => {setLowerBoundMarkerUuid(e.target.value)}}>
          <option value={'null'}>Beginning</option>
          {markers.map((value, index) => (
            <option key={index} value={value.uuid}>@ {value.timestampMilliseconds}</option>
          ))}
        </select>
        <select value={upperBoundMarkerUuid} onChange={(e) => {setUpperBoundMarkerUuid(e.target.value)}}>
          <option value={'null'}>End</option>
          {markers.map((value, index) => (
            <option key={index} value={value.uuid}>@ {value.timestampMilliseconds}</option>
          ))}
        </select>
        <button onClick={createQueueInterval}>Mute Interval</button>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  trackMarkerMap: state.trackMarkerMap,
});

export default connect(mapStateToProps)(QueueEdit);
