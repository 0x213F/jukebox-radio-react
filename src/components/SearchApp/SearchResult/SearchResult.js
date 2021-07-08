import React, { useState } from 'react';
import styles from './SearchResult.module.css';
import * as services from '../../../config/services';
import {
  iconSpotify,
  iconYouTube,
  iconAppleMusic,
  iconLogoAlt,
  iconAudius,
} from '../../../icons';


function SearchResult(props) {
  const searchResult = props.data,
        addToQueue = props.addToQueue;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAddToQueue = async function() {
    setIsSubmitting(true);
    await addToQueue(searchResult.class, searchResult.uuid);
    setIsSubmitted(true);
  }

  let imgUrl = searchResult.img_url;
  if(searchResult.provider === services.APPLE_MUSIC) {
    imgUrl = imgUrl.replace("{w}", "300");
    imgUrl = imgUrl.replace("{h}", "300");
  }

  let serviceSvg;
  if(searchResult.provider === services.SPOTIFY) {
    serviceSvg = iconSpotify;
  } else if(searchResult.provider === services.YOUTUBE) {
    serviceSvg = iconYouTube;
  } else if(searchResult.provider === services.APPLE_MUSIC) {
    serviceSvg = iconAppleMusic;
  } else if(searchResult.provider === services.JUKEBOX_RADIO) {
    serviceSvg = iconLogoAlt;
  } else if(searchResult.provider === services.AUDIUS) {
    serviceSvg = iconAudius;
  }

  return (
    <div className={!isSubmitted ? styles.SearchResult : styles.SearchResultSubmitted}>

      <div className={[styles.ImageParent, styles[searchResult.provider]].join(' ')}>
        <img src={imgUrl} alt={"Album Art"} />
      </div>

      <div className={styles.ResultInformation}>
        <h5>{searchResult.name}</h5>
        <h6>{searchResult.artist_name}</h6>
      </div>

      <div className={styles.ServiceLogo}>
        {serviceSvg}
      </div>

      <button type="button"
              onClick={handleAddToQueue}
              className={styles[isSubmitted ? "AddButtonInverted" : "AddButton"]}
              style={((isSubmitting && !isSubmitted) && {cursor: "wait"}) || {}}
              disabled={!(!isSubmitting && !isSubmitted)}>
        {!isSubmitted ?
          (isSubmitting ? <i className={styles.ggSpinner}></i> : "Add") :
          "Added"
        }
      </button>

    </div>
  );
}

export default SearchResult;
