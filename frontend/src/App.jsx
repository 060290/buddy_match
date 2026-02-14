import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Meetups from './pages/Meetups';
import MeetupDetail from './pages/MeetupDetail';
import CreateMeetup from './pages/CreateMeetup';
import Messages from './pages/Messages';
import Support from './pages/Support';
import Article from './pages/Article';
import Profile from './pages/Profile';
import Nearby from './pages/Nearby';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="support" element={<Support />} />
        <Route path="support/:slug" element={<Article />} />
        <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="meetups/new" element={<PrivateRoute><CreateMeetup /></PrivateRoute>} />
        <Route path="meetups/:id" element={<PrivateRoute><MeetupDetail /></PrivateRoute>} />
        <Route path="meetups" element={<PrivateRoute><Meetups /></PrivateRoute>} />
        <Route path="messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="nearby" element={<PrivateRoute><Nearby /></PrivateRoute>} />
        <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
