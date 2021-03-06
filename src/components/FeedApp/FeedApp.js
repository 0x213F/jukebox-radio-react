import React, { useState, useEffect, useRef } from "react";

import { connect } from 'react-redux';
import MicRecorder from 'mic-recorder-to-mp3';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import ABCNotationDisplay from './ABCNotationDisplay/ABCNotationDisplay';
import ABCNotationCompose from './ABCNotationCompose/ABCNotationCompose';
import VoiceRecording from './VoiceRecording/VoiceRecording';
import { getPositionMilliseconds } from '../PlaybackApp/utils';
import { CLASS_TEXT_COMMENT, CLASS_VOICE_RECORDING, CLASS_SYSTEM_ACTION } from '../../config/model';
import {
  SERVICE_YOUTUBE,
  SERVICE_APPLE_MUSIC,
} from '../../config/services';

import styles from './FeedApp.module.css';
import { fetchTextCommentCreate } from './network';
import { FORMAT_TEXT, FORMAT_ABC_NOTATION } from './constants';
import { fetchCreateVoiceRecording } from './VoiceRecording/network';
import TextComment from './TextComment/TextComment';
import SystemAction from './SystemAction/SystemAction';


function FeedApp(props) {

  /*
   * 🏗
   */
  const feedApp = props.feedApp,
        feed = feedApp.feed,
        stream = props.stream,
        queueMap = props.queueMap,
        nowPlaying = queueMap[stream.nowPlayingUuid];

  const [textCommentText, setTextCommentText] = useState('');
  const [textCommentTrackUuid, setTextCommentTrackUuid] = useState(undefined);
  const [textCommentTimestamp, setTextCommentTimestamp] = useState(undefined);

  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(new MicRecorder({ bitRate: 320 }));

  // Modal displays ABCNotationCompose
  const [showModal, setShowModal] = useState(false);

  const contentContainer = useRef();

  /*
   * Opens the modal, showing ABCNotationCompose.
   */
  const openModal = function() {
    const arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
          position = arr[0];
    setTextCommentTrackUuid(nowPlaying.track.uuid);
    setTextCommentTimestamp(position);
    setShowModal(true);
  }

  /*
   * Closes the modal.
   */
  const closeModal = function() {
    setTextCommentTrackUuid(undefined);
    setTextCommentTimestamp(undefined);
    setShowModal(false);
  }

  /*
   * When a user is typing a text comment.
   */
  const handleTextChange = function(e) {
    setTextCommentText(e.target.value);
    if(textCommentTrackUuid && textCommentTimestamp) {
      return;
    }
    const arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
          position = arr[0];
    setTextCommentTimestamp(position);
    setTextCommentTrackUuid(nowPlaying.track.uuid);
  }

  /*
   * When a user submits a new comment.
   */
  const createTextComment = async function(e) {
    e.preventDefault();
    const responseJson = await fetchTextCommentCreate(
      textCommentText, FORMAT_TEXT, textCommentTrackUuid, textCommentTimestamp
    );

    props.dispatch(responseJson.redux);
    setTextCommentTimestamp(undefined);
    setTextCommentTrackUuid(undefined);
    setTextCommentText('');
  }

  /*
   * ...
   */

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const handleRecord = function() {
    if(!isRecording) {
      recorder.start();
      if(browserSupportsSpeechRecognition) {
        SpeechRecognition.startListening({ continuous: true });
      }
      setIsRecording(true);
      return;
    }

    if(browserSupportsSpeechRecognition) {
      SpeechRecognition.stopListening();
    }

    recorder.stop()
      .getMp3().then(([buffer, blob]) => {
        (async function () {
          const file = new File(buffer, 'voice.mp3', {
            type: blob.type,
            lastModified: Date.now(),
          });

          const arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
                position = arr[0];

          const responseJson = await fetchCreateVoiceRecording(file, JSON.stringify([]), transcript, position);
          props.dispatch(responseJson.redux);

          if (SpeechRecognition.browserSupportsSpeechRecognition()) {
            resetTranscript();
          }
        })()
      });

    setIsRecording(false);
  }

  //////////////////////////////////////////////////////////////////////////////
  // REGENERATE THE FEED
  useEffect(() => {

    const containerRect = contentContainer.current.getBoundingClientRect();
    props.dispatch({
      type: "feedApp/setContentContainer",
      payload: { contentContainer: containerRect },
    });

    const periodicTask = setInterval(() => {
      props.dispatch({ type: "feed/update" });
    }, 50);

    return () => {
      clearInterval(periodicTask);
    }

  // eslint-disable-next-line
  }, []);

  /*
   * 🎨
   */
  return (
    <div className={styles.FeedApp}>

      <ABCNotationCompose textCommentTrackUuid={textCommentTrackUuid}
                          textCommentTimestamp={textCommentTimestamp}
                          isOpen={showModal}
                          closeModal={closeModal} />

      <div className={styles.ContentContainer}>
        <div ref={contentContainer} className={styles.ImageContainer}>
          {!(nowPlaying?.track?.service === SERVICE_YOUTUBE && nowPlaying?.track?.format === 'video') &&
          !(nowPlaying?.track?.service === SERVICE_APPLE_MUSIC && nowPlaying?.track?.format === 'video') &&
            <img alt="" src={nowPlaying?.track?.imageUrl} />
          }
        </div>
        <h5>
          {nowPlaying?.track?.name}
        </h5>
        <h6>
          {nowPlaying?.track?.artistName}
        </h6>
      </div>

      <div className={styles.FeedWrapper}>
        <div className={styles.Feed}>
          {feed.map((value, index) => {
            if(value.class === CLASS_TEXT_COMMENT) {
              if(value.format === FORMAT_TEXT) {
                return <TextComment key={index} textCommentUuid={value.uuid} playbackControls={props.playbackControls} />;
              } else if(value.format === FORMAT_ABC_NOTATION) {
                return <ABCNotationDisplay key={index} textCommentUuid={value.uuid} playbackControls={props.playbackControls} />;
              }
            } else if(value.class === CLASS_VOICE_RECORDING) {
              return <VoiceRecording key={index} voiceRecordingUuid={value.uuid} playbackControls={props.playbackControls} />
            } else if(value.class === CLASS_SYSTEM_ACTION) {
              return <SystemAction key={index} data={value} playbackControls={props.playbackControls} />
            }
            return <></>;
          })}
        </div>

        <form className={styles.ComposeBar}
              onSubmit={async (e) => { await createTextComment(e); }}>
          <button className={styles.NotationButton}
                  type="button"
                  onClick={openModal}
                  disabled={nowPlaying?.status !== "played"} >
            <div></div>
          </button>
          <button className={styles.RecordButton}
                  type="button"
                  onClick={handleRecord}
                  disabled={nowPlaying?.status !== "played"} >
            <div></div>
          </button>
          <input type="text"
                 name="text"
                 value={textCommentText}
                 onChange={handleTextChange}
                 autoComplete="off"
                 disabled={nowPlaying?.status !== "played"} />
          <button className={styles.SubmitButton}
                  type="submit"
                  disabled={nowPlaying?.status !== "played"} >
            Send
          </button>
        </form>
      </div>

    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
    queueMap: state.queueMap,
    feedApp: state.feedApp,
});


export default connect(mapStateToProps)(FeedApp);
