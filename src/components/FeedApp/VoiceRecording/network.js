import {
  ENDPOINT_VOICE_RECORDING_CREATE,
  ENDPOINT_VOICE_RECORDING_DELETE,
} from '../../../config/api';
import { TYPE_POST } from '../../../config/global';
import { fetchBackend } from '../../../utils/network';


/*
 * Creates a voice recording.
 */
export const fetchCreateVoiceRecording = async (
  audioFile, transcriptData, transcriptFinal, voiceRecordingTimestamp
) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_VOICE_RECORDING_CREATE,
    { audioFile, transcriptData, transcriptFinal, voiceRecordingTimestamp},
  );
  const responseJson = await response.json();
  return responseJson;
};


/*
 * Deletes (archives on the DB level) a voice recording.
 */
export const fetchDeleteVoiceRecording = async (voiceRecordingUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_VOICE_RECORDING_DELETE,
    { voiceRecordingUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
