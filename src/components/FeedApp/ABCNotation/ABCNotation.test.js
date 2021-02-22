import React from 'react';
import ReactDOM from 'react-dom';
import ABCNotation from './ABCNotation';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ABCNotation />, div);
  ReactDOM.unmountComponentAtNode(div);
});
