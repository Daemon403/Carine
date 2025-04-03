import { createRoot } from 'react-dom/client';
import React, { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import {store} from './app/store';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!); // Create a root

root.render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);