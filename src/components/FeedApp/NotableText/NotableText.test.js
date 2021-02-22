import React from 'react';
import ReactDOM from 'react-dom';
import NotableText from './NotableText';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<NotableText />, div);
  ReactDOM.unmountComponentAtNode(div);
});
