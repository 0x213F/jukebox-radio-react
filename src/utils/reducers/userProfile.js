export const userProfileUpdate = function(state, payload) {
  return {
    ...state,
    userProfile: {
        ...state.userProfile,
        ...payload,
    }
  }
}