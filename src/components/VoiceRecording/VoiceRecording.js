import React from 'react';
import PropTypes from 'prop-types';
import styles from './VoiceRecording.module.css';
import { fetchDeleteVoiceRecording } from './network';

class VoiceRecording extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    // This binding is necessary to make `this` work in the callback.
    this.handleDelete = this.handleDelete.bind(this);
  }

  /*
   * When the user deletes a text comment.
   */
  async handleDelete(event) {
    event.preventDefault();
    const voiceRecordingUuid = this.props.data.uuid;
    const responseJson = await fetchDeleteVoiceRecording(voiceRecordingUuid);
    await this.props.destroy(voiceRecordingUuid);
  }

  /*
   * 🎨
   */
  render() {
    const voiceRecording = this.props.data;
    return (
      <div className={styles.VoiceRecording}>
        <p><i>
          {
            voiceRecording.transcriptFinal === 'null' ?
            '<transcript not available>' : voiceRecording.transcriptFinal
          }
        </i></p>
        <form onSubmit={async (e) => { await this.handleDelete(e); }}>
          <button type="submit">
            Delete
          </button>
        </form>
      </div>
    );
  }

}

VoiceRecording.propTypes = {};

VoiceRecording.defaultProps = {};

export default VoiceRecording;
