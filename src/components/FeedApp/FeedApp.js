import React, { useState, useEffect, useRef } from "react";

import { connect } from 'react-redux';
import MicRecorder from 'mic-recorder-to-mp3';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Pizzicato from 'pizzicato';

import TheoryNotationDisplay from './TheoryNotationDisplay/TheoryNotationDisplay';
import VoiceRecording from './VoiceRecording/VoiceRecording';
import { getPositionMilliseconds } from '../PlaybackApp/utils';
import { CLASS_TEXT_COMMENT, CLASS_VOICE_RECORDING, CLASS_SYSTEM_ACTION } from '../../config/model';
import * as services from '../../config/services';
import * as modalViews from '../../config/views/modal';

import styles from './FeedApp.module.css';
import { fetchTextCommentCreate } from './network';
import * as formats from '../../config/formats';
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

  const [isRecording, setIsRecording] = useState(false);
  const [recorder] = useState(new MicRecorder({ bitRate: 320 }));

  const contentContainer = useRef();

  /*
   * Opens the modal, showing ABCNotationCompose.
   */
  const openModal = function() {
    const text = "",
          trackUuid = nowPlaying.track.uuid,
          arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
          position = arr[0];

    props.dispatch({
      type: "feedApp/setTextComment",
      payload: { textComment: { text, trackUuid, position } },
    });

    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "pause",
          status: "kickoff",
          fake: false,
        },
      },
    });

    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "openModal",
          view: modalViews.NOTATION_COMPOSE,
          status: "kickoff",
          fake: true,  // symbolic, not functional
        },
      },
    });
  }

  /*
   * When a user is typing a text comment.
   */
  const handleTextChange = function(e) {
    if(!feedApp.textComment.trackUuid) {
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "pause",
            status: "kickoff",
            fake: false,
          },
        },
      });
      // var voice = new Pizzicato.Sound({ source: 'input' }, function() {
      //     // Sound loaded!
      //     var dubDelay = new Pizzicato.Effects.DubDelay({
      //         feedback: 0.6,
      //         time: 0.7,
      //         mix: 0.5,
      //         cutoff: 700
      //     });
      //
      //     voice.addEffect(dubDelay);
      //     voice.play();
      // });
    }

    const text = e.target.value,
          trackUuid = nowPlaying.track.uuid,
          arr = getPositionMilliseconds(nowPlaying, nowPlaying.startedAt),
          position = arr[0];

    props.dispatch({
      type: "feedApp/setTextComment",
      payload: { textComment: { text, trackUuid, position } },
    });
  }

  /*
   * When a user submits a new comment.
   */
  const createTextComment = async function(e) {
    e.preventDefault();

    props.dispatch({
      type: "main/addAction",
      payload: {
        action: {
          name: "play",
          timestampMilliseconds: nowPlaying.statusAt - nowPlaying.startedAt,
          status: "kickoff",
          fake: { api: false },
        },
      },
    });

    props.dispatch({ type: "feedApp/resetTextComment" });

    const responseJson = await fetchTextCommentCreate(
      feedApp.textComment.text, formats.TEXT, feedApp.textComment.trackUuid, feedApp.textComment.position
    );

    props.dispatch(responseJson.redux);
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
      props.dispatch({
        type: "main/addAction",
        payload: {
          action: {
            name: "pause",
            status: "kickoff",
            fake: false,
          },
        },
      });
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

          console.log(file, JSON.stringify([]), transcript || '', position)
          const responseJson = await fetchCreateVoiceRecording(file, JSON.stringify([]), transcript || '', position);
          console.log(responseJson)
          props.dispatch(responseJson.redux);
          props.dispatch({
            type: "main/addAction",
            payload: {
              action: {
                name: "play",
                timestampMilliseconds: nowPlaying.statusAt - nowPlaying.startedAt,
                status: "kickoff",
                fake: { api: false },
              },
            },
          });

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

      <div className={styles.ContentContainer}>
        <div ref={contentContainer} className={styles.ImageContainer}>
          {!(nowPlaying?.track?.service === services.YOUTUBE && nowPlaying?.track?.format === 'video') &&
          !(nowPlaying?.track?.service === services.APPLE_MUSIC && nowPlaying?.track?.format === 'video') &&
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
              if(value.format === formats.TEXT) {
                return <TextComment key={index} textCommentUuid={value.uuid} />;
              } else {
                return <TheoryNotationDisplay key={index} textCommentUuid={value.uuid} />;
              }
            } else if(value.class === CLASS_VOICE_RECORDING) {
              return <VoiceRecording key={index} voiceRecordingUuid={value.uuid} />
            } else if(value.class === CLASS_SYSTEM_ACTION) {
              return <SystemAction key={index} data={value} />
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
                  disabled={nowPlaying?.status !== "played" && !isRecording} >
            <div></div>
          </button>
          <input type="text"
                 name="text"
                 value={feedApp.textComment.text}
                 onChange={handleTextChange}
                 autoComplete="off" />
          <button className={styles.SubmitButton}
                  type="submit" >
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
