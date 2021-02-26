import React from 'react';
import ReactDOM from 'react-dom';
import SideBar from './SideBar';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SideBar />, div);
  ReactDOM.unmountComponentAtNode(div);
});
