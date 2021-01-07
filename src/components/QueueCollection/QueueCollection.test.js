import React from 'react';
import ReactDOM from 'react-dom';
import QueueCollection from './QueueCollection';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<QueueCollection />, div);
  ReactDOM.unmountComponentAtNode(div);
});
