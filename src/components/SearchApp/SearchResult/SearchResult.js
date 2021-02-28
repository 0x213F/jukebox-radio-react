import React, { useState } from 'react';
import styles from './SearchResult.module.css';
import { iconCheck } from './icons';


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

  return (
    <div className={styles.SearchResult}>
      <span>
        {searchResult.provider} {searchResult.format} {searchResult.name}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </span>

      { /* Initial state: button has not been clicked. */
      !isSubmitting && !isSubmitted &&
        <button type="button"
                className={styles.Button}
                onClick={handleAddToQueue}
                disabled={false}>
          Add
        </button>
      }

      { /* Immediately after being clicked, disable and display spinner. */
      isSubmitting && !isSubmitted &&
        <button type="button"
                className={styles.Button}
                disabled={true}>
          <i className={styles.ggSpinner}></i>
        </button>
      }

      { /* Once loaded, stay disabled but display a check */
      isSubmitted &&
        <button type="button"
                className={styles.Button}
                disabled={true}>
          {iconCheck}
        </button>
      }
    </div>
  );
}

export default SearchResult;
