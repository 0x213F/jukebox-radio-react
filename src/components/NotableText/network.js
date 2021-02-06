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


export const STYLE_BOLD = 'bold';
export const STYLE_ITALICIZE = 'italicize';
export const STYLE_STRIKETHROUGH = 'strikethrough';

export const STYLE_CHOICES = [
  STYLE_BOLD,
  STYLE_ITALICIZE,
  STYLE_STRIKETHROUGH,
];
