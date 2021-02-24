import {
  ENDPOINT_USER_GET_PROFILE,
  ENDPOINT_USER_UPDATE_PROFILE
} from '../../config/api';
import { TYPE_GET, TYPE_POST } from '../../config/global';
import { fetchBackend } from '../../utils/network';

// Fetches user profile from the server.

export const fetchGetUserProfile = async () => {
  const response = await fetchBackend(
    TYPE_GET,
    ENDPOINT_USER_GET_PROFILE
  );
  const responseJson = await response.json();
  return responseJson;
}

export const fetchUpdateUserProfile = async(field, value) => {
  const response = await fetchBackend(
    TYPE_POST,
    ENDPOINT_USER_UPDATE_PROFILE,
    { field, value }
  );
  const responseJson = await response.json();
  return responseJson;
}