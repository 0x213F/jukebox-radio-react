import React from 'react';
import PropTypes from 'prop-types';
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


class Chat extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    this.state = {
      // UI
      errorMessage: null,
      // Data
      _textComments: undefined,
      _voiceRecordings: undefined,
      feed: [],
      // Form
      text: '',
    };

    // This binding is necessary to make `this` work in the callback.
    this.handleChange = this.handleChange.bind(this);
    this.buildFeed = this.buildFeed.bind(this);
    this.destroyFeedItem = this.destroyFeedItem.bind(this);
    this.destroyTextCommentModifications = this.destroyTextCommentModifications.bind(this);
    this.destroyTextComment = this.destroyTextComment.bind(this);
    this.destroyVoiceRecording = this.destroyVoiceRecording.bind(this);
    this.createTextComment = this.createTextComment.bind(this);
    this.createTextCommentModification = this.createTextCommentModification.bind(this);
  }

  /*
   * Load comments and voice recordings
   */
  async componentDidMount() {
    const textCommentsResponse = await fetchTextComments();
    if(textCommentsResponse.system.status !== 200) {
      this.errorMessage = textCommentsResponse.system.message;
    } else {
      this.setState({ _textComments: textCommentsResponse.data });
    }

    const voiceRecordingsResponse = await fetchVoiceRecordings();
    if(voiceRecordingsResponse.system.status !== 200) {
      this.errorMessage = voiceRecordingsResponse.system.message;
    } else {
      this.setState({ _voiceRecordings: voiceRecordingsResponse.data });
    }

    this.buildFeed();
  }

  /*
   * Ran when an element value has changed value. The data is updated in the
   * model layer so the component may re-render.
   */
  handleChange(event) {
    let obj = {};
    obj[event.target.name] = event.target.value;
    this.setState(obj);
  }

  /*
   * This aggregates text comments and voice recordings into one data list,
   * sorted by track timestamp.
   */
  buildFeed() {
    const textComments = this.state._textComments,
          voiceRecordings = this.state._voiceRecordings;

    if(!Array.isArray(textComments) || !Array.isArray(voiceRecordings)) {
      this.setState({ feed: [] });
      return;
    }

    const feedData = [...textComments, ...voiceRecordings];
    const feed = feedData.sort((a, b) => {
      return a.timestampMilliseconds - b.timestampMilliseconds;
    });

    this.setState({ feed: feed });
  }

  /*
   * Called inside a child component, this deletes the data (either a text
   * comment or voice recording) from the state, thereby updating the UI.
   */
  async destroyFeedItem(uuid) {
    const textComments = this.state._textComments,
          voiceRecordings = this.state._voiceRecordings;

    const filteredTextComments = textComments.filter(i => i.uuid !== uuid),
          filteredVoiceRecordings = voiceRecordings.filter(i => i.uuid !== uuid);

    await this.setState({ _textComments: filteredTextComments });
    await this.setState({ _voiceRecordings: filteredVoiceRecordings });

    this.buildFeed();
  }

  /*
   * ...
   */
  async destroyTextCommentModifications(textCommentUuid) {
    await fetchListDeleteTextCommentModifications(textCommentUuid);

    const textComments = this.state._textComments;
    const textCommentIndex = textComments.findIndex(t => t.uuid === textCommentUuid)

    textComments[textCommentIndex].modifications = [];

    await this.setState({ _textComments: textComments });
  }

  /*
   * ...
   */
  async destroyTextComment(textCommentUuid) {
    await fetchListDeleteTextCommentModifications(textCommentUuid);
    await fetchDeleteTextComment(textCommentUuid);
    await this.destroyFeedItem(textCommentUuid);
  }

  /*
   * ...
   */
  async destroyVoiceRecording(voiceRecordingUuid) {
    await fetchDeleteVoiceRecording(voiceRecordingUuid);
    await this.destroyFeedItem(voiceRecordingUuid);
  }

  /*
   * When a user submits a new comment.
   */
  async createTextComment(event) {
    event.preventDefault();
    const responseJson = await fetchCreateTextComment(this.state.text);

    let textCommentsCopy = [...this.state._textComments];
    textCommentsCopy.push(responseJson.data);

    await this.setState({
      _textComments: textCommentsCopy,
      text: '',
    });

    this.buildFeed();
  }

  /*
   * Called by a child component when the user creates a text comment
   * modification.
   */
  async createTextCommentModification(textCommentUuid, textCommentModification) {
    let textCommentsCopy = [...this.state._textComments];

    const textCommentIndex = textCommentsCopy.findIndex(t => t.uuid === textCommentUuid)
    let modificationsCopy = [...textCommentsCopy[textCommentIndex].modifications];

    modificationsCopy.push(textCommentModification);

    const sortedModifications = modificationsCopy.sort((a, b) => {
      return a.startPtr - b.startPtr;
    });

    textCommentsCopy[textCommentIndex].modifications = sortedModifications;

    await this.setState({ _textComments: textCommentsCopy });

    this.buildFeed();
  }

  /*
   * 🎨
   */
  render() {
    return (
      <div>
        <div className={styles.Chat}>
          {this.state.feed.map((value, index) => {
            if(value.class === CLASS_TEXT_COMMENT) {
              return <TextComment key={index} data={value} destroy={this.destroyTextComment} destroyModifications={this.destroyTextCommentModifications} create={this.createTextCommentModification} />
            } else if(value.class === CLASS_VOICE_RECORDING) {
              return <VoiceRecording key={index} data={value} destroy={this.destroyVoiceRecording} />
            } else {
              return null;
            }
          })}
        </div>
        <form className={styles.CreateTextComment} onSubmit={async (e) => { await this.createTextComment(e); }}>

          <input type="text"
                 name="text"
                 placeholder="text"
                 value={this.state.text}
                 onChange={this.handleChange} />

          <button type="submit">
            Send
          </button>

        </form>
      </div>
    );
  }

}

Chat.propTypes = {};

Chat.defaultProps = {};

export default Chat;
