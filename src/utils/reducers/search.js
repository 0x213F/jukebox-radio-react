import {
  SERVICE_SPOTIFY,
  SERVICE_APPLE_MUSIC,
} from '../../config/services';

/*
 * Set service used for search.
 */
export const searchSetService = function(state, payload) {
  const { service } = payload,
        { userSettings } = state;

  localStorage.setItem('searchService', service);

  if(service === SERVICE_APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    if(!music.musicUserToken) {
      music.authorize();
      return state;
    }
  } else if(service === SERVICE_SPOTIFY) {
    if(userSettings && !userSettings.spotify.accessToken) {
      window.location.href = userSettings.spotify.authorizationUrl;
      return state;
    }
  }

  return {
    ...state,
    search: { ...state.search, service },
  }
}

/*
 * Set search query.
 */
export const searchSetQuery = function(state, payload) {
  const { query } = payload;

  return {
    ...state,
    search: { ...state.search, query },
  };
}

/*
 * Set search query.
 */
export const searchSetCache = function(state, payload) {
  const { query, service, responseJson } = payload,
        cache = { ...state.search.cache },
        queryCache = { ...cache[query] } || {};

  queryCache[service] = responseJson;
  cache[query] = queryCache;

  return {
    ...state,
    search: { ...state.search, cache },
  };
}
