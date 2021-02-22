import {
  ENDPOINT_TEXT_COMMENT_CREATE,
  ENDPOINT_TEXT_COMMENT_LIST,
  ENDPOINT_VOICE_RECORDING_LIST
} from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
export const fetchTextCommentCreate = async (text, format, textCommentUuid, textCommentTimestamp) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_TEXT_COMMENT_CREATE,
    { text, format, textCommentUuid, textCommentTimestamp },
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
export const fetchTextCommentList = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_TEXT_COMMENT_LIST
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
export const fetchVoiceRecordingList = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_VOICE_RECORDING_LIST
  );
  const responseJson = await response.json();
  return responseJson;
};
