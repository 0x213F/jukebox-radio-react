import React from 'react';
import ReactDOM from 'react-dom';
import NotationCompose from './NotationCompose';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<NotationCompose />, div);
  ReactDOM.unmountComponentAtNode(div);
});
