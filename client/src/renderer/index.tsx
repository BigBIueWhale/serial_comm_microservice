import { createRoot } from 'react-dom/client';
import App from './App';
import React from 'react';
import { ToastProvider } from './src/Context/Toast.context';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
