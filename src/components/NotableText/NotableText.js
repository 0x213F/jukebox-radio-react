import React, { useRef, useState } from "react";
import Popover from 'react-text-selection-popover';
import { RoughNotation } from "react-rough-notation";
import styles from './NotableText.module.css';
import {
  fetchCreateTextCommentModification,
  STYLE_CHOICES,
} from './network';


function NotableText(props) {

  /*
   * 🏗
   */
  const selectableRef = useRef(null);

  const [selectableIsShowable, setSelectableIsShowable] = useState(true);
  const [anchorOffset, setAnchorOffset] = useState(null);
  const [focusOffset, setFocusOffset] = useState(null);

  /*
   * When the user highlights part of the comment.
   */
  const handleNotation = async function(e, style) {
    e.preventDefault();
    const textCommentUuid = props.data.uuid;
    const responseJson = await fetchCreateTextCommentModification(
      textCommentUuid,
      style,
      anchorOffset,
      focusOffset,
    );
    props.create(textCommentUuid, responseJson.data);
    setSelectableIsShowable(false);
  }

  /*
   * ...
   */
  const onTextSelect = async function() {
    const selection = window.getSelection();

    // Invalid text selection
    if(selection.anchorNode !== selection.focusNode) {
      setSelectableIsShowable(false);
      setAnchorOffset(null);
      setFocusOffset(null);
      return;
    }

    // NOTE: anchor is where the user starts selecting text, focus is the end
    //       of the selection.
    const offset = parseInt(selection.anchorNode.parentNode.getAttribute('offset'));
    setSelectableIsShowable(true);
    setAnchorOffset(offset + selection.anchorOffset);
    setFocusOffset(offset + selection.focusOffset);
  }

  /*
   * ...
   */
  const onTextUnselect = async function() {
    setSelectableIsShowable(false);
    setAnchorOffset(null);
    setFocusOffset(null);
  }

  /*
   * Monkey patch Rough Notation so that the markup is displayed behind
   * neighboring text.
   */
  const updateZIndex = function(annotation) {
    annotation._svg.style.zIndex = 16;
  }

  /*
   * When rendering a text comment, the text has to be displayed along with all
   * of its annotations. Here the comment string is spliced into many
   * substrings. If a substring has an accompanying modification, then Rough
   * Notation is used to display the underline, strike-through, or highlight.
   */
  const renderTextComment = function() {
    const textComment = props.data;
    const textCommentText = textComment.text;
    const modifications = textComment.modifications;

    let startOffset = 0,
        textCommentHtml = <></>;
    for(let i = 0; i < modifications.length; i++) {
        let modification = modifications[i];

        const regSubString = textCommentText.substring(
          startOffset,
          modification.startPtr
        )
        const styledSubString = textCommentText.substring(
          modification.startPtr,
          modification.endPtr
        )

        // BUG: https://github.com/linkstrifer/react-rough-notation/issues/17
        textCommentHtml = (
          <>
            {textCommentHtml}
            <span offset={startOffset}>{regSubString}</span>
            <RoughNotation className={styles.Notated}
                           show={true}
                           multiline={true}
                           color="red"
                           type={modification.type}
                           animate={modification.animate}
                           getAnnotationObject={updateZIndex}>
              {styledSubString}
            </RoughNotation>
          </>
        )

        startOffset = modification.endPtr;
    }

    const regSubString = textCommentText.substring(
      startOffset,
      textCommentText.length
    )

    textCommentHtml = (
      <>
        {textCommentHtml}
        <span offset={startOffset}>{regSubString}</span>
      </>
    )

    return textCommentHtml;
  }

  /*
   * 🎨
   */
  return (
    <div className={styles.NotableText}>

      <p ref={selectableRef}>
        {renderTextComment()}
      </p>
      <Popover selectionRef={selectableRef} onTextSelect={onTextSelect} onTextUnselect={onTextUnselect} isOpen={selectableIsShowable}>
        {STYLE_CHOICES.map((style, index) => {
          return (
            <form key={index} onSubmit={async (e) => { await handleNotation(e, style); }}>
              <button type="submit">
                {index}
              </button>
            </form>
          );
        })}
      </Popover>

    </div>
  );

}

export default NotableText;
