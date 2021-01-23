import {
  ENDPOINT_TEXT_COMMENT_MODIFICATION_CREATE,
} from '../../config/api'
import { TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
export const fetchCreateTextCommentModification = async (textCommentUuid, style, anchorOffset, focusOffset) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_TEXT_COMMENT_MODIFICATION_CREATE,
    {
      textCommentUuid: textCommentUuid,
      style: style,
      anchorOffset: anchorOffset,
      focusOffset: focusOffset,
    },
  );
  const responseJson = await response.json();
  return responseJson;
};


export const STYLE_UNDERLINE = 'underline';
export const STYLE_BOX = 'box';
export const STYLE_CIRCLE = 'circle';
export const STYLE_HIGHLIGHT = 'highlight';
export const STYLE_STRIKE_THROUGH = 'strike-through';
export const STYLE_CROSSED_OFF = 'crossed-off';
export const STYLE_BRACKET = 'bracket';

export const STYLE_CHOICES = [
  STYLE_UNDERLINE,
  STYLE_BOX,
  STYLE_CIRCLE,
  STYLE_HIGHLIGHT,
  STYLE_STRIKE_THROUGH,
  STYLE_CROSSED_OFF,
  STYLE_BRACKET,
];
