export const mainEnable = function(state, payload) {
  const main = { ...state.main };
  main.enabled = true;

  return { ...state, main };
}

export const mainDisable = function(state, payload) {
  const main = { ...state.main };
  main.enabled = false;

  return { ...state, main };
}

export const mainAddAction = function(state, payload) {
  const action = payload.action,
        main = { ...state.main };
  main.actions = [...main.actions, action];

  return { ...state, main };
}

export const mainActionStart = function(state, payload) {
  const main = { ...state.main },
        actions = [...main.actions],
        action = { ...actions[0] };
  action.status = 'pending';
  actions[0] = action;
  main.actions = actions;

  return { ...state, main };
}

export const mainActionShift = function(state, payload) {
  const main = { ...state.main },
        actions = [...main.actions];
  actions.shift();
  main.actions = actions;

  return { ...state, main };
}

export const mainSetAutoplayTimeoutId = function(state, payload) {
  const main = { ...state.main, autoplayTimeoutId: payload.timeoutId };
  return { ...state, main };
}

export const mainClearAutoplayTimeoutId = function(state, payload) {
  clearTimeout(state.main.autoplayTimeoutId);
  const main = { ...state.main, autoplayTimeoutId: false };
  return { ...state, main };
}
