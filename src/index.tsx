import React from 'react';
import ReactDOM from 'react-dom/client';
import  Router from "./router/Router";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router />
    <div>Hello World!</div>
  </React.StrictMode>
);