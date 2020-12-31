import React from 'react';
import styles from './Search.module.css';

import { fetchSearchMusicLibrary, fetchCreateQueue } from './network';
import SearchResult from '../SearchResult/SearchResult'


class Search extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    this.state = {
      // UI
      errorMessage: null,
      searchResults: [],
      // Form
      query: '',
      provider: {
        spotify: true,
        youTube: true,
        jukeboxRadio: true,
      },
      format: {
        track: true,
        album: true,
        playlist: true,
        video: true,
      },
    };

    // This binding is necessary to make `this` work in the callback.
    this.handleChange = this.handleChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addToQueue = this.addToQueue.bind(this);
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
   * Ran when an element value has changed value. The data is updated in the
   * model layer so the component may re-render.
   */
  handleCheckboxChange(event) {
    const [key0, key1] = event.target.name.split('.'),
          val = event.target.checked;

    let obj = {};
    obj[key0] = { ...this.state[key0]}
    obj[key0][key1] = val;
    this.setState(obj);
  }

  /*
   * When the user initializes a login attempt.
   */
  async handleSubmit(event) {
    event.preventDefault();
    const responseJson = await fetchSearchMusicLibrary(
      this.state.query,
      this.state.provider.spotify,
      this.state.provider.youTube,
      this.state.provider.jukeboxRadio,
      this.state.format.track,
      this.state.format.album,
      this.state.format.playlist,
      this.state.format.video,
    );
    this.setState({ searchResults: responseJson.data });
  }

  /*
   * When...
   */
  async addToQueue(className, genericUuid) {
    const prevQueueUuid = localStorage.getItem('lastQueueUuid') || null;
    const nextQueueUuid = null;
    await fetchCreateQueue(
      className,
      genericUuid,
      prevQueueUuid,
      nextQueueUuid
    );
    this.setState({ searchResults: [] });
  }

  render() {
    return (
      <div>
        <form className={styles.Login} onSubmit={async (e) => { await this.handleSubmit(e); }}>
          <h3>Search</h3>

          <label className={styles.FormBlock}>
            Query
            <input type="text"
                   name="query"
                   placeholder="Search by name or artist"
                   value={this.state.query}
                   onChange={this.handleChange} />
          </label>

          <div className={styles.FormBlock}>
            <label>
              <input type="checkbox"
                     name="provider.spotify"
                     checked={this.state.provider.spotify}
                     onChange={this.handleCheckboxChange} />
              Spotify
            </label>

            <label>
              <input type="checkbox"
                     name="provider.youTube"
                     checked={this.state.provider.youTube}
                     onChange={this.handleCheckboxChange} />
              YouTube
            </label>

            <label>
              <input type="checkbox"
                     name="provider.jukeboxRadio"
                     checked={this.state.provider.jukeboxRadio}
                     onChange={this.handleCheckboxChange} />
              Jukebox Radio
            </label>
          </div>

          <div className={styles.FormBlock}>
            <label>
              <input type="checkbox"
                     name="format.track"
                     checked={this.state.format.track}
                     onChange={this.handleCheckboxChange} />
              Track
            </label>

            <label>
              <input type="checkbox"
                     name="format.album"
                     checked={this.state.format.album}
                     onChange={this.handleCheckboxChange} />
              Album
            </label>

            <label>
              <input type="checkbox"
                     name="format.playlist"
                     checked={this.state.format.playlist}
                     onChange={this.handleCheckboxChange} />
              Playlist
            </label>

            <label>
              <input type="checkbox"
                     name="format.video"
                     checked={this.state.format.video}
                     onChange={this.handleCheckboxChange} />
              Video
            </label>
          </div>

          <div className={styles.FormBlock}>
            <button type="submit">
              Search
            </button>
          </div>
        </form>
        <div>
          {this.state.searchResults.map((value, index) => (
            <SearchResult key={index} data={value} addToQueue={this.addToQueue}></SearchResult>
          ))}
        </div>
      </div>
    );
  }
}

Search.propTypes = {};

Search.defaultProps = {};

export default Search;
