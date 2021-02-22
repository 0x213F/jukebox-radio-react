import {
  ENDPOINT_TEXT_COMMENT_DELETE,
  ENDPOINT_TEXT_COMMENT_MODIFICATION_LIST_DELETE,
} from '../../../config/api'
import { TYPE_POST } from '../../../config/global'
import { fetchBackend } from '../../../utils/network'


/*
 * POST delete a text comment.
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
 * POST deletes all modifcations that belong to a text comment.
 */
export const fetchListDeleteTextCommentModifications = async (
  textCommentUuid
) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_TEXT_COMMENT_MODIFICATION_LIST_DELETE,
    { textCommentUuid: textCommentUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
