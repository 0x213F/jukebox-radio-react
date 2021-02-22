import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import Modal from 'react-modal';
import {
  fetchStreamMarkerCreate,
  fetchStreamMarkerList,
} from './Marker/network';
import Interval from './Interval/Interval';
import {
  fetchStreamQueueIntervalCreate,
} from './Interval/network';
import Marker from './Marker/Marker'


function TrackDetailApp(props) {

  /*
   * 🏗
   */
  const queue = props.data,
        queueUuid = queue.uuid,
        parentQueueUuid = queue.parentUuid,
        // modal
        shouldOpenModal = props.shouldOpenModal,
        setShouldOpenModal = props.setShouldOpenModal,
        isOpen = props.isOpen,
        openModal = props.openModal,
        closeModal = props.closeModal,
        // Redux
        trackMarkerMap = props.trackMarkerMap,
        markers = trackMarkerMap[queueUuid] || [];

  const [formMarkerTimestamp, setFormMarkerTimestamp] = useState('');
  const [lowerBoundMarkerUuid, setLowerBoundMarkerUuid] = useState('null');
  const [upperBoundMarkerUuid, setUpperBoundMarkerUuid] = useState('null');

  /*
   * Create a marker.
   */
  const createTrackMarker = async function() {
    const responseJson = await fetchStreamMarkerCreate(
      queue.track.uuid, formMarkerTimestamp, queueUuid
    );
    await props.dispatch(responseJson.redux);
    setFormMarkerTimestamp('');
  }

  /*
   * Create an interval. Right now, the only interval is "muted."
   */
  const createQueueInterval = async function() {
    const responseJson = await fetchStreamQueueIntervalCreate(
      queue.uuid,
      lowerBoundMarkerUuid,
      upperBoundMarkerUuid,
      true,
      null,
      parentQueueUuid,
    );
    await props.dispatch(responseJson.redux);
  }

  ////////////////////////////////////////////////////////
  // load markers that need to be displayed in the modal
  useEffect(() => {
    async function loadData() {
      const responseJson = await fetchStreamMarkerList(
        queue.track.uuid, queueUuid
      );
      await props.dispatch(responseJson.redux);
      openModal();
    }
    if(!shouldOpenModal) {
      return;
    }
    setShouldOpenModal(false);
    loadData();
  // eslint-disable-next-line
  }, [shouldOpenModal])

  /*
   * 🎨
   */
  return (
    <Modal isOpen={isOpen}
           ariaHideApp={false}>
      <button onClick={closeModal}>Close</button>
      <p>Markers</p>
      {markers.map((value, index) => (
        <Marker key={index}
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
        <Interval key={index}
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
          {markers.map((value, index) => (
            <option key={index} value={value.uuid}>@ {value.timestampMilliseconds}</option>
          ))}
          <option value={'null'}>End</option>
        </select>
        <button onClick={createQueueInterval}>Mute Interval</button>
      </div>
    </Modal>
  );
}

const mapStateToProps = (state) => ({
  trackMarkerMap: state.trackMarkerMap,
});

export default connect(mapStateToProps)(TrackDetailApp);
