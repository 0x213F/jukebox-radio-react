import React from 'react';
import ReactDOM from 'react-dom';
import ProgressBar from './ProgressBar';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ProgressBar />, div);
  ReactDOM.unmountComponentAtNode(div);
});
