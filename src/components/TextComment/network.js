import {
  ENDPOINT_DELETE_TEXT_COMMENT,
  ENDPOINT_UPDATE_TEXT_COMMENT,
  ENDPOINT_CREATE_TEXT_COMMENT_MODIFICATION,
  ENDPOINT_LIST_DELETE_TEXT_COMMENT_MODIFICATIONS,
} from '../../config/api'
import { TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
export const fetchDeleteTextComment = async (textCommentUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_DELETE_TEXT_COMMENT,
    { textCommentUuid: textCommentUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};


/*
 * Fetches...
 */
export const fetchUpdateTextComment = async (textCommentUuid, text) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_UPDATE_TEXT_COMMENT,
    { textCommentUuid: textCommentUuid, text: text },
  );
  const responseJson = await response.json();
  return responseJson;
};


/*
 * Fetches...
 */
export const fetchCreateTextCommentModification = async (textCommentUuid, style, anchorOffset, focusOffset) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_CREATE_TEXT_COMMENT_MODIFICATION,
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


/*
 * Fetches...
 */
export const fetchListDeleteTextCommentModifications = async (textCommentUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_LIST_DELETE_TEXT_COMMENT_MODIFICATIONS,
    { textCommentUuid: textCommentUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};


export const STYLE_UNDERLINE = 'underline';
export const STYLE_STRIKE_THROUGH = 'strike-through';
export const STYLE_HIGHLIGHT = 'highlight';
