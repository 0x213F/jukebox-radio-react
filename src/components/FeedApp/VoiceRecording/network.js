import {
  ENDPOINT_VOICE_RECORDING_CREATE,
  ENDPOINT_VOICE_RECORDING_DELETE,
} from '../../../config/api';
import { TYPE_POST } from '../../../config/global';
import { fetchBackend } from '../../../utils/network';


/*
 * POST creates a voice recording.
 */
export const fetchCreateVoiceRecording = async (
  audioFile, transcriptData, transcriptFinal
) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_VOICE_RECORDING_CREATE,
    { audioFile, transcriptData, transcriptFinal },
  );
  const responseJson = await response.json();
  return responseJson;
};


/*
 * POST deletes a voice recording.
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
