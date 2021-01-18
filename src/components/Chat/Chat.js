import React, { useState } from "react";
import { connect } from 'react-redux'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import MicRecorder from 'mic-recorder-to-mp3';
import styles from './Chat.module.css';
import { fetchCreateTextComment } from './network'
import {
  fetchDeleteTextComment,
} from '../TextComment/network'
import {
  fetchCreateVoiceRecording,
  fetchDeleteVoiceRecording,
} from '../VoiceRecording/network'
import TextComment from '../TextComment/TextComment'
import VoiceRecording from '../VoiceRecording/VoiceRecording'
import {
  CLASS_TEXT_COMMENT,
  CLASS_VOICE_RECORDING
} from '../../config/model'


function Chat(props) {

  /*
   * 🏗
   */
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(new MicRecorder({ bitRate: 320 }));
  const [transcriptData] = useState([]);

  /*
   * ...
   */
  const destroyTextCommentModifications = () => {};
  // const destroyTextCommentModifications = async function(textCommentUuid) {
  //   await fetchListDeleteTextCommentModifications(textCommentUuid);
  //   await props.dispatch({
  //     type: 'textComment/clearModifications',
  //     textCommentUuid: textCommentUuid,
  //   });
  // }

  /*
   * ...
   */
  const destroyTextComment = async function(textCommentUuid) {
    // await fetchListDeleteTextCommentModifications(textCommentUuid);
    await fetchDeleteTextComment(textCommentUuid);
    await props.dispatch({
      type: 'textComment/delete',
      textCommentUuid: textCommentUuid,
    });
  }

  /*
   * ...
   */
  const destroyVoiceRecording = async function(voiceRecordingUuid) {
    await fetchDeleteVoiceRecording(voiceRecordingUuid);
    await props.dispatch({
      type: 'voiceRecording/delete',
      voiceRecordingUuid: voiceRecordingUuid,
    });
  }

  /*
   * When a user submits a new comment.
   */
  const createTextComment = async function(e) {
    e.preventDefault();
    const responseJson = await fetchCreateTextComment(text);

    await props.dispatch({
      type: 'textComment/create',
      textComment: responseJson.data,
    });

    setText('');
  }

  /*
   * Called by a child component when the user creates a text comment
   * modification.
   */
  const createTextCommentModification = () => {};
  // const createTextCommentModification = async function(textCommentUuid, textCommentModification) {
  //   const textCommentIndex = _textComments.findIndex(t => t.uuid === textCommentUuid);
  //   const modifications = _textComments[textCommentIndex].modifications;
  //
  //   modifications.push(textCommentModification);
  //   const sortedModifications = modifications.sort((a, b) => {
  //     return a.startPtr - b.startPtr;
  //   });
  //
  //   _textComments[textCommentIndex].modifications = sortedModifications;
  //   _setTextComments([..._textComments]);
  // }

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
  let feed = props.feed;


  /*
   * 🎨
   */
  return (
    <div className={styles.Chat}>
      <div>
        {feed.map((value, index) => {
          if(value.class === CLASS_TEXT_COMMENT) {
            return <TextComment key={index} data={value} destroy={destroyTextComment} destroyModifications={destroyTextCommentModifications} create={createTextCommentModification} />
          } else if(value.class === CLASS_VOICE_RECORDING) {
            return <VoiceRecording key={index} data={value} destroy={destroyVoiceRecording} />
          } else {
            return <></>;
          }
        })}
      </div>

      <form className={styles.CreateTextComment} onSubmit={async (e) => { await createTextComment(e); }}>
        <button type="button" onClick={handleRecord}>
          Record
        </button>
        <input type="text"
               name="text"
               placeholder="text"
               value={text}
               onChange={(e) => { setText(e.target.value); }} />
        <button type="submit">
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
