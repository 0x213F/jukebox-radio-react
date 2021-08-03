import * as services from '../../config/services';

/*
 * Returns the intial state value for the modal component.
 */
export const initialState = function() {
  return {
    service: (localStorage.getItem('searchService') || null),
    query: '',
    cache: {},
  };
}

/*
 * Set service used for search.
 */
export const setService = function(state, payload) {
  const { service } = payload,
        { userSettings } = state;

  localStorage.setItem('searchService', service);

  if(service === services.APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    if(!music.musicUserToken) {
      music.authorize();
      return state;
    }
  } else if(service === services.SPOTIFY) {
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
export const setQuery = function(state, payload) {
  const { query } = payload;

  return {
    ...state,
    search: { ...state.search, query },
  };
}

/*
 * Set search query.
 */
export const setCache = function(state, payload) {
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
