export const playerDisable = function(state, payload) {
  return {
    ...state,
    player: {
      ...state.player,
      controlsEnabled: false,
    }
  }
}


export const playerEnable = function(state, payload) {
  return {
    ...state,
    player: {
      ...state.player,
      controlsEnabled: true,
    }
  }
}
