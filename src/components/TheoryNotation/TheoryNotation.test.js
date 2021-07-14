import React from 'react';
import ReactDOM from 'react-dom';
import TheoryNotation from './TheoryNotation';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TheoryNotation />, div);
  ReactDOM.unmountComponentAtNode(div);
});
