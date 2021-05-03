import React, { useState } from 'react';
import styles from './SearchResult.module.css';
// import { iconCheck } from './icons';
import { SERVICE_APPLE_MUSIC } from './../../../config/services';


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
  if(searchResult.provider === SERVICE_APPLE_MUSIC) {
    imgUrl = imgUrl.replace("{w}", "300");
    imgUrl = imgUrl.replace("{h}", "300");
  }

  return (
    <div className={!isSubmitted ? styles.SearchResult : styles.SearchResultSubmitted}>

      <div className={styles.ImageParent}>
        <img src={imgUrl} alt={"Album Art"} />
      </div>

      <div className={styles.ResultInformation}>
        <h5>{searchResult.name}</h5>
        <h6>{searchResult.artist_name}</h6>
      </div>

      { /* Initial state: button has not been clicked. */
      !isSubmitting && !isSubmitted &&
        <button type="button"
                className={styles.AddButton}
                onClick={handleAddToQueue}
                disabled={false}>
          Add
        </button>
      }

      { /* Immediately after being clicked, disable and display spinner. */
      isSubmitting && !isSubmitted &&
        <button type="button"
                className={styles.AddButton}
                style={{cursor: "wait"}}
                disabled={true}>
          <i className={styles.ggSpinner}></i>
        </button>
      }

      { /* Once loaded, stay disabled but display a check */
      isSubmitted &&
        <button type="button"
                className={styles.AddButtonInverted}
                disabled={true}>
          Added
        </button>
      }
    </div>
  );
}

export default SearchResult;
