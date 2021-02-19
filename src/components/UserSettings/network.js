import {
  ENDPOINT_USER_GET_SETTINGS,
  ENDPOINT_USER_UPDATE_SETTINGS,
} from '../../config/api'
import { TYPE_GET, TYPE_POST } from '../../config/global'
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


/*
 * Set user settings on the server.
 */
export const fetchUpdateUserSettings = async (field, value) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_USER_UPDATE_SETTINGS,
    { field, value },
  );
  const responseJson = await response.json();
  return responseJson;
};
