import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Nav from './Nav';

export default function Layout() {
  const { user } = useAuth();
  return (
    <>
      <Nav isLoggedIn={!!user} />
      <main style={{ minHeight: 'calc(100vh - 64px)', paddingBottom: '2rem' }}>
        <Outlet />
      </main>
    </>
  );
}
