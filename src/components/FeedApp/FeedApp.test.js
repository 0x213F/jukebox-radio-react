import React from 'react';
import ReactDOM from 'react-dom';
import FeedApp from './FeedApp';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<FeedApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
