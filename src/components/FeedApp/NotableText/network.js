import {
  ENDPOINT_TEXT_COMMENT_MODIFICATION_CREATE,
} from '../../../config/api';
import { TYPE_POST } from '../../../config/global';
import { fetchBackend } from '../../../utils/network';


/*
 * Creates a style modification for a text comment.
 */
export const fetchCreateTextCommentModification = async (
  textCommentUuid, style, anchorOffset, focusOffset
) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_TEXT_COMMENT_MODIFICATION_CREATE,
    { textCommentUuid, style, anchorOffset, focusOffset },
  );
  const responseJson = await response.json();
  return responseJson;
};
