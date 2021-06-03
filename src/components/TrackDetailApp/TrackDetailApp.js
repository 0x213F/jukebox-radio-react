import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import Modal from 'react-modal';
import {
  fetchStreamMarkerCreate,
  fetchStreamMarkerDelete,
} from './Marker/network';
import {
  fetchStreamQueueIntervalCreate,
  fetchStreamQueueIntervalDelete,
} from './Interval/network';
import styles from './TrackDetailApp.module.css';
import {
  // eslint-disable-next-line
  iconForward1000,
  // eslint-disable-next-line
  iconForward100,
  // eslint-disable-next-line
  iconBackward100,
  // eslint-disable-next-line
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

  const RERENDER = (prev) => prev + 1;

  /*
   * 🏗
   */
  const isOpen = props.isOpen,
        closeModal = props.closeModal,
        playback = props.playback;

  const [queue, setQueue] = useState(removeIntervals(props.data));

  ////////////
  // Markers
  const markerMap = props.markerMap,
        originalMarkers = (
          Object.values(markerMap[queue.track.uuid] || [])
          .sort((a, b) => {
            return a.timestampMilliseconds - b.timestampMilliseconds;
          })
        ),
        [markers, setMarkers] = useState([]),
        // Interface which force rerenders the marker UI
        [rerenderMarkers, updateMarkers] = useState(0),
        // Create form
        [formMarkerTimestamp, setFormMarkerTimestamp] = useState(''),
        [formMarkerName, setFormMarkerName] = useState(''),
        // Feature flags
        [allowMarkerSeek, setAllowMarkerSeek] = useState(true),
        [allowMarkerDelete, setAllowMarkerDelete] = useState(false);

  //////////////
  // Intervals
        // Interface which force rerenders the interval UI
  const [rerenderIntervals, updateIntervals] = useState(0),
        // Create form
        [purpose, setPurpose] = useState('muted'),
        [lowerBoundMarkerUuid, setLowerBoundMarkerUuid] = useState('null'),
        [upperBoundMarkerUuid, setUpperBoundMarkerUuid] = useState('null'),
        [allowIntervalPlay, setAllowIntervalPlay] = useState(false),
        [allowIntervalDelete, setAllowIntervalDelete] = useState(false);


  ///////
  // UI
  const [tab, setTab] = useState('markers'),
        [motive, setMotive] = useState('listen'),
        [playPauseEnabled, setPlayPauseEnabled] = useState(true),
        [scanControlsEnabled, setScanControlsEnabled] = useState(false),
        // Interface which force rerenders the enabled status of playback
        [rerenderPlayPauseEnabled, updatePlayPauseEnabled] = useState(0);

  /*
   * Close the modal.
   */
  const handleCloseModal = function() {
    if(queue.status === "played") {
      playbackControlPause(playback, queue);
    }

    const now = Date.now();
    queue.startedAt = now;
    queue.status = "paused";
    queue.statusAt = now;
    setQueue({ ...props.data });
    setTab("markers");
    setMotive("listen");

    closeModal();
  }

  /*
   * Create a marker.
   */
  const createTrackMarker = async function() {
    let markerTimestamp;
    if(queue.track.service === 'youtube') {
      markerTimestamp = Math.round(formMarkerTimestamp / 1000) * 1000;
    } else {
      markerTimestamp = formMarkerTimestamp
    }
    const responseJson = await fetchStreamMarkerCreate(
      queue.track.uuid, markerTimestamp, queue.uuid, formMarkerName
    );
    await props.dispatch(responseJson.redux);
    // Reset form
    updateNewMarkerTimestamp('');
    setFormMarkerName('');
    // Rerender
    setMotive("listen");
    updateMarkers(RERENDER);
  }

  /*
   * Delete a marker.
   */
  const deleteTrackMarker = async function(marker) {
    const responseJson = await fetchStreamMarkerDelete(marker.uuid, queue.uuid);
    await props.dispatch(responseJson.redux);
    updateMarkers(RERENDER);
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
    // Reset form
    setLowerBoundMarkerUuid('null');
    setUpperBoundMarkerUuid('null');
    // Rerender
    setMotive("listen");
    updatePlayPauseEnabled(RERENDER);
    updateMarkers(RERENDER);
    updateIntervals(RERENDER);
  }

  /*
   * Delete an interval.
   */
  const deleteTrackInterval = async function(interval) {
    const responseJson = await fetchStreamQueueIntervalDelete(
      interval.uuid, queue.uuid, queue.parentUuid
    );
    await props.dispatch(responseJson.redux);
    updateIntervals(RERENDER);
  }

  /*
   * When the user clicks the play/ pause button.
   */
  const handlePlayPause = function () {
    if(!playPauseEnabled) {
      return;
    }
    if(queue.status === "played") {
      pause();
    } else if(queue.status === "paused") {
      play(queue.statusAt - queue.startedAt);
    } else {
      play(0);
    }
    updatePlayPauseEnabled(RERENDER);
  }

  /*
   * Small wrapper function which takes the current marker position and cleans
   * it to a valid position timestamp.
   */
  const updateNewMarkerTimestamp = function(positionMillisecondsRaw) {
    let positionMilliseconds;
    if(!positionMillisecondsRaw) {
      try {
        const arr = getPositionMilliseconds(queue, queue.startedAt);
        positionMilliseconds = arr[0];
      } catch (e) {
        positionMilliseconds = 0;
      }
    } else {
      positionMilliseconds = positionMillisecondsRaw;
    }
    if(queue.track.service === 'youtube') {
      positionMilliseconds = Math.round(positionMilliseconds / 1000) * 1000;
    }
    setFormMarkerTimestamp(positionMilliseconds);
    updateMarkers(RERENDER);
  }

  /*
   * Tab button: show markers UI
   */
  const showMarkers = function() {
    if(queue.status === "played") {
      playbackControlPause(playback, queue);
    }

    const now = Date.now();
    queue.startedAt = now;
    queue.status = "paused";
    queue.statusAt = now;
    setQueue(queue);

    setTab('markers');
    updatePlayPauseEnabled(RERENDER);
    updateIntervals(RERENDER);
    updateMarkers(RERENDER);
  }

  /*
   * Tab button: show markers UI
   */
  const showIntervals = function() {
    if(queue.status === "played") {
      playbackControlPause(playback, queue);
    }

    const now = Date.now();
    queue.startedAt = now;
    queue.status = "paused";
    queue.statusAt = now;
    setQueue(queue);

    setTab('intervals');
    updatePlayPauseEnabled(RERENDER);
    updateIntervals(RERENDER);
    updateMarkers(RERENDER);
  }

  /*
   * Motive button: show listen UI
   */
  const handleMotiveListen = function () {
    setMotive("listen");
    updatePlayPauseEnabled(RERENDER);
    updateIntervals(RERENDER);
    updateMarkers(RERENDER);
  }

  /*
   * Motive button: show create UI
   */
  const handleMotiveCreate = function () {
    setMotive("create");
    if(tab === "markers") {
      updateNewMarkerTimestamp();
    }
    if(queue.status === "played" && tab === "intervals") {
      pause();
    }
    updatePlayPauseEnabled(RERENDER);
    updateIntervals(RERENDER);
    updateMarkers(RERENDER);
  }

  /*
   * Motive button: show delete UI
   */
  const handleMotiveDelete = function () {
    if(tab === "intervals" && queue.status === "played") {
      pause();
    }
    setMotive("delete");
    updatePlayPauseEnabled(RERENDER);
    updateIntervals(RERENDER);
    updateMarkers(RERENDER);
  }

  /*
   * Handle...
   */
  const handleMarkerAdjust = function(delta) {
    setFormMarkerTimestamp(prev => prev + delta);
    updateMarkers(RERENDER);
  }

  /*
   * Handle...
   */
  const handleMarkerTimestamp = function(e) {
    setFormMarkerTimestamp(e.target.value);
    updateMarkers(RERENDER);
  }

  /*
   * Handle...
   */
  const handleMarkerName = function(e) {
    setFormMarkerName(e.target.value);
    updateMarkers(RERENDER);
  }

  /*
   * Handle...
   */
  const handleLowerBoundMarker = function(e) {
    const markerUuid = e.target.value;
    setLowerBoundMarkerUuid(markerUuid);
    updateIntervals(RERENDER);
    updateMarkers(RERENDER);
  }

  /*
   * Handle
   */
  const handleUpperBoundMarker = function(e) {
    const markerUuid = e.target.value;
    setUpperBoundMarkerUuid(markerUuid);
    updateIntervals(RERENDER);
    updateMarkers(RERENDER);
  }

  const play = function(progress) {
    const playbackControlFunc = (
      (queue.status === "paused" && progress === 0) ?
      playbackControlPlay : playbackControlStart
    );

    queue.startedAt = Date.now() - progress;
    queue.status = "played";
    queue.statusAt = Date.now();
    setQueue({...queue});

    playbackControlFunc(playback, queue);
    updateNewMarkerTimestamp();
  }

  const pause = function() {
    queue.status = "paused";
    queue.statusAt = Date.now();
    setQueue({...queue});

    playbackControlPause(playback, queue);
  }

  const seek = function(progress) {
    queue.startedAt = Date.now() - progress;
    queue.status = "played";
    queue.statusAt = Date.now();
    setQueue({...queue});

    playbackControlSeek(playback, queue);
    updateNewMarkerTimestamp();
  }

  const playbackControls = { play, pause, seek };

  /*
   * There has been an action taken by the user (something was clicked/
   * selected). So now this fires, which updates the data layer and the UI.
   */
  useEffect(() => {
    const shouldEnable = (
      (tab === "markers") ||
      (tab === "intervals" && motive === "listen")
    );
    if(shouldEnable) {
      setPlayPauseEnabled(true);
    } else {
      setPlayPauseEnabled(false);
    }

    if(tab === "markers" && motive === "create" && queue.status === 'paused') {
      setScanControlsEnabled(true);
    } else {
      setScanControlsEnabled(false);
    }

  // eslint-disable-next-line
  }, [isOpen, rerenderPlayPauseEnabled])

  /*
   * Update markers in the data layer. This happens because of a UI change or
   * a backend update (create/ delete marker).
   */
  useEffect(() => {
    const nextMarkers = [...originalMarkers];

    for(let i=0; i < nextMarkers.length; i++) {
      const creatingInterval = (
        tab === "intervals" &&
        motive === "create" &&
        (
          nextMarkers[i].uuid === lowerBoundMarkerUuid ||
          nextMarkers[i].uuid === upperBoundMarkerUuid
        )
      );
      if(creatingInterval) {
        nextMarkers[i].forceDisplay = true;
      } else {
        delete nextMarkers[i].forceDisplay;
      }
    }

    if(tab === "markers" && motive === "create") {
      nextMarkers.push({
        trackUuid: queue.track.uuid,
        timestampMilliseconds: formMarkerTimestamp,
        name: formMarkerName,
        forceDisplay: true,
      });
    }
    setMarkers(nextMarkers);

    if(tab === "markers" && (motive === "listen" || motive === "create")) {
      setAllowMarkerSeek(true);
    } else {
      setAllowMarkerSeek(false);
    }

    if(tab === "markers" && motive === "delete") {
      setAllowMarkerDelete(true);
    } else {
      setAllowMarkerDelete(false);
    }
  // eslint-disable-next-line
  }, [isOpen, rerenderMarkers]);

  /*
   * Update intervals in the data layer. This happens because of a UI change or
   * a backend update (create/ delete interval).
   */
  useEffect(() => {
    if(tab === "intervals") {
      setQueue(queue => ({
        ...queue,
        intervals: props.data.intervals,
        allIntervals: props.data.allIntervals,
        playbackIntervals: props.data.playbackIntervals,
      }));
    } else {
      setQueue(q => removeIntervals(q));
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
  // eslint-disable-next-line
  }, [isOpen, rerenderIntervals])

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
            <button className={styles.PreviewControlScan}
                    disabled={!scanControlsEnabled}
                    onClick={() => { handleMarkerAdjust(-1000); }}>
              {iconBackward1000}
            </button>
            <button className={styles.PreviewControlScan}
                    disabled={!scanControlsEnabled}
                    onClick={() => { handleMarkerAdjust(-100); }}>
              {iconBackward100}
            </button>
            <button className={styles.PreviewControl}
                    onClick={handlePlayPause}
                    disabled={!playPauseEnabled}>
              {queue.status === "played" ? iconPause : iconPlay}
            </button>
            <button className={styles.PreviewControlScan}
                    disabled={!scanControlsEnabled}
                    onClick={() => { handleMarkerAdjust(100); }}>
              {iconForward100}
            </button>
            <button className={styles.PreviewControlScan}
                    disabled={!scanControlsEnabled}
                    onClick={() => { handleMarkerAdjust(1000); }}>
              {iconForward1000}
            </button>
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
                     onChange={handleMarkerTimestamp} />
            </label>

            <label className={styles.FormLabel}>
              <span>
                Marker Name
              </span>
              <input className={styles.FormInput}
                     type="text"
                     value={formMarkerName}
                     onChange={handleMarkerName} />
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
                             deleteTrackMarker={deleteTrackMarker}
                             deleteTrackInterval={deleteTrackInterval}
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
