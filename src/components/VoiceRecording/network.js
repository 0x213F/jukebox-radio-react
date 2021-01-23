import { ENDPOINT_VOICE_RECORDING_CREATE, ENDPOINT_VOICE_RECORDING_DELETE } from '../../config/api'
import { TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'


/*
 * Fetches...
 */
export const fetchCreateVoiceRecording = async (audioFile, transcriptData, transcriptFinal) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_VOICE_RECORDING_CREATE,
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
    ENDPOINT_VOICE_RECORDING_DELETE,
    { voiceRecordingUuid: voiceRecordingUuid },
  );
  const responseJson = await response.json();
  return responseJson;
};
