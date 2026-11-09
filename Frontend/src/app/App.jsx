import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { AppRoutes } from './AppRoutes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

