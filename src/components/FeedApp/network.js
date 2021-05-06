import {
  ENDPOINT_TEXT_COMMENT_CREATE,
  ENDPOINT_TEXT_COMMENT_LIST,
  ENDPOINT_VOICE_RECORDING_LIST,
} from '../../config/api';
import { TYPE_GET, TYPE_POST } from '../../config/global';
import { fetchBackend } from '../../utils/network';


/*
 * Creates a "text comment." Usually of format "text" or "abc_notation."
 */
export const fetchTextCommentCreate = async (text, format, trackUuid, textCommentTimestamp) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_TEXT_COMMENT_CREATE,
    { text, format, trackUuid, textCommentTimestamp },
  );
  const responseJson = await response.json();
  return responseJson;
};


/*
 * Gets a list of all "text comments." Usually of format "text" or
 * "abc_notation."
 */
export const fetchTextCommentList = async (trackUuid) => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_TEXT_COMMENT_LIST,
    { trackUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};


/*
 * Gets a list of all voice recordings.
 */
export const fetchVoiceRecordingList = async (trackUuid) => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_VOICE_RECORDING_LIST,
    { trackUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
