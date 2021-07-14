import React from 'react';
import ReactDOM from 'react-dom';
import MainRouter from './MainRouter';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MainRouter />, div);
  ReactDOM.unmountComponentAtNode(div);
});
