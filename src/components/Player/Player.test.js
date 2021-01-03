import React from 'react';
import ReactDOM from 'react-dom';
import Player from './Player';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Player />, div);
  ReactDOM.unmountComponentAtNode(div);
});
