import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import styles from './Upload.module.css';

import { fetchCreateTrack } from './network';


class Upload extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    this.state = {
      // UI
      errorMessage: null,
      // Form
      audioFile: '',
      imageFile: '',
      trackName: '',
      artistName: '',
      albumName: '',
    };

    // This binding is necessary to make `this` work in the callback.
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /*
   * Ran when an element value has changed value. The data is updated in the
   * model layer so the component may re-render.
   */
  handleFileChange(event) {
    let obj = {};
    obj[event.target.name] = event.target.files[0];
    this.setState(obj);
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
   * When the user initializes a login attempt.
   */
  async handleSubmit(event) {
    event.preventDefault();
    const responseJson = await fetchCreateTrack(
      this.state.audioFile,
      this.state.imageFile,
      this.state.trackName,
      this.state.artistName,
      this.state.albumName,
    );
    this.setState({
      trackName: '',
      artistName: '',
      albumName: '',
    });
  }

  render() {
    return (
      <form className={styles.Login} onSubmit={async (e) => { await this.handleSubmit(e); }}>
        <h3>Upload</h3>

        <label className={styles.FormBlock}>
          Audio file
          <input type="file"
                 name="audioFile"
                 onChange={this.handleFileChange} />
        </label>

        <label className={styles.FormBlock}>
          Image file
          <input type="file"
                 name="imageFile"
                 onChange={this.handleFileChange} />
        </label>

        <label className={styles.FormBlock}>
          Track name
          <input type="text"
                 name="trackName"
                 placeholder="Track name"
                 value={this.state.trackName}
                 onChange={this.handleChange} />
        </label>

        <label className={styles.FormBlock}>
          Artist name
          <input type="text"
                 name="artistName"
                 placeholder="Artist name"
                 value={this.state.artistName}
                 onChange={this.handleChange} />
        </label>

        <label className={styles.FormBlock}>
          Album name
          <input type="text"
                 name="albumName"
                 placeholder="Album name"
                 value={this.state.albumName}
                 onChange={this.handleChange} />
        </label>

        <div className={styles.FormBlock}>
          <button type="submit">
            Upload
          </button>
        </div>
      </form>
    );
  }
}

Upload.propTypes = {};

Upload.defaultProps = {};

export default Upload;
