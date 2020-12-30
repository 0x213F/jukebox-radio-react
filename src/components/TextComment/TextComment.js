import React from 'react';
import Popover from 'react-text-selection-popover';
import { RoughNotation } from "react-rough-notation";
import styles from './TextComment.module.css';
import {
  fetchCreateTextCommentModification,
  STYLE_UNDERLINE,
  STYLE_STRIKE_THROUGH,
  STYLE_HIGHLIGHT,
} from './network';


class TextComment extends React.Component {

  /*
   * 🏗
   */
  constructor(props) {
    super(props);

    this.selectableRef = React.createRef();

    this.state = {
      // UI
      modifications: props.data.modifications,
      selectableIsShowable: true,
      // Form
      anchorOffset: null,
      focusOffset: null,
    };

    // This binding is necessary to make `this` work in the callback.
    this.handleDelete = this.handleDelete.bind(this);
    this.handleUnderline = this.handleUnderline.bind(this);
    this.handleStrikethrough = this.handleStrikethrough.bind(this);
    this.handleHighlight = this.handleHighlight.bind(this);
    this.onTextSelect = this.onTextSelect.bind(this);
    this.onTextUnselect = this.onTextUnselect.bind(this);
    this.renderTextComment = this.renderTextComment.bind(this);
  }

  /*
   * When the user deletes a text comment.
   */
  async handleDelete(event) {
    event.preventDefault();
    const textCommentUuid = this.props.data.uuid;
    await this.props.destroy(textCommentUuid);
  }

  /*
   * When the user underlines part of the comment.
   */
  async handleUnderline(event) {
    event.preventDefault();
    const textCommentUuid = this.props.data.uuid;
    const responseJson = await fetchCreateTextCommentModification(
      textCommentUuid,
      STYLE_UNDERLINE,
      this.state.anchorOffset,
      this.state.focusOffset,
    );
    this.props.create(textCommentUuid, responseJson.data);
    await this.setState({ selectableIsShowable: false });
  }

  /*
   * When the user strike-throughs part of the comment.
   */
  async handleStrikethrough(event) {
    event.preventDefault();
    const textCommentUuid = this.props.data.uuid;
    const responseJson = await fetchCreateTextCommentModification(
      textCommentUuid,
      STYLE_STRIKE_THROUGH,
      this.state.anchorOffset,
      this.state.focusOffset,
    );
    this.props.create(textCommentUuid, responseJson.data);
    await this.setState({ selectableIsShowable: false });
  }

  /*
   * When the user highlights part of the comment.
   */
  async handleHighlight(event) {
    event.preventDefault();
    const textCommentUuid = this.props.data.uuid;
    const responseJson = await fetchCreateTextCommentModification(
      textCommentUuid,
      STYLE_HIGHLIGHT,
      this.state.anchorOffset,
      this.state.focusOffset,
    );
    this.props.create(textCommentUuid, responseJson.data);
    await this.setState({ selectableIsShowable: false });
  }

  /*
   * 🆗
   */
  async onTextSelect() {
    const selection = window.getSelection();

    // Invalid text selection
    if(selection.anchorNode !== selection.focusNode) {
      await this.setState({
        selectableIsShowable: false,
        anchorOffset: null,
        focusOffset: null,
      })
      return;
    }

    // NOTE: anchor is where the user starts selecting text, focus is the end
    //       of the selection.
    const offset = parseInt(selection.anchorNode.parentNode.getAttribute('offset'));
    await this.setState({
      selectableIsShowable: true,
      anchorOffset: offset + selection.anchorOffset,
      focusOffset: offset + selection.focusOffset,
    });
  }

  /*
   * ❗️🆗
   */
  async onTextUnselect() {
    await this.setState({
      selectableIsShowable: false,
      anchorOffset: null,
      focusOffset: null,
    });
  }

  /*
   * Monkey patch Rough Notation so that the markup is displayed behind
   * neighboring text.
   */
  updateZIndex(annotation) {
    annotation._svg.style.zIndex = -1;
  }

  /*
   * When rendering a text comment, the text has to be displayed along with all
   * of its annotations. Here the comment string is spliced into many
   * substrings. If a substring has an accompanying modification, then Rough
   * Notation is used to display the underline, strike-through, or highlight.
   */
  renderTextComment() {
    const textComment = this.props.data;
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
                           getAnnotationObject={this.updateZIndex}>
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
  render() {
    return (
      <div className={styles.TextComment}>
        <div>
          <p ref={this.selectableRef}>
            {this.renderTextComment()}
          </p>
          <Popover selectionRef={this.selectableRef} onTextSelect={this.onTextSelect} onTextUnselect={this.onTextUnselect} isOpen={this.state.selectableIsShowable}>
            <form onSubmit={async (e) => { await this.handleUnderline(e); }}>
              <button type="submit">
                U
              </button>
            </form>
            <form onSubmit={async (e) => { await this.handleStrikethrough(e); }}>
              <button type="submit">
                S
              </button>
            </form>
            <form onSubmit={async (e) => { await this.handleHighlight(e); }}>
              <button type="submit">
                H
              </button>
            </form>
          </Popover>
        </div>

        <button type="button" onClick={async (e) => { await this.props.destroyModifications(this.props.data.uuid); }}>
          Clear modifications
        </button>

        <button type="button" onClick={async (e) => { await this.props.destroy(this.props.data.uuid); }}>
          Delete
        </button>
      </div>
    );
  }

}

TextComment.propTypes = {};

TextComment.defaultProps = {};

export default TextComment;
