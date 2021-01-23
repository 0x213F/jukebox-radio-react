import {
  ENDPOINT_USER_GET_SETTINGS
} from '../../config/api'
import { TYPE_GET } from '../../config/global'
import { fetchBackend } from '../../utils/network'

/*
 * Fetches an user settings from the server.
 */
export const fetchGetUserSettings = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_USER_GET_SETTINGS,
  );
  const responseJson = await response.json();
  return responseJson;
};

