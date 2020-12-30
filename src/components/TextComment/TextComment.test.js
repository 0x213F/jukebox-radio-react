import React from 'react';
import ReactDOM from 'react-dom';
import TextComment from './TextComment';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<TextComment />, div);
  ReactDOM.unmountComponentAtNode(div);
});
