import React, { useState, useEffect } from "react";
import { connect } from 'react-redux'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import MicRecorder from 'mic-recorder-to-mp3';
import styles from './Chat.module.css';
import { fetchTextCommentCreate } from './network';
import {
  fetchCreateVoiceRecording,
} from '../VoiceRecording/network';
import TextComment from '../TextComment/TextComment';
import VoiceRecording from '../VoiceRecording/VoiceRecording';
import {
  CLASS_TEXT_COMMENT,
  CLASS_VOICE_RECORDING
} from '../../config/model';


function Chat(props) {

  /*
   * 🏗
   */
  const [text, setText] = useState('');
  const [isAbc, setIsAbc] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(new MicRecorder({ bitRate: 320 }));
  const [transcriptData] = useState([]);

  //////////////////////////////////////////////////////////////////////////////
  // REGENERATE THE FEED
  useEffect(() => {

    const periodicTask = setInterval(() => {
      props.dispatch({ type: "feed/update" });
    }, 1000);

    return () => {
      clearInterval(periodicTask);
    }

  // eslint-disable-next-line
  }, []);

  /*
   * When a user submits a new comment.
   */
  const createTextComment = async function(e) {
    e.preventDefault();
    const format = isAbc ? 'abc_notation' : 'text';
    const responseJson = await fetchTextCommentCreate(text, format);

    await props.dispatch({
      type: 'textComment/create',
      textComment: responseJson.data,
    });

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
   * This aggregates text comments and voice recordings into one data list,
   * sorted by track timestamp.
   */
  const feed = props.feed,
        stream = props.stream;

  /*
   * 🎨
   */
  return (
    <div className={styles.Chat}>
      <div>
        {feed.map((value, index) => {
          if(value.class === CLASS_TEXT_COMMENT) {
            return <TextComment key={index} data={value} />
          } else if(value.class === CLASS_VOICE_RECORDING) {
            return <VoiceRecording key={index} data={value} />
          } else {
            return <></>;
          }
        })}
      </div>

      <form className={styles.CreateTextComment} onSubmit={async (e) => { await createTextComment(e); }}>
        <input type="checkbox"
               value={isAbc}
               onChange={(e) => { setIsAbc(e.target.checked); }} />
        <button type="button"
                onClick={handleRecord}
                disabled={!stream.isPlaying} >
          Record
        </button>
        {isAbc ? (
          <textarea type="text"
                    name="text"
                    placeholder="text"
                    value={text}
                    onChange={(e) => { setText(e.target.value); }}
                    disabled={!stream.isPlaying} />
        ) : (
          <input type="text"
                 name="text"
                 placeholder="text"
                 value={text}
                 onChange={(e) => { setText(e.target.value); }}
                 disabled={!stream.isPlaying} />
        )}
        <button type="submit"
                disabled={!stream.isPlaying} >
          Send
        </button>
      </form>

      <div>
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

export default connect(mapStateToProps)(Chat);
