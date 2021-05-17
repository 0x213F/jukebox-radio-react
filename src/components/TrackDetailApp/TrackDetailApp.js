import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import Modal from 'react-modal';
import {
  fetchStreamMarkerCreate,
  fetchStreamMarkerList,
} from './Marker/network';
import {
  fetchStreamQueueIntervalCreate,
} from './Interval/network';
import styles from './TrackDetailApp.module.css';
import { iconForward1000, iconForward100, iconBackward100, iconBackward1000, iconPlay } from './icons';
import { iconBack } from './../../icons';
import ParentProgressBar from '../PlaybackApp/ParentProgressBar/ParentProgressBar';


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

  const [tab, setTab] = useState('markers'),
        [formMarkerTimestamp, setFormMarkerTimestamp] = useState(''),
        [formMarkerName, setFormMarkerName] = useState('');

  const [purpose, setPurpose] = useState('muted');
  const [lowerBoundMarkerUuid, setLowerBoundMarkerUuid] = useState('null');
  const [upperBoundMarkerUuid, setUpperBoundMarkerUuid] = useState('null');

  /*
   * Create a marker.
   */
  const createTrackMarker = async function() {
    const responseJson = await fetchStreamMarkerCreate(
      queue.track.uuid, formMarkerTimestamp, queueUuid, formMarkerName
    );
    await props.dispatch(responseJson.redux);
    setFormMarkerTimestamp('');
    setFormMarkerName('');
  }

  /*
   * Create an interval. Right now, the only interval is "muted."
   */
  const createQueueInterval = async function() {
    const responseJson = await fetchStreamQueueIntervalCreate(
      queue.uuid,
      lowerBoundMarkerUuid,
      upperBoundMarkerUuid,
      purpose,
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
   * Tab button: show markers UI
   */
  const showMarkers = function() {
    setTab('markers');
  }

  /*
   * Tab button: show markers UI
   */
  const showIntervals = function() {
    setTab('intervals');
  }

  /*
   * 🎨
   */
  return (
    <Modal isOpen={isOpen}
           ariaHideApp={false}
           className={styles.Modal}
           overlayClassName={styles.ModalOverlay}>

      <button className={styles.CloseModal}
              onClick={closeModal}>
        {iconBack}
      </button>

      <div className={styles.ModalContent}>

        <div className={styles.Preview}>
          <div className={[styles.PreviewImgContainer, styles[queue.track.service]].join(' ')}>
            <img className={styles.PreviewImg}
                 src={queue.track.imageUrl}
                 alt={"Album Art"} />
          </div>
          <div className={styles.PreviewControlContainer}>
            <button className={styles.PreviewControl}>{iconBackward1000}</button>
            <button className={styles.PreviewControl}>{iconBackward100}</button>
            <button className={styles.PreviewControl}>{iconPlay}</button>
            <button className={styles.PreviewControl}>{iconForward100}</button>
            <button className={styles.PreviewControl}>{iconForward1000}</button>
          </div>
        </div>

        <div className={styles.QueueName}>
          {queue.track.name}
        </div>

        <div className={styles.TabButtonContainer}>
          <button className={styles[tab === "markers" ? "TabButtonActive": "TabButton"]}
                  onClick={showMarkers}>
            Markers
          </button>
          <button className={styles[tab === "intervals" ? "TabButtonActive": "TabButton"]}
                  onClick={showIntervals}>
            Intervals
          </button>
        </div>

        {tab === "markers" &&
          <div className={styles.CreateMarkerForm}>
            <label className={styles.CreateMarkerFormLabel}>
              Marker Timestamp
              <input className={styles.CreateMarkerFormInput}
                     type="text"
                     value={formMarkerTimestamp}
                     onChange={(e) => {setFormMarkerTimestamp(e.target.value)}} />
            </label>

            <label className={styles.CreateMarkerFormLabel}>
              Marker Name
              <input className={styles.CreateMarkerFormInput}
                     type="text"
                     value={formMarkerName}
                     onChange={(e) => {setFormMarkerName(e.target.value)}} />
            </label>

            <button className={styles.CreateMarkerFormSubmit}
                    disabled={!(formMarkerTimestamp && formMarkerName)}
                    onClick={createTrackMarker}>
              Create
            </button>
          </div>
        }

        {tab === "intervals" &&
          <div className={styles.CreateIntervalForm}>
            <label className={styles.CreateIntervalFormLabel}>
              Modification
              <select className={styles.CreateIntervalFormSelect}
                      value={purpose}
                      onChange={(e) => {setPurpose(e.target.value)}}>
                <option value={'muted'}>Trim</option>
                <option value={'drums'}>Solo drums</option>
                <option value={'vocals'}>Solo vocals</option>
                <option value={'bass'}>Solo bass</option>
                <option value={'other'}>Solo other</option>
              </select>
            </label>

            <label className={styles.CreateIntervalFormLabel}>
              Start Marker
              <select className={styles.CreateIntervalFormSelect}
                      value={lowerBoundMarkerUuid}
                      onChange={(e) => {setLowerBoundMarkerUuid(e.target.value)}}>
                <option value={'null'}>Beginning</option>
                {markers.map((value, index) => (
                  <option key={index} value={value.uuid}>@ {value.timestampMilliseconds}</option>
                ))}
              </select>
            </label>

            <label className={styles.CreateIntervalFormLabel}>
              End Marker
              <select className={styles.CreateIntervalFormSelect}
                      value={upperBoundMarkerUuid}
                      onChange={(e) => {setUpperBoundMarkerUuid(e.target.value)}}>
                {markers.map((value, index) => (
                  <option key={index} value={value.uuid}>@ {value.timestampMilliseconds}</option>
                ))}
                <option value={'null'}>End</option>
              </select>
            </label>

            <button className={styles.CreateIntervalFormSubmit}
                    onClick={createQueueInterval}>
              Confirm
            </button>
          </div>
        }

        <div className={styles.ProgressBar}>
          <ParentProgressBar queue={queue}
                             stream={props.stream}
                             mode={tab}>
          </ParentProgressBar>
        </div>
      </div>
    </Modal>
  );
}

const mapStateToProps = (state) => ({
  trackMarkerMap: state.trackMarkerMap,
  stream: state.stream,
});

export default connect(mapStateToProps)(TrackDetailApp);
