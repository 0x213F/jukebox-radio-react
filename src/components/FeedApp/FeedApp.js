import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import MicRecorder from 'mic-recorder-to-mp3';
import styles from './FeedApp.module.css';
import { fetchTextCommentCreate } from './network';
import { fetchCreateVoiceRecording } from './VoiceRecording/network';
import TextComment from './TextComment/TextComment';
import ABCNotationDisplay from './ABCNotationDisplay/ABCNotationDisplay';
import ABCNotationCompose from './ABCNotationCompose/ABCNotationCompose';
import VoiceRecording from './VoiceRecording/VoiceRecording';
import { CLASS_TEXT_COMMENT, CLASS_VOICE_RECORDING } from '../../config/model';
import { getPositionMilliseconds } from '../PlaybackApp/utils';


function FeedApp(props) {

  /*
   * 🏗
   */
  const feed = props.feed,
        stream = props.stream;

  const [text, setText] = useState('');
  const [trackUuid, setTrackUuid] = useState(undefined);
  const [textCommentTimestamp, setTextCommentTimestamp] = useState(undefined);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(new MicRecorder({ bitRate: 320 }));
  const [transcriptData] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const openModal = function() {
    const arr = getPositionMilliseconds(stream, stream.startedAt),
          position = arr[0];
    setTextCommentTimestamp(position);
    setTrackUuid(stream.nowPlaying.track.uuid);
    setShowModal(true);
  }

  const closeModal = function() {
    setShowModal(false);
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

  const handleTextChange = function(e) {
    if(!trackUuid) {
      const arr = getPositionMilliseconds(stream, stream.startedAt),
            position = arr[0];
      setTextCommentTimestamp(position);
      setTrackUuid(stream.nowPlaying.track.uuid);
    }
    setText(e.target.value);
  }

  /*
   * When a user submits a new comment.
   */
  const createTextComment = async function(e) {
    e.preventDefault();
    const format = 'text';
    const responseJson = await fetchTextCommentCreate(
      text, format, trackUuid, textCommentTimestamp
    );

    props.dispatch(responseJson.redux);
    setTextCommentTimestamp(undefined);
    setTrackUuid(undefined);
    setText('');
  }

  const { transcript, resetTranscript } = useSpeechRecognition();

  /*
   * ...
   */
  const handleRecord = function() {
    if(!isRecording) {
      if (SpeechRecognition.browserSupportsSpeechRecognition()) {
        SpeechRecognition.startListening({ continuous: true });
        // BUG: https://github.com/JamesBrill/react-speech-recognition/issues/81
        //
        // const recognition = SpeechRecognition.getRecognition();
        // recognition.onresult = (e) => {
        //   recognition.onresult(e);
        //   const timeStamp = e.timeStamp,
        //         transcript = e.results[0][0].transcript,
        //         confidence = e.results[0][0].confidence,
        //         isFinal = e.results[0].isFinal;
        //   transcriptData.push({ timeStamp, transcript, confidence, isFinal });
        //   setTranscriptData([...transcriptData]);
        // }
      }
      recorder.start();
      setIsRecording(true);
    } else {
      if (SpeechRecognition.browserSupportsSpeechRecognition()) {
        SpeechRecognition.stopListening();
      }

      recorder.stop()
        .getMp3().then(([buffer, blob]) => {
          (async function () {
            const file = new File(buffer, 'voice.mp3', {
              type: blob.type,
              lastModified: Date.now(),
            });

            const responseJson = await fetchCreateVoiceRecording(file, JSON.stringify(transcriptData), transcript);

            await props.dispatch({
              type: 'voiceRecording/create',
              voiceRecording: responseJson.data,
            });

            if (SpeechRecognition.browserSupportsSpeechRecognition()) {
              resetTranscript();
            }
          })()
        });

      setIsRecording(false);
    }
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.FeedApp}>

      <ABCNotationCompose trackUuid={trackUuid}
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
              if(value.format === 'text') {
                return <TextComment key={index} data={value} />;
              } else if(value.format === 'abc_notation') {
                return <ABCNotationDisplay key={index} data={value} />;
              }
            } else if(value.class === CLASS_VOICE_RECORDING) {
              return <VoiceRecording key={index} data={value} />
            }
            return <></>;
          })}
        </div>

        <form className={styles.ComposeBar} onSubmit={async (e) => { await createTextComment(e); }}>
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
                 value={text}
                 onChange={handleTextChange}
                 autocomplete={"off"}
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
    textComments: state.textComments,
    voiceRecordings: state.voiceRecordings,
    feed: state.feed,
});


export default connect(mapStateToProps)(FeedApp);
