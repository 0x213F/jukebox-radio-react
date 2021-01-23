import {
  ENDPOINT_TEXT_COMMENT_DELETE,
  ENDPOINT_TEXT_COMMENT_UPDATE,
  ENDPOINT_TEXT_COMMENT_MODIFICATION_LIST_DELETE,
} from '../../config/api'
import { TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
export const fetchDeleteTextComment = async (textCommentUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_TEXT_COMMENT_DELETE,
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
    ENDPOINT_TEXT_COMMENT_UPDATE,
    { textCommentUuid: textCommentUuid, text: text },
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
    ENDPOINT_TEXT_COMMENT_MODIFICATION_LIST_DELETE,
    { textCommentUuid: textCommentUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
