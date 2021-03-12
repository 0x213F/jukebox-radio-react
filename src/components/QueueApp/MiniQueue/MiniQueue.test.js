import React from 'react';
import ReactDOM from 'react-dom';
import MiniQueue from './MiniQueue';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MiniQueue />, div);
  ReactDOM.unmountComponentAtNode(div);
});
