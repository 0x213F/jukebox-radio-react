import * as modalViews from '../../config/views/modal';


const DEFAULT_CONFIG = { closable: true, bottomBar: true },
      VIEW_CONFIG = {};
VIEW_CONFIG[modalViews.WELCOME] = { closable: false, bottomBar: false };

/*
 * Returns the intial state value for the modal component.
 */
export const initialState = function() {
  return {
    isOpen: false,
    view: modalViews.DEFAULT,
  };
}

/*
 * Opens the modal, displaying a specific view.
 */
export const open = function(state, payload) {
  const view = payload.view,
        data = payload.data,
        modal = {
          ...state.modal,
          view,
          data,
          isOpen: true,
          config: VIEW_CONFIG[view] || DEFAULT_CONFIG,
        };
  return { ...state, modal };
}

/*
 * Closes the modal.
 */
export const close = function(state, payload) {
  const modal = { ...state.modal, view: modalViews.DEFAULT, isOpen: false };
  delete modal.data;
  delete modal.config;
  return { ...state, modal };
}
