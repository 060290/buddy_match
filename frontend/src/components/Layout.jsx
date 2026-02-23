import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Nav from './Nav';

export default function Layout() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  if (isLoggedIn) {
    return (
      <div className="app-shell">
        <Nav isLoggedIn={true} variant="sidebar" />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <>
      <Nav isLoggedIn={false} />
      <main style={{ minHeight: 'calc(100vh - 64px)', paddingBottom: '2rem' }}>
        <Outlet />
      </main>
    </>
  );
}
