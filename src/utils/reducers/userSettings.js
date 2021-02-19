export const userSettingsUpdate = function(state, payload) {
  return {
    ...state,
    userSettings: {
        ...state.userSettings,
        ...payload,
    }
  }
}