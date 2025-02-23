import React from 'react';
import { createRoot } from 'react-dom/client';  // Import createRoot from react-dom/client
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';  
import HomePage from './components/HomePage.jsx';  

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';  // Import necessary functions from react-router-dom

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='' element={<HomePage />} />
    </Route>
  )
);

// Create the root for the React app and render it
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
