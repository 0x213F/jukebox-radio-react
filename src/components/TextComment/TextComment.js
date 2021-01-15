import React from "react";
// import NotableText from '../NotableText/NotableText'
import styles from './TextComment.module.css';


function TextComment(props) {

  /*
   * 🎨
   */
  return (
    <div className={styles.TextComment}>
      {/*
      <NotableText data={props.data} create={props.create}></NotableText>
      */}

      <span>
        {props.data.text} &nbsp;
      </span>

      {/*
      <button type="button" onClick={async (e) => { await props.destroyModifications(props.data.uuid); }}>
        Clear modifications
      </button>
      */}

      <button type="button" onClick={async (e) => { await props.destroy(props.data.uuid); }}>
        Delete
      </button>
    </div>
  );

}

export default TextComment;
