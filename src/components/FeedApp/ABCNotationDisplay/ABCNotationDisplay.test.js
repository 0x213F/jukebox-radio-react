import React from 'react';
import ReactDOM from 'react-dom';
import ABCNotationDisplay from './ABCNotationDisplay';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ABCNotationDisplay />, div);
  ReactDOM.unmountComponentAtNode(div);
});
