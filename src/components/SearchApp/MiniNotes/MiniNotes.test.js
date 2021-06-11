import React from 'react';
import ReactDOM from 'react-dom';
import MiniNotes from './MiniNotes';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MiniNotes />, div);
  ReactDOM.unmountComponentAtNode(div);
});
