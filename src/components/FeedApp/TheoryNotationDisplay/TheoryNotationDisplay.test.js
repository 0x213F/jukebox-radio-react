import React from 'react';
import ReactDOM from 'react-dom';
import TheoryNotationDisplay from './TheoryNotationDisplay';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TheoryNotationDisplay />, div);
  ReactDOM.unmountComponentAtNode(div);
});
