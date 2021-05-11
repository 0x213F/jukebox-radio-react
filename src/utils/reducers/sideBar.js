export const sideBarSelectTab = function(state, payload) {
  console.log(payload.tab)
  return {
    ...state,
    sideBar: {
      ...state.sideBar,
      tab: payload.tab,
    }
  };
}
