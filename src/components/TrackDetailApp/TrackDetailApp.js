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
import { getPositionMilliseconds } from '../PlaybackApp/utils';


function TrackDetailApp(props) {

  const RERENDER = (prev) => prev + 1;

  /*
   * 🏗
   */
  const isOpen = props.isOpen,
        closeModal = props.closeModal,
        playback = props.playback,
        queueMap = props.queueMap,
        markerMap = props.markerMap,
        nowPlaying = queueMap[playback.nowPlayingUuid];

  ////////////
  // Markers
  const markers = Object.values(markerMap[nowPlaying?.track?.uuid] || {}) || [],
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
        // eslint-disable-next-line
        [playPauseEnabled, setPlayPauseEnabled] = useState(true),
        // eslint-disable-next-line
        [scanControlsEnabled, setScanControlsEnabled] = useState(true),
        // Interface which force rerenders the enabled status of playback
        [rerenderPlayPauseEnabled, updatePlayPauseEnabled] = useState(0);

  /*
   * Close the modal.
   */
  const handleCloseModal = function() {
    if(nowPlaying.status === "played") {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "pause",
            status: "kickoff",
            fake: true,
          },
        },
      });
    } else {
      props.dispatch({ type: 'playback/clearSeekTimeoutId' });
      props.dispatch({ type: "main/clearAutoplayTimeoutId" });
    }

    setTab("markers");
    setMotive("listen");

    closeModal();
  }

  /*
   * Create a marker.
   */
  const createTrackMarker = async function() {
    let markerTimestamp;
    if(nowPlaying.track.service === 'youtube') {
      markerTimestamp = Math.round(formMarkerTimestamp / 1000) * 1000;
    } else {
      markerTimestamp = formMarkerTimestamp
    }
    const responseJson = await fetchStreamMarkerCreate(
      nowPlaying.track.uuid, markerTimestamp, nowPlaying.uuid, formMarkerName
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
    const responseJson = await fetchStreamMarkerDelete(marker.uuid, nowPlaying.uuid);
    await props.dispatch(responseJson.redux);
    updateMarkers(RERENDER);
  }

  /*
   * Create an interval. Right now, the only interval is "muted."
   */
  const createQueueInterval = async function() {
    const responseJson = await fetchStreamQueueIntervalCreate(
      nowPlaying.uuid,
      lowerBoundMarkerUuid,
      upperBoundMarkerUuid,
      purpose,
      null,
      nowPlaying.parentUuid,
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
    if(nowPlaying.status === "played") {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "pause",
            status: "kickoff",
            fake: true,
          },
        },
      });
    }
    const responseJson = await fetchStreamQueueIntervalDelete(
      interval.uuid, nowPlaying.uuid, nowPlaying.parentUuid
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
    if(nowPlaying.status === "played") {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "pause",
            status: "kickoff",
            fake: true,
          },
        },
      });
    } else if(nowPlaying.status === "paused") {
      const timestampMilliseconds = (
        (tab === 'markers' && motive === "create") ?
        formMarkerTimestamp : nowPlaying.statusAt - nowPlaying.startedAt
      );
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "play",
            timestampMilliseconds: timestampMilliseconds,
            status: "kickoff",
            fake: true,
          },
        },
      });
    } else {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "play",
            timestampMilliseconds: 0,
            status: "kickoff",
            fake: true,
          },
        },
      });
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
        const arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt);
        positionMilliseconds = arr[0];
      } catch (e) {
        positionMilliseconds = 0;
      }
    } else {
      positionMilliseconds = positionMillisecondsRaw;
    }
    if(nowPlaying.track.service === 'youtube') {
      positionMilliseconds = Math.round(positionMilliseconds / 1000) * 1000;
    }
    setFormMarkerTimestamp(positionMilliseconds);
    updateMarkers(RERENDER);
  }

  /*
   * Tab button: show markers UI
   */
  const showMarkers = function() {
    setTab('markers');
    updatePlayPauseEnabled(RERENDER);
    updateIntervals(RERENDER);
    updateMarkers(RERENDER);
  }

  /*
   * Tab button: show markers UI
   */
  const showIntervals = function() {
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
    if(nowPlaying.status === "played" && tab === "intervals") {
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
    if(tab === "intervals" && nowPlaying.status === "played") {
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

  const pause = function() {
    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "pause",
          status: "kickoff",
          fake: true,
        },
      },
    });
  }

  /*
   * There has been an action taken by the user (something was clicked/
   * selected). So now this fires, which updates the data layer and the UI.
   */
  useEffect(() => {
    if(tab === "markers" && motive === "create" && nowPlaying.status === 'paused') {
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
    // if(tab === "markers" && motive === "create") {
    //   nextMarkers.push({
    //     trackUuid: nowPlaying.track.uuid,
    //     timestampMilliseconds: formMarkerTimestamp,
    //     name: formMarkerName,
    //     forceDisplay: true,
    //   });
    // }
    // setMarkers(nextMarkers);

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
    // if(tab === "intervals") {
    //   setQueue(nowPlaying => ({
    //     ...nowPlaying,
    //     intervals: props.data.intervals,
    //     allIntervals: props.data.allIntervals,
    //     playbackIntervals: props.data.playbackIntervals,
    //   }));
    // } else {
    //   setQueue(q => removeIntervals(q));
    // }

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
                 src={nowPlaying?.track?.imageUrl}
                 alt={"Album Art"} />
          </div>
          <div className={styles.PreviewControlContainer}>
            <button className={styles.PreviewControlScan}
                    disabled={!playPauseEnabled}
                    onClick={() => { handleMarkerAdjust(-1000); }}>
              {iconBackward1000}
            </button>
            <button className={styles.PreviewControlScan}
                    disabled={!playPauseEnabled}
                    onClick={() => { handleMarkerAdjust(-100); }}>
              {iconBackward100}
            </button>
            <button className={styles.PreviewControl}
                    onClick={handlePlayPause}
                    disabled={!playPauseEnabled}>
              {nowPlaying?.status === "played" ? iconPause : iconPlay}
            </button>
            <button className={styles.PreviewControlScan}
                    disabled={!playPauseEnabled}
                    onClick={() => { handleMarkerAdjust(100); }}>
              {iconForward100}
            </button>
            <button className={styles.PreviewControlScan}
                    disabled={!playPauseEnabled}
                    onClick={() => { handleMarkerAdjust(1000); }}>
              {iconForward1000}
            </button>
          </div>
        </div>

        <div className={styles.QueueName}>
          {nowPlaying?.track?.name}
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
          <ParentProgressBar mode={tab}
                             playbackControls={props.playbackControls}
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
  queueMap: state.queueMap,
});

export default connect(mapStateToProps)(TrackDetailApp);
