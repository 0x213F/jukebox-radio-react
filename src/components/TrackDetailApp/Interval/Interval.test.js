import React from 'react';
import ReactDOM from 'react-dom';
import Interval from './Interval';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Interval />, div);
  ReactDOM.unmountComponentAtNode(div);
});
