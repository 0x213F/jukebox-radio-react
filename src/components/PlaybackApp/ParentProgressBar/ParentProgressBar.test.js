import React from 'react';
import ReactDOM from 'react-dom';
import ParentProgressBar from './ParentProgressBar';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ParentProgressBar />, div);
  ReactDOM.unmountComponentAtNode(div);
});
