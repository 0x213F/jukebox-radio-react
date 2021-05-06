import {
  ENDPOINT_TEXT_COMMENT_DELETE,
  ENDPOINT_TEXT_COMMENT_MODIFICATION_LIST_DELETE,
} from '../../../config/api';
import { TYPE_POST } from '../../../config/global';
import { fetchBackend } from '../../../utils/network';


/*
 * Deletes a text comment along with all of its modifications.
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
 * Deletes all modifcations that belong to a text comment.
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
