import React, { useState, useEffect } from "react";
import styles from './Chat.module.css';
import { fetchCreateTextComment, fetchTextComments, fetchVoiceRecordings } from './network'
import {
  fetchDeleteTextComment,
  fetchListDeleteTextCommentModifications,
} from '../TextComment/network'
import {
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
  const [_textComments, _setTextComments] = useState(undefined);
  const [_voiceRecordings, _setVoiceRecordings] = useState(undefined);
  const [text, setText] = useState('');

  // onComponentDidMount
  useEffect(() => {
    async function loadData() {
      const textCommentsResponse = await fetchTextComments();
      if(textCommentsResponse.system.status === 200) {
        _setTextComments(textCommentsResponse.data);
      }

      const voiceRecordingsResponse = await fetchVoiceRecordings();
      if(voiceRecordingsResponse.system.status === 200) {
        _setVoiceRecordings(voiceRecordingsResponse.data);
      }
    }
    loadData();
  }, [])

  /*
   * Called inside a child component, this deletes the data (either a text
   * comment or voice recording) from the state, thereby updating the UI.
   */
  const destroyFeedItem = async function(uuid) {
    const textComments = _textComments,
          voiceRecordings = _voiceRecordings;

    const filteredTextComments = textComments.filter(i => i.uuid !== uuid),
          filteredVoiceRecordings = voiceRecordings.filter(i => i.uuid !== uuid);

    _setTextComments(filteredTextComments);
    _setVoiceRecordings(filteredVoiceRecordings);
  }

  /*
   * ...
   */
  const destroyTextCommentModifications = async function(textCommentUuid) {
    await fetchListDeleteTextCommentModifications(textCommentUuid);

    const textCommentIndex = _textComments.findIndex(t => t.uuid === textCommentUuid)

    _textComments[textCommentIndex].modifications = [];
    _setTextComments([..._textComments]);
  }

  /*
   * ...
   */
  const destroyTextComment = async function(textCommentUuid) {
    await fetchListDeleteTextCommentModifications(textCommentUuid);
    await fetchDeleteTextComment(textCommentUuid);
    await destroyFeedItem(textCommentUuid);
  }

  /*
   * ...
   */
  const destroyVoiceRecording = async function(voiceRecordingUuid) {
    await fetchDeleteVoiceRecording(voiceRecordingUuid);
    await destroyFeedItem(voiceRecordingUuid);
  }

  /*
   * When a user submits a new comment.
   */
  const createTextComment = async function(e) {
    e.preventDefault();
    const responseJson = await fetchCreateTextComment(text);

    _textComments.push(responseJson.data);
    _setTextComments([..._textComments]);
    setText('');
  }

  /*
   * Called by a child component when the user creates a text comment
   * modification.
   */
  const createTextCommentModification = async function(textCommentUuid, textCommentModification) {
    const textCommentIndex = _textComments.findIndex(t => t.uuid === textCommentUuid);
    const modifications = _textComments[textCommentIndex].modifications;

    modifications.push(textCommentModification);
    const sortedModifications = modifications.sort((a, b) => {
      return a.startPtr - b.startPtr;
    });

    _textComments[textCommentIndex].modifications = sortedModifications;
    _setTextComments([..._textComments]);
  }

  /*
   * This aggregates text comments and voice recordings into one data list,
   * sorted by track timestamp.
   */
  let feed;

  if(!Array.isArray(_textComments) || !Array.isArray(_voiceRecordings)) {
    feed = [];
  } else {
    const aggregateFeed = [..._textComments, ..._voiceRecordings];
    feed = aggregateFeed.sort((a, b) => {
      return a.timestampMilliseconds - b.timestampMilliseconds;
    });
  }


  /*
   * 🎨
   */
  return (
    <div>
      <div className={styles.Chat}>
        {feed.map((value, index) => {
          if(value.class === CLASS_TEXT_COMMENT) {
            return <TextComment key={index} data={value} destroy={destroyTextComment} destroyModifications={destroyTextCommentModifications} create={createTextCommentModification} />
          } else if(value.class === CLASS_VOICE_RECORDING) {
            return <VoiceRecording key={index} data={value} destroy={destroyVoiceRecording} />
          } else {
            return null;
          }
        })}
      </div>
      <form className={styles.CreateTextComment} onSubmit={async (e) => { await createTextComment(e); }}>

        <input type="text"
               name="text"
               placeholder="text"
               value={text}
               onChange={(e) => { setText(e.target.value); }} />

        <button type="submit">
          Send
        </button>

      </form>
    </div>
  );

}


export default Chat;
