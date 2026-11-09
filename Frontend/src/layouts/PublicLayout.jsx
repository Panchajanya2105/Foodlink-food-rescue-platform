import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

