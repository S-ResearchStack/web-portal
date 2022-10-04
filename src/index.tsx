import React from 'react';
import { createRoot } from 'react-dom/client';

import printAppVersion from 'src/common/utils/printAppVersion';

import './polyfills';
import App from './App';

printAppVersion();

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
