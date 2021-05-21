import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import Modal from 'react-modal';
import {
  fetchStreamMarkerCreate,
} from './Marker/network';
import {
  fetchStreamQueueIntervalCreate,
} from './Interval/network';
import styles from './TrackDetailApp.module.css';
import {
  iconForward1000,
  iconForward100,
  iconBackward100,
  iconBackward1000,
  iconPlay,
  iconPause,
  iconMiniCheckboxChecked,
  iconMiniCheckboxUnchecked,
} from './icons';
import { iconBack } from './../../icons';
import ParentProgressBar from '../PlaybackApp/ParentProgressBar/ParentProgressBar';
import {
  playbackControlStart,
  playbackControlSeek,
  playbackControlPlay,
  playbackControlPause,
} from '../PlaybackApp/controls';
import { getPositionMilliseconds } from '../PlaybackApp/utils';
import { removeIntervals } from './utils';


function TrackDetailApp(props) {

  /*
   * 🏗
   */
  const [queue, setQueue] = useState(removeIntervals(props.data));

  const markerMap = props.markerMap,
        allMarkers = Object.values(markerMap[queue.track.uuid] || []).sort((a, b) => {
          return a.timestampMilliseconds - b.timestampMilliseconds;
        }),
        [markers, setMarkers] = useState(allMarkers);

  const [tab, setTab] = useState('markers'),
        [motive, setMotive] = useState('listen'),
        [playPauseEnabled, setPlayPauseEnabled] = useState(true),
        [formMarkerTimestamp, setFormMarkerTimestamp] = useState(''),
        [formMarkerName, setFormMarkerName] = useState(''),
        [allowMarkerSeek, setAllowMarkerSeek] = useState(true),
        [allowMarkerDelete, setAllowMarkerDelete] = useState(false),
        [allowIntervalPlay, setAllowIntervalPlay] = useState(false),
        [allowIntervalDelete, setAllowIntervalDelete] = useState(false),
        [pauseTimeoutId, setPauseTimeoutId] = useState(false);

  const [purpose, setPurpose] = useState('muted');
  const [lowerBoundMarkerUuid, setLowerBoundMarkerUuid] = useState('null');
  const [upperBoundMarkerUuid, setUpperBoundMarkerUuid] = useState('null');

  const isOpen = props.isOpen,
        closeModal = props.closeModal,
        playback = props.playback;

  /*
   * Create a marker.
   */
  const createTrackMarker = async function() {
    const responseJson = await fetchStreamMarkerCreate(
      queue.track.uuid, formMarkerTimestamp, queue.uuid, formMarkerName
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
      queue.parentUuid,
    );
    await props.dispatch(responseJson.redux);
  }

  const handleCloseModal = function() {
    if(queue.status === "played") {
      playbackControlPause(playback, queue);
      queue.status = "paused";
      queue.statusAt = Date.now();
      setQueue({...queue});
    }
    closeModal();
  }

  /*
   *
   */
  const handlePlayPause = function () {
    if(!playPauseEnabled || !playback.controlsEnabled) {
      return;
    }
    if(queue.status === "played") {
      pause();
    } else if(queue.status === "paused") {
      play(queue.statusAt - queue.startedAt);
    } else {
      play(0);
    }
  }

  const updateNewMarkerTimestamp = function() {
    // Update marker form with current timestamp
    let positionMilliseconds;
    try {
      const arr = getPositionMilliseconds(queue, queue.startedAt);
      positionMilliseconds = arr[0];
    } catch (e) {
      positionMilliseconds = 0;
    }
    if(queue.track.service === 'youtube') {
      positionMilliseconds = Math.round(positionMilliseconds / 1000) * 1000;
    }
    setFormMarkerTimestamp(positionMilliseconds);
  }

  /*
   * Tab button: show markers UI
   */
  const showMarkers = function() {
    if(queue.status === "played") {
      pause();
    }
    setTab('markers');
    setQueue(queue => removeIntervals(queue));
  }

  /*
   * Tab button: show markers UI
   */
  const showIntervals = function() {
    if(queue.status === "played") {
      pause();
    }
    setTab('intervals');
    setQueue(queue => ({
      ...queue,
      intervals: props.data.intervals,
      allIntervals: props.data.allIntervals,
      playbackIntervals: props.data.playbackIntervals,
    }));
  }

  /*
   *
   */
  const handleMotiveListen = function () {
    setMotive("listen");
  }

  /*
   *
   */
  const handleMotiveCreate = function () {
    setMotive("create");

    if(tab === "markers") {
      updateNewMarkerTimestamp();
    }
    if(queue.status === "played" && tab === "intervals") {
      // Pause playback
      pause();
    }
  }

  /*
   *
   */
  const handleMotiveDelete = function () {
    setMotive("delete");

    if(queue.status === "played") {
      // Pause playback
      pause();
    }
  }

  const handleLowerBoundMarker = function(e) {
    const markerUuid = e.target.value;
    setLowerBoundMarkerUuid(markerUuid);
  }

  const handleUpperBoundMarker = function(e) {
    const markerUuid = e.target.value;
    setUpperBoundMarkerUuid(markerUuid);
  }

  const play = function(progress) {
    setPlayPauseEnabled(true);
    const playbackControlFunc = (
      (queue.status === "paused" && progress === 0) ?
      playbackControlPlay : playbackControlStart
    );

    queue.startedAt = Date.now() - progress;
    queue.status = "played";
    queue.statusAt = Date.now();
    playbackControlFunc(playback, queue);
    setQueue({...queue});
    updateNewMarkerTimestamp();
  }

  const pause = function() {
    queue.status = "paused";
    queue.statusAt = Date.now();
    playbackControlPause(playback, queue);
    setQueue({...queue});
    updateNewMarkerTimestamp();
  }

  const seek = function(progress) {
    queue.startedAt = Date.now() - progress;
    queue.status = "played";
    queue.statusAt = Date.now();
    playbackControlSeek(playback, queue);
    setQueue({...queue});
    updateNewMarkerTimestamp();
  }

  const playbackControls = { play, pause, seek };

  useEffect(() => {
    const newMarkers = [...markers];

    const shouldEnable = (
      (tab === "markers" && motive === "listen") ||
      (tab === "markers" && motive === "create") ||
      (tab === "intervals" && motive === "listen")
    );
    if(shouldEnable) {
      setPlayPauseEnabled(true);
    } else {
      setPlayPauseEnabled(false);
    }

    for(let i=0; i < newMarkers.length; i++) {
      if((newMarkers[i].uuid === lowerBoundMarkerUuid || newMarkers[i].uuid === upperBoundMarkerUuid) && tab === "intervals" && motive === 'create') {
        newMarkers[i].forceDisplay = true;
      } else {
        delete newMarkers[i].forceDisplay;
      }
    }

    if(tab === "markers" && (motive === "listen" || motive === "create")) {
      setAllowMarkerSeek(true);
    } else {
      setAllowMarkerSeek(false);
    }

    if(tab === "markers" && motive === "create") {
      setMarkers([]);
    } else {
      setMarkers(allMarkers);
    }

    if(tab === "markers" && motive === "delete") {
      setAllowMarkerDelete(true);
    } else {
      setAllowMarkerDelete(false);
    }

    if(tab === "intervals" && motive === "listen") {
      setAllowIntervalPlay(true);
    } else {
      setAllowIntervalPlay(false);
    }

    if(tab === "intervals" && motive === "delete") {
      setAllowIntervalDelete(true);
    } else {
      setAllowIntervalDelete(false);
    }

    setMarkers(newMarkers);
  }, [lowerBoundMarkerUuid, upperBoundMarkerUuid, tab, motive])

  /*
   * 🎨
   */
  return (
    <Modal isOpen={isOpen}
           ariaHideApp={false}
           className={styles.Modal}
           overlayClassName={styles.ModalOverlay}>

      <button className={styles.CloseModal}
              onClick={handleCloseModal}>
        {iconBack}
      </button>

      <div className={styles.ModalContent}>

        <div className={styles.Preview}>
          <div className={styles.PreviewImgContainer}>
            <img className={styles.PreviewImg}
                 src={queue.track.imageUrl}
                 alt={"Album Art"} />
          </div>
          <div className={styles.PreviewControlContainer}>
            {/* <button className={styles.PreviewControl}>{iconBackward1000}</button> */}
            {/* <button className={styles.PreviewControl}>{iconBackward100}</button> */}
            <button className={styles[playPauseEnabled ? "PreviewControl" : "PreviewControlDisabled"]}
                    onClick={handlePlayPause}
                    disabled={!playPauseEnabled || !playback.controlsEnabled}>
              {queue.status === "played" ? iconPause : iconPlay}
            </button>
            {/* <button className={styles.PreviewControl}>{iconForward100}</button> */}
            {/* <button className={styles.PreviewControl}>{iconForward1000}</button> */}
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

        <div className={styles.MotiveContainer}>
          <label className={styles.MotiveCheckboxContainer}>
            <button onClick={handleMotiveListen}>
              {motive === "listen" ? iconMiniCheckboxChecked : iconMiniCheckboxUnchecked}
            </button>
            <span style={(motive !== "listen" && {color: "#BCBCBC"}) || {}}>
              Listen
            </span>
          </label>
          <label className={styles.MotiveCheckboxContainer}>
            <button onClick={handleMotiveCreate}>
              {motive === "create" ? iconMiniCheckboxChecked : iconMiniCheckboxUnchecked}
            </button>
            <span style={(motive !== "create" && {color: "#BCBCBC"}) || {}}>
              Create
            </span>
          </label>
          <label className={styles.MotiveCheckboxContainer}>
            <button onClick={handleMotiveDelete}>
              {motive === "delete" ? iconMiniCheckboxChecked : iconMiniCheckboxUnchecked}
            </button>
            <span style={(motive !== "delete" && {color: "#BCBCBC"}) || {}}>
              Delete
            </span>
          </label>
        </div>

        {tab === "markers" && motive === "create" &&
          <div className={styles.Form}>
            <label className={styles.FormLabel}>
              <span>
                Marker Timestamp
              </span>
              <input className={styles.FormInput}
                     type="text"
                     value={formMarkerTimestamp}
                     onChange={(e) => {setFormMarkerTimestamp(e.target.value)}} />
            </label>

            <label className={styles.FormLabel}>
              <span>
                Marker Name
              </span>
              <input className={styles.FormInput}
                     type="text"
                     value={formMarkerName}
                     onChange={(e) => {setFormMarkerName(e.target.value)}} />
            </label>

            <button className={styles.FormSubmit}
                    disabled={!(formMarkerTimestamp && formMarkerName)}
                    onClick={createTrackMarker}>
              Create
            </button>
          </div>
        }

        {tab === "intervals" && motive === "create" &&
          <div className={styles.Form}>
            <label className={styles.FormLabel}>
              <span>
                Modification
              </span>
              <select className={styles.FormSelect}
                      value={purpose}
                      onChange={(e) => {setPurpose(e.target.value)}}>
                <option value={'muted'}>Trim</option>
                <option value={'drums'}>Solo drums</option>
                <option value={'vocals'}>Solo vocals</option>
                <option value={'bass'}>Solo bass</option>
                <option value={'other'}>Solo other</option>
              </select>
            </label>

            <label className={styles.FormLabel}>
              <span>
                Start Marker
              </span>
              <select className={styles.FormSelect}
                      value={lowerBoundMarkerUuid}
                      onChange={handleLowerBoundMarker}>
                <option value={'null'}>Beginning</option>
                {markers.map((value, index) => (
                  <option key={index} value={value.uuid}>{value.name}</option>
                ))}
              </select>
            </label>

            <label className={styles.FormLabel}>
              <span>
                End Marker
              </span>
              <select className={styles.FormSelect}
                      value={upperBoundMarkerUuid}
                      onChange={handleUpperBoundMarker}>
                {markers.map((value, index) => (
                  <option key={index} value={value.uuid}>{value.name}</option>
                ))}
                <option value={'null'}>End</option>
              </select>
            </label>

            <button className={styles.FormSubmit}
                    onClick={createQueueInterval}>
              Create
            </button>
          </div>
        }

        <div className={styles.ProgressBar}>
          <ParentProgressBar queue={queue}
                             markers={markers}
                             mode={tab}
                             playbackControls={playbackControls}
                             allowMarkerSeek={allowMarkerSeek}
                             allowMarkerDelete={allowMarkerDelete}
                             allowIntervalPlay={allowIntervalPlay}
                             allowIntervalDelete={allowIntervalDelete}>
          </ParentProgressBar>
        </div>
      </div>
    </Modal>
  );
}

const mapStateToProps = (state) => ({
  markerMap: state.markerMap,
  stream: state.stream,
  playback: state.playback,
});

export default connect(mapStateToProps)(TrackDetailApp);
