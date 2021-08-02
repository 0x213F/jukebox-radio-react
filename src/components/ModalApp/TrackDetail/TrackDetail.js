import React from "react";
import { connect } from 'react-redux';
import {
  fetchStreamMarkerCreate,
} from './Marker/network';
import {
  fetchStreamQueueIntervalCreate,
} from './Interval/network';
import styles from './TrackDetail.module.css';
import {
  iconMiniCheckboxChecked,
  iconMiniCheckboxUnchecked,
} from './icons';
import {
  iconInstrumentMicrophone,
  iconInstrumentDrums,
  iconInstrumentBass,
  iconInstrumentPiano,
  iconInstrumentOther,
} from './Interval/icons';
import { iconBack } from '../../../icons';
import * as services from '../../../config/services';
import * as tabs from '../../../config/tabs';
import * as motives from '../../../config/motives';
import * as progressBarUtils from '../../PlaybackApp/ProgressBar/utils';
import { getPositionMilliseconds } from '../../PlaybackApp/utils';


function TrackDetail(props) {

  /*
   * 🏗
   */
  const playback = props.playback,
        queueMap = props.queueMap,
        markerMap = props.markerMap,
        stream = props.stream,
        nowPlaying = queueMap[playback.nowPlayingUuid],
        trackDetail = props.trackDetail;

  const { motive, tab } = trackDetail;

  const intervalModificationsOptions = (
    nowPlaying?.track?.service === services.JUKEBOX_RADIO ?
    [{value: 'muted', name: 'Trim'}, {value: 'stems', name: 'Stem isolation'}] :
    [{value: 'muted', name: 'Trim'}]
  );

  const stemChoices = [
    {value: 'vocals', display: iconInstrumentMicrophone},
    {value: 'drums', display: iconInstrumentDrums},
    {value: 'bass', display: iconInstrumentBass},
    {value: 'piano', display: iconInstrumentPiano},
    {value: 'other', display: iconInstrumentOther},
  ];

  ////////////
  // Marker form
  const formMarkerTimestamp = trackDetail.form.marker.timestamp,
        formMarkerName = trackDetail.form.marker.name;

  ////////////
  // Interval form
  const modification = trackDetail.form.interval.modification,
        lowerBoundMarkerUuid = trackDetail.form.interval.lowerBoundMarkerUuid,
        upperBoundMarkerUuid = trackDetail.form.interval.upperBoundMarkerUuid;

  ////////////
  // Markers
  let markers;
  markers = progressBarUtils.getMarkers(markerMap, nowPlaying?.track?.uuid);

  let duration, arr, position;

  try {
    duration = nowPlaying.track.durationMilliseconds || 0;
    arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt);
    position = arr[0];
  } catch (e) {
    duration = 1000;
    position = 500;
  }

  markers = progressBarUtils.cleanMarkers(markers, nowPlaying, duration, position);

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

    props.dispatch({ type: "trackDetail/reset" });

    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "mount",
          stream: stream,
          status: "kickoff",
          fake: true,  // symbolic, not functional
        },
      },
    });

    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "closeModal",
          status: "kickoff",
          fake: true,  // symbolic, not functional
        },
      },
    });
  }

  /*
   * Create a marker.
   */
  const createTrackMarker = async function() {
    let markerTimestamp;
    if(nowPlaying.track.service === services.YOUTUBE) {
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
    props.dispatch({
      type: "trackDetail/setForm",
      payload: { marker: { timestamp: '', name: '' } },
    });
    // Rerender
    props.dispatch({
      type: "trackDetail/setMotive",
      payload: { motive: motives.LISTEN },
    });
  }

  /*
   * Create an interval. Right now, the only interval is "muted."
   */
  const createQueueInterval = async function() {
    const responseJson = await fetchStreamQueueIntervalCreate(
      nowPlaying.uuid,
      lowerBoundMarkerUuid,
      upperBoundMarkerUuid,
      modification,
      null,
      nowPlaying.parentUuid,
    );
    await props.dispatch(responseJson.redux);
    // Reset form
    props.dispatch({
      type: "trackDetail/setForm",
      payload: {
        interval: { lowerBoundMarkerUuid: '', upperBoundMarkerUuid: '' }
      },
    });
    // Rerender
    props.dispatch({
      type: "trackDetail/setMotive",
      payload: { motive: motives.LISTEN },
    });
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
    if(nowPlaying.track.service === services.YOUTUBE) {
      positionMilliseconds = Math.round(positionMilliseconds / 1000) * 1000;
    }
    props.dispatch({
      type: "trackDetail/setForm",
      payload: { marker: { timestamp: positionMilliseconds } },
    });
  }

  /*
   * Tab button: show markers UI
   */
  const showMarkers = function() {
    props.dispatch({
      type: "trackDetail/setTab",
      payload: { tab: tabs.MARKERS },
    });
  }

  /*
   * Tab button: show markers UI
   */
  const showIntervals = function() {
    props.dispatch({
      type: "trackDetail/setTab",
      payload: { tab: tabs.INTERVALS },
    });
  }

  /*
   * Motive button: show listen UI
   */
  const handleMotiveListen = function () {
    props.dispatch({
      type: "trackDetail/setMotive",
      payload: { motive: motives.LISTEN },
    });
  }

  /*
   * Motive button: show create UI
   */
  const handleMotiveCreate = function () {
    props.dispatch({
      type: "trackDetail/setMotive",
      payload: { motive: motives.CREATE },
    });
    if(tab === tabs.MARKERS) {
      updateNewMarkerTimestamp();
    }
  }

  /*
   * Motive button: show delete UI
   */
  const handleMotiveDelete = function () {
    if(tab === tabs.INTERVALS && nowPlaying.status === "played") {
      pause();
    }
    props.dispatch({
      type: "trackDetail/setMotive",
      payload: { motive: motives.DELETE },
    });
  }

  /*
   * Handle...
   */
  const handleMarkerTimestamp = function(e) {
    props.dispatch({
      type: "trackDetail/setForm",
      payload: { marker: { timestamp: e.target.value } },
    });
  }

  /*
   * Handle...
   */
  const handleMarkerName = function(e) {
    props.dispatch({
      type: "trackDetail/setForm",
      payload: { marker: { name: e.target.value } },
    });
  }

  /*
   * Handle...
   */
  const handleModification = function(e) {
    props.dispatch({
      type: "trackDetail/setForm",
      payload: { interval: { modification: e.target.value } },
    });
  }

  /*
   * Handle...
   */
  const handleLowerBoundMarker = function(e) {
    props.dispatch({
      type: "trackDetail/setForm",
      payload: { interval: { lowerBoundMarkerUuid: e.target.value } },
    });
  }

  /*
   * Handle
   */
  const handleUpperBoundMarker = function(e) {
    props.dispatch({
      type: "trackDetail/setForm",
      payload: { interval: { upperBoundMarkerUuid: e.target.value } },
    });
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
   * 🎨
   */
  return (
    <>
      <button className={styles.CloseModal}
              onClick={handleCloseModal}>
        {iconBack}
      </button>

      <div className={styles.ModalContent}>

        <div className={styles.QueueName}>
          {nowPlaying?.track?.name}
        </div>

        <div className={styles.TabButtonContainer}>
          <button className={styles[tab === tabs.MARKERS ? "TabButtonActive": "TabButton"]}
                  onClick={showMarkers}>
            Markers
          </button>
          <button className={styles[tab === tabs.INTERVALS ? "TabButtonActive": "TabButton"]}
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

        {tab === tabs.MARKERS && motive === "create" &&
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

        {tab === tabs.INTERVALS && motive === "create" &&
          <div className={styles.Form}>
            <label className={styles.FormLabel}>
              <span>
                Modification
              </span>
              <select className={styles.FormSelect}
                      value={modification}
                      onChange={handleModification}>
                {intervalModificationsOptions.map((value, index) => (
                  <option key={index} value={value.value}>{value.name}</option>
                ))}
              </select>
            </label>

            {modification === 'muted' &&
              <>
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
              </>
            }

            {modification === 'stems' &&
            <label className={styles.FormLabel}>
              <span>
                Stems
              </span>
              {stemChoices.map((value, index) => (
                <button key={index} className={styles.StemCheckbox}>{value.display}</button>
              ))}
            </label>
            }

            <button className={styles.FormSubmit}
                    onClick={createQueueInterval}>
              Create
            </button>
          </div>
        }
      </div>
    </>
  );
}

const mapStateToProps = (state) => ({
  markerMap: state.markerMap,
  stream: state.stream,
  playback: state.playback,
  queueMap: state.queueMap,
  trackDetail: state.trackDetail,
});

export default connect(mapStateToProps)(TrackDetail);
