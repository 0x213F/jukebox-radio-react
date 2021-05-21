export const sideBarSelectTab = function(state, payload) {
  return {
    ...state,
    sideBar: {
      ...state.sideBar,
      tab: payload.tab,
    }
  };
}
