import React from 'react';
import ReactDOM from 'react-dom/client';
import { PopupApp } from './app/PopupApp';
import './index.css';

const rootElement = document.getElementById('popup-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PopupApp />
    </React.StrictMode>
  );
}
