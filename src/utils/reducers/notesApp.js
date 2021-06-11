

export const notesAppSet = function(state, payload) {
  const notesApp = { ...state.notesApp },
        notesStore = { ...state.notesApp.store },
        { key, value } = payload;

  notesStore[key] = value;
  notesApp.store = notesStore;
  localStorage.setItem('notesStore', JSON.stringify(notesStore));

  return { ...state, notesApp };
}
