import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// Import BrowserRouter, Routes, and Route for routing
import { BrowserRouter } from 'react-router-dom';
import App from './App';
// Import BorrowerPanelModal once, for build sanity (tree-shaken if not referenced)
import BorrowerPanelModal from './BorrowerPanelModal';
// Welcome page will be imported in App.js (for proper code split).

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
