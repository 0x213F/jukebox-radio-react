import React from 'react';
import ReactDOM from 'react-dom';
import StreamEngine from './StreamEngine';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<StreamEngine />, div);
  ReactDOM.unmountComponentAtNode(div);
});
