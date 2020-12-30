import {
  ENDPOINT_CREATE_TEXT_COMMENT,
  ENDPOINT_LIST_TEXT_COMMENTS,
  ENDPOINT_LIST_VOICE_RECORDINGS
} from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
const fetchCreateTextComment = async (text) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_CREATE_TEXT_COMMENT,
    {text: text},
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchTextComments = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_LIST_TEXT_COMMENTS
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches...
 */
const fetchVoiceRecordings = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_LIST_VOICE_RECORDINGS
  );
  const responseJson = await response.json();
  return responseJson;
};

export { fetchCreateTextComment, fetchTextComments, fetchVoiceRecordings }
