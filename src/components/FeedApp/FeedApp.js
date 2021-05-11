import React, { useState, useEffect } from "react";

import { connect } from 'react-redux';
import MicRecorder from 'mic-recorder-to-mp3';

import ABCNotationDisplay from './ABCNotationDisplay/ABCNotationDisplay';
import ABCNotationCompose from './ABCNotationCompose/ABCNotationCompose';
import VoiceRecording from './VoiceRecording/VoiceRecording';
import { getPositionMilliseconds } from '../PlaybackApp/utils';
import { CLASS_TEXT_COMMENT, CLASS_VOICE_RECORDING } from '../../config/model';

import styles from './FeedApp.module.css';
import { fetchTextCommentCreate } from './network';
import { FORMAT_TEXT, FORMAT_ABC_NOTATION } from './constants';
import { fetchCreateVoiceRecording } from './VoiceRecording/network';
import TextComment from './TextComment/TextComment';


function FeedApp(props) {

  /*
   * 🏗
   */
  const feed = props.feed,
        stream = props.stream;

  const [textCommentText, setTextCommentText] = useState('');
  const [textCommentTrackUuid, setTextCommentTrackUuid] = useState(undefined);
  const [textCommentTimestamp, setTextCommentTimestamp] = useState(undefined);

  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(new MicRecorder({ bitRate: 320 }));

  // Modal displays ABCNotationCompose
  const [showModal, setShowModal] = useState(false);

  /*
   * Opens the modal, showing ABCNotationCompose.
   */
  const openModal = function() {
    const arr = getPositionMilliseconds(stream, stream.startedAt),
          position = arr[0];
    setTextCommentTrackUuid(stream.nowPlaying.track.uuid);
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
    const arr = getPositionMilliseconds(stream, stream.startedAt),
          position = arr[0];
    setTextCommentTimestamp(position);
    setTextCommentTrackUuid(stream.nowPlaying.track.uuid);
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
  const handleRecord = function() {
    if(!isRecording) {
      recorder.start();
      setIsRecording(true);
      return;
    }

    recorder.stop()
      .getMp3().then(([buffer, blob]) => {
        (async function () {
          const file = new File(buffer, 'voice.mp3', {
            type: blob.type,
            lastModified: Date.now(),
          });

          const arr = getPositionMilliseconds(stream, stream.startedAt),
                position = arr[0];

          const responseJson = await fetchCreateVoiceRecording(file, JSON.stringify([]), '', position);

          await props.dispatch({
            type: 'voiceRecording/create',
            voiceRecording: responseJson.data,
          });

        })()
      });

    setIsRecording(false);
  }

  //////////////////////////////////////////////////////////////////////////////
  // REGENERATE THE FEED
  useEffect(() => {

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
        <div className={styles.ImageContainer}>
          <img alt="" src={stream.nowPlaying?.track?.imageUrl} />
        </div>
        <h5>
          {stream.nowPlaying?.track?.name}
        </h5>
      </div>

      <div className={styles.FeedWrapper}>
        <div className={styles.Feed}>
          {feed.map((value, index) => {
            if(value.class === CLASS_TEXT_COMMENT) {
              if(value.format === FORMAT_TEXT) {
                return <TextComment key={index} data={value} />;
              } else if(value.format === FORMAT_ABC_NOTATION) {
                return <ABCNotationDisplay key={index} data={value} />;
              }
            } else if(value.class === CLASS_VOICE_RECORDING) {
              return <VoiceRecording key={index} data={value} />
            }
            return <></>;
          })}
        </div>

        <form className={styles.ComposeBar}
              onSubmit={async (e) => { await createTextComment(e); }}>
          <button className={styles.NotationButton}
                  type="button"
                  onClick={openModal}
                  disabled={!stream.isPlaying} >
            <div></div>
          </button>
          <button className={styles.RecordButton}
                  type="button"
                  onClick={handleRecord}
                  disabled={!stream.isPlaying} >
            <div></div>
          </button>
          <input type="text"
                 name="text"
                 value={textCommentText}
                 onChange={handleTextChange}
                 autoComplete="off"
                 disabled={!stream.isPlaying} />
          <button className={styles.SubmitButton}
                  type="submit"
                  disabled={!stream.isPlaying} >
            Send
          </button>
        </form>
      </div>

    </div>
  );
}


const mapStateToProps = (state) => ({
    stream: state.stream,
    feed: state.feed,
});


export default connect(mapStateToProps)(FeedApp);
