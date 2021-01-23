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
const fetchCreateTextComment = async (text) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_TEXT_COMMENT_CREATE,
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
    ENDPOINT_TEXT_COMMENT_LIST
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
    ENDPOINT_VOICE_RECORDING_LIST
  );
  const responseJson = await response.json();
  return responseJson;
};

export { fetchCreateTextComment, fetchTextComments, fetchVoiceRecordings }
