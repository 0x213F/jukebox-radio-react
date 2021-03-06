import React, { useRef, useState } from "react";

import { connect } from 'react-redux';
import Popover from 'react-text-selection-popover';

import styles from './NotableText.module.css';
import {
  STYLE_BOLD,
  STYLE_ITALICIZE,
  STYLE_STRIKETHROUGH,
  STYLE_HIGHLIGHT,
} from './constants';
import { fetchCreateTextCommentModification } from './network';


function NotableText(props) {

  /*
   * 🏗
   */
  const textCommentUuid = props.textCommentUuid,
        textComment = props.textCommentMap[textCommentUuid];

  const selectableRef = useRef(null);

  const [selectableIsShowable, setSelectableIsShowable] = useState(true);
  const [anchorOffset, setAnchorOffset] = useState(null);
  const [focusOffset, setFocusOffset] = useState(null);

  /*
   * When the user highlights part of the comment.
   */
  const handleNotation = async function(style) {
    const responseJson = await fetchCreateTextCommentModification(
      textCommentUuid,
      style,
      anchorOffset,
      focusOffset,
    );
    props.dispatch(responseJson.redux)
    setSelectableIsShowable(false);
  }

  /*
   * Called everytime the text selection changes.
   */
  const onTextSelect = async function() {
    const selection = window.getSelection();

    // NOTE: anchor is where the user starts selecting text, focus is the end
    //       of the selection.
    let anchorValue = parseInt(selection.anchorNode.parentNode.getAttribute('offset'));
    let focusValue = parseInt(selection.focusNode.parentNode.getAttribute('offset'));

    // NOTE: there needs to be a slight adjustment of these values.
    if(anchorValue < focusValue) {
      focusValue += 1;
    } else {
      anchorValue += 1;
    }

    setSelectableIsShowable(true);
    setAnchorOffset(anchorValue);
    setFocusOffset(focusValue);
  }

  /*
   * Called when there is no more text being selected.
   */
  const onTextUnselect = async function() {
    setSelectableIsShowable(false);
    setAnchorOffset(null);
    setFocusOffset(null);
  }

  /*
   * When rendering a text comment, the text has to be displayed along with all
   * of its annotations. Here the comment string is spliced into many
   * substrings. If a substring has an accompanying modification, then Rough
   * Notation is used to display the underline, strike-through, or highlight.
   */
  const renderTextComment = function() {
    const textCommentText = textComment.text,
          modifications = textComment.modifications;

    // Initializes an array of empty sets.
    const styles = [];
    for(let i=0; i< textCommentText.length; i++) {
      styles[i] = new Set();
    }

    // Adds styles to each set.
    for(let i=0; i < modifications.length; i++) {
      const modification = modifications[i];

      for(let j=modification.startPtr; j < modification.endPtr; j++) {
        styles[j].add(modification.style);
      }
    }

    // Generate the comment
    let textCommentHtml = <></>
    for(let i=0; i < styles.length; i++) {
      const char = textCommentText[i],
            style = styles[i];

      const stylesObj = {};
      if(style.has(STYLE_BOLD)) {
        stylesObj['fontWeight'] = 'bold';
      }
      if(style.has(STYLE_ITALICIZE)) {
        stylesObj['fontStyle'] = 'italic';
      }
      if(style.has(STYLE_STRIKETHROUGH)) {
        stylesObj['textDecoration'] = 'line-through';
      }
      if(style.has(STYLE_HIGHLIGHT)) {
        stylesObj['backgroundColor'] = '#FFF960';
      }

      textCommentHtml = <>
        {textCommentHtml}
        <span offset={i} style={stylesObj}>
          {char}
        </span>
      </>
    }

    return textCommentHtml;
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.NotableText} style={{color: 'black'}}>
      <p ref={selectableRef}>
        {renderTextComment()}
      </p>

      <Popover selectionRef={selectableRef} onTextSelect={onTextSelect} onTextUnselect={onTextUnselect} isOpen={selectableIsShowable}>
        <div className={styles.Popover}>
          <button type="button"
                  onClick={async () => { await handleNotation(STYLE_BOLD); }}>
            <span style={{fontWeight: "bold"}}>B</span>
          </button>
          <button type="button"
                  onClick={async () => { await handleNotation(STYLE_ITALICIZE); }}>
            <span style={{fontStyle: "italic"}}>i</span>
          </button>
          <button type="button"
                  onClick={async () => { await handleNotation(STYLE_STRIKETHROUGH); }}>
            <span style={{textDecoration: "line-through"}}>S</span>
          </button>
          <button type="button"
                  onClick={async () => { await handleNotation(STYLE_HIGHLIGHT); }}>
            <span style={{backgroundColor: "#FFF960"}}>H</span>
          </button>
        </div>
      </Popover>
    </div>
  );
}


const mapStateToProps = (state) => ({
  textCommentMap: state.textCommentMap,
});


export default connect(mapStateToProps)(NotableText);
