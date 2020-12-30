import React from 'react';
import ReactDOM from 'react-dom';
import Queue from './Queue';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Queue />, div);
  ReactDOM.unmountComponentAtNode(div);
});