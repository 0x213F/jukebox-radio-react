import React from 'react';
import ReactDOM from 'react-dom';
import BottomBar from './BottomBar';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<BottomBar />, div);
  ReactDOM.unmountComponentAtNode(div);
});
