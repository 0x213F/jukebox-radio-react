import React from 'react';
import ReactDOM from 'react-dom';
import SearchApp from './SearchApp';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SearchApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
