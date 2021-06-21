import {
  SERVICE_SPOTIFY,
  SERVICE_APPLE_MUSIC,
} from '../../config/services';


export const searchSetService = function(state, payload) {
  const { service } = payload,
        { userSettings } = state;

  localStorage.setItem('searchService', service);

  if(service === SERVICE_APPLE_MUSIC) {
    const music = window.MusicKit.getInstance();
    if(!music.musicUserToken) {
      music.authorize();
      return;
    }
  } else if(service === SERVICE_SPOTIFY) {
    if(userSettings && !userSettings.spotify.accessToken) {
      window.location.href = userSettings.spotify.authorizationUrl;
      return;
    }
  }

  return {
    ...state,
    search: { ...state.search, service },
  }
}
