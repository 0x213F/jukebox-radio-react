import React from 'react';
import ReactDOM from 'react-dom';
import ABCNotationCompose from './ABCNotationCompose';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ABCNotationCompose />, div);
  ReactDOM.unmountComponentAtNode(div);
});
