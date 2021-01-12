import {
  ENDPOINT_OBTAIN_AUTH_TOKEN,
  ENDPOINT_INTIALIZE_STREAM,
  ENDPOINT_VERIFY_TOKEN,
} from '../../config/api'
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


/*
 * Fetches an auth token from the server.
 */
export const fetchInitializeStream = async () => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_INTIALIZE_STREAM,
  );
  const responseJson = await response.json();
  return responseJson;
};


/*
 * Fetches...
 */
export const fetchVerifyToken = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_VERIFY_TOKEN,
    { token: token }
  );
  if(response.status !== 200) {
    throw "Not logged in!";
  }
  const responseJson = await response.json();
  return responseJson;
};
