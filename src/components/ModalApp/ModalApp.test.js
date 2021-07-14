import React from 'react';
import ReactDOM from 'react-dom';
import ModalApp from './ModalApp';


it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ModalApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
