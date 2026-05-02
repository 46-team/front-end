// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // <-- Global styles imported here
import RegisterForm from '../RegisterForm';


const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <RegisterForm />
  </React.StrictMode>
);
