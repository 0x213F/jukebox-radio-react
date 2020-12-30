import { ENDPOINT_OBTAIN_AUTH_TOKEN } from '../../config/api'
import { TYPE_POST } from '../../config/global'
import { fetchBackend } from '../../utils/network'

/*
 * Fetches an auth token from the server.
 */
export const fetchAuthToken = async (username, password) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_OBTAIN_AUTH_TOKEN,
    { username: username, password: password },
  );
  const responseJson = await response.json();
  return responseJson;
};
