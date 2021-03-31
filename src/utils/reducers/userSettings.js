export const userSettingsUpdate = function(state, payload) {
  return {
    ...state,
    userSettings: {
        ...state.userSettings,
        ...payload,
    }
  }
}


export const userGetSettings = function(state, action) {
  return {
    ...state,
    userSettings: action.userSettings,
  }
}
