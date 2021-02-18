import { ENDPOINT_USER_CONNECT_SPOTIFY } from '../../config/api';
import { TYPE_POST } from '../../config/global';
import { fetchBackend } from '../../utils/network';

/*
 * Fetches an auth token from the server.
 */
export const fetchUserConnectSpotify = async (code, error) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_USER_CONNECT_SPOTIFY,
    { code, error },
  );
  const responseJson = await response.json();
  return responseJson;
};
