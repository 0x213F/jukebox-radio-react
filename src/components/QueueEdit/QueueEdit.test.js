import React from 'react';
import ReactDOM from 'react-dom';
import QueueEdit from './QueueEdit';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<QueueEdit />, div);
  ReactDOM.unmountComponentAtNode(div);
});
