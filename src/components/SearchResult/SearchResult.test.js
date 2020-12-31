import React from 'react';
import ReactDOM from 'react-dom';
import SearchResult from './SearchResult';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SearchResult />, div);
  ReactDOM.unmountComponentAtNode(div);
});
