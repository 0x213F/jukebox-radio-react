import React from 'react';
import ReactDOM from 'react-dom';
import MainApp from './MainApp';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MainApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
