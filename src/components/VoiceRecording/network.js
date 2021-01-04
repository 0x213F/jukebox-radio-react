import { ENDPOINT_CREATE_VOICE_RECORDING, ENDPOINT_DELETE_VOICE_RECORDING } from '../../config/api'
import { TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
export const fetchCreateVoiceRecording = async (audioFile, transcriptData, transcriptFinal) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_CREATE_VOICE_RECORDING,
    {
      audioFile: audioFile,
      transcriptData: transcriptData,
      transcriptFinal: transcriptFinal,
    },
  );
  const responseJson = await response.json();
  return responseJson;
};

/*
 * Fetches an auth token from the server.
 */
export const fetchDeleteVoiceRecording = async (voiceRecordingUuid) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_DELETE_VOICE_RECORDING,
    { voiceRecordingUuid: voiceRecordingUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
