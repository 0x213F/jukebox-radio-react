import React, { useState } from "react";
import { connect } from 'react-redux';
import styles from './Search.module.css';

import { fetchSearchMusicLibrary, fetchCreateQueue } from './network';
import SearchResult from '../SearchResult/SearchResult';
import { fetchQueueList } from '../Queue/network';


function Search(props) {

  /*
   * 🏗
   */

  const [searchResults, setSearchResults] = useState([]);

  const [query, setQuery] = useState([]);

  // NOTE: These could be condensed, but I prefer explicitly writing them out.
  const [serviceSpotify, setServiceSpotify] = useState(true);
  const [serviceYouTube, setServiceYouTube] = useState(true);
  const [serviceJukeboxRadio, setServiceJukeboxRadio] = useState(true);

  const [formatTrack, setFormatTrack] = useState(true);
  const [formatAlbum, setFormatAlbum] = useState(true);
  const [formatPlaylist, setFormatPlaylist] = useState(true);
  const [formatVideo, setFormatVideo] = useState(true);

  /*
   * When the user initializes a login attempt.
   */
  const handleSubmit = async function(e) {
    e.preventDefault();
    const responseJson = await fetchSearchMusicLibrary(
      query,
      serviceSpotify,
      serviceYouTube,
      serviceJukeboxRadio,
      formatTrack,
      formatAlbum,
      formatPlaylist,
      formatVideo,
    );
    setSearchResults(responseJson.data);
  }

  /*
   * When...
   */
  const addToQueue = async function(className, genericUuid) {
    await fetchCreateQueue(
      className,
      genericUuid,
    );

    setSearchResults([]);

    const responseJsonQueueList = await fetchQueueList();
    await props.dispatch(responseJsonQueueList.redux);
  }

  return (
    <div>
      <form className={styles.Login} onSubmit={async (e) => { await handleSubmit(e); }}>
        <h3>Search</h3>

        <label className={styles.FormBlock}>
          Query &nbsp;
          <input type="text"
                 name="query"
                 placeholder=""
                 value={query}
                 onChange={(e) => {setQuery(e.target.value)}} />
        </label>

        <br></br>

        <div className={styles.FormBlock}>
          <label>
            <input type="checkbox"
                   checked={serviceSpotify}
                   onChange={(e) => {setServiceSpotify(e.target.checked)}} />
            Spotify
          </label>

          <label>
            <input type="checkbox"
                   name="provider.youTube"
                   checked={serviceYouTube}
                   onChange={(e) => {setServiceYouTube(e.target.checked)}} />
            YouTube
          </label>

          <label>
            <input type="checkbox"
                   name="provider.jukeboxRadio"
                   checked={serviceJukeboxRadio}
                   onChange={(e) => {setServiceJukeboxRadio(e.target.checked)}} />
            Jukebox Radio
          </label>
        </div>

        <div className={styles.FormBlock}>
          <label>
            <input type="checkbox"
                   checked={formatTrack}
                   onChange={(e) => {setFormatTrack(e.target.checked)}} />
            Track
          </label>

          <label>
            <input type="checkbox"
                   checked={formatAlbum}
                   onChange={(e) => {setFormatAlbum(e.target.checked)}} />
            Album
          </label>

          <label>
            <input type="checkbox"
                   checked={formatPlaylist}
                   onChange={(e) => {setFormatPlaylist(e.target.checked)}} />
            Playlist
          </label>

          <label>
            <input type="checkbox"
                   checked={formatVideo}
                   onChange={(e) => {setFormatVideo(e.target.checked)}} />
            Video
          </label>
        </div>

        <br></br>

        <div className={styles.FormBlock}>
          <button type="submit">
            Search
          </button>
        </div>
      </form>

      <br></br>

      <div>
        {searchResults.map((value, index) => (
          <SearchResult key={index} data={value} addToQueue={addToQueue}></SearchResult>
        ))}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps)(Search);
