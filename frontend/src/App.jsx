import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPage from './pages/ForgotPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Home Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/home.html" element={<HomePage />} />

        {/* Rooms Routes */}
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms.html" element={<RoomsPage />} />

        {/* Booking Routes */}
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking.html" element={<BookingPage />} />

        {/* My Bookings Routes */}
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/my-bookings.html" element={<MyBookingsPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login.html" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register.html" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/forgot.html" element={<ForgotPage />} />

        {/* Profile Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile.html" element={<ProfilePage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin.html" element={<AdminPage />} />

        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}
