import React from 'react';
import ReactDOM from 'react-dom';
import ChildProgressBar from './ChildProgressBar';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ChildProgressBar />, div);
  ReactDOM.unmountComponentAtNode(div);
});
