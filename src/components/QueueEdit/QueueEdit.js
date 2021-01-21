import React, { useState, useEffect } from "react";
import { connect } from 'react-redux'
import { fetchCreateTrackMarker, fetchListTrackMarkers } from '../TrackMarker/network';
import { fetchCreateQueueInterval } from '../QueueInterval/network';
import TrackMarker from '../TrackMarker/TrackMarker'
import QueueInterval from '../QueueInterval/QueueInterval'


function QueueEdit(props) {

  const queue = props.data;

  const [markers, setMarkers] = useState([]);
  const [formMarkerTimestamp, setFormMarkerTimestamp] = useState('');
  const [lowerBoundMarkerUuid, setLowerBoundMarkerUuid] = useState('');
  const [upperBoundMarkerUuid, setUpperBoundMarkerUuid] = useState('');
  const [isMuted, setIsMuted] = useState('');

  useEffect(() => {
    async function loadData() {
      const responseJson = await fetchListTrackMarkers(queue.track.uuid);
      console.log(responseJson.data)
      setMarkers(responseJson.data.markers);
    }
    loadData();
  }, [])

  const createTrackMarker = async function() {
    await fetchCreateTrackMarker(queue.track.uuid, formMarkerTimestamp);
  }

  const createQueueInterval = async function() {
    await fetchCreateQueueInterval(
      queue.uuid,
      lowerBoundMarkerUuid,
      upperBoundMarkerUuid,
      true,
      null,
    )
  }

  console.log(markers)

  return (
    <div>
      <p>Markers</p>
      {markers.map((value, index) => (
        <TrackMarker key={index} data={value} />
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
        <QueueInterval key={index} data={value} />
      ))}
      <div>
        <select value={lowerBoundMarkerUuid} onChange={(e) => {setLowerBoundMarkerUuid(e.target.value)}}>
          <option value={null}>Beginning</option>
          {markers.map((value, index) => (
            <option value={value.uuid}>@ {value.timestampMilliseconds}</option>
          ))}
        </select>
        <select value={upperBoundMarkerUuid} onChange={(e) => {setUpperBoundMarkerUuid(e.target.value)}}>
          <option value={null}>End</option>
          {markers.map((value, index) => (
            <option value={value.uuid}>@ {value.timestampMilliseconds}</option>
          ))}
        </select>
        <button onClick={createQueueInterval}>Mute Interval</button>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({

});

export default connect(mapStateToProps)(QueueEdit);
