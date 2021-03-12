import React from 'react';
import ReactDOM from 'react-dom';
import WelcomeApp from './WelcomeApp';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<WelcomeApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
