/*
 *
 */
export const playerSpotify = function(state, payload) {
  return {
    ...state,
    spotifyApi: payload.spotifyApi,
  }
}
