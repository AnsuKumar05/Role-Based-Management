import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LogoutFeedbackModal } from '../components/common';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userMenus, setUserMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const userMenusPromiseRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchUserMenus = async () => {
    if (userMenusPromiseRef.current) {
      return userMenusPromiseRef.current;
    }
    const promise = (async () => {
      try {
        const res = await fetch('/api/admin/menu-master/user-menus', {
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setUserMenus(list);
          localStorage.setItem('userMenus', JSON.stringify(list));
          return list;
        }
      } catch (e) {
        console.warn('Failed to load user menus:', e);
      } finally {
        userMenusPromiseRef.current = null;
      }
      return [];
    })();

    userMenusPromiseRef.current = promise;
    return promise;
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        const userData = await res.json();
        if (userData && userData.authenticated !== false && userData.name) {
          setUser(userData);
          localStorage.setItem('userName', userData.name);
          localStorage.setItem('userRole', userData.role);
          if (userData.permissions) {
            localStorage.setItem('userPermissions', JSON.stringify(userData.permissions));
          }
          await fetchUserMenus();
          return userData;
        } else {
          setUser(null);
          setUserMenus([]);
          localStorage.removeItem('userName');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userPermissions');
          localStorage.removeItem('userMenus');
          return null;
        }
      } else {
        setUser(null);
        setUserMenus([]);
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userPermissions');
        localStorage.removeItem('userMenus');
        return null;
      }
    } catch (err) {
      console.warn('Auth check failed:', err);
      setUser(null);
      setUserMenus([]);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshUserMenus = async () => {
    return await fetchUserMenus();
  };

  const refreshPermissions = async () => {
    const u = await checkAuth();
    return { user: u, menus: userMenus };
  };

  const hasMenuAccess = (moduleOrMenuName) => {
    if (!moduleOrMenuName) return false;
    const role = (user?.role || localStorage.getItem('userRole') || '').toLowerCase();
    if (role === 'admin') return true; // Administrator role has universal access

    let currentMenus = userMenus;
    if (!currentMenus || currentMenus.length === 0) {
      try {
        const stored = localStorage.getItem('userMenus');
        if (stored) currentMenus = JSON.parse(stored);
      } catch {
        currentMenus = [];
      }
    }

    if (Array.isArray(currentMenus)) {
      const target = moduleOrMenuName.toLowerCase();
      return currentMenus.some(m => 
        (m.name && m.name.toLowerCase() === target) || 
        (m.module && m.module.toLowerCase() === target) ||
        (m.displayName && m.displayName.toLowerCase() === target)
      );
    }
    return false;
  };

  const hasPermission = (permissionName) => {
    if (!permissionName) return false;
    const role = (user?.role || localStorage.getItem('userRole') || '').toLowerCase();
    if (role === 'admin') return true; // Administrator role has universal access

    let currentPerms = user?.permissions;
    if (!currentPerms) {
      try {
        const stored = localStorage.getItem('userPermissions');
        if (stored) currentPerms = JSON.parse(stored);
      } catch {
        currentPerms = [];
      }
    }

    if (Array.isArray(currentPerms)) {
      return currentPerms.includes(permissionName);
    }
    return false;
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed.');
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userRole', data.user.role);
      if (data.user.permissions) {
        localStorage.setItem('userPermissions', JSON.stringify(data.user.permissions));
      }
    }
    await fetchUserMenus();
    return data;
  };

  const register = async (name, email, phone, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed.');
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userRole', data.user.role);
      if (data.user.permissions) {
        localStorage.setItem('userPermissions', JSON.stringify(data.user.permissions));
      }
    }
    await fetchUserMenus();
    return data;
  };

  const forgotPassword = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
    return data;
  };

  const verifyResetCode = async (email, code) => {
    const res = await fetch('/api/auth/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid OTP.');
    return data;
  };

  const resetPassword = async (email, code, newPassword) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Password reset failed.');
    return data;
  };

  const performLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout request note:', e);
    }
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userPermissions');
    setShowFeedbackModal(false);
    window.location.href = '/login';
  };

  const handleFeedbackSubmitted = async () => {
    const userId = user?.userId || user?.UserId;
    if (userId) {
      localStorage.setItem(`has_reviewed_${userId}`, 'true');
      localStorage.removeItem(`has_new_booking_since_review_${userId}`);
    } else {
      localStorage.setItem('guest_has_reviewed', 'true');
    }
    await performLogout();
  };

  const isPrivilegedUser = (role) => {
    if (!role) return false;
    const r = role.toLowerCase();
    return r === 'admin' || r === 'manager' || r === 'staff';
  };

  const logout = async (forceDirect = false) => {
    const role = user?.role || localStorage.getItem('userRole');
    const isStaffOrAdmin = isPrivilegedUser(role);
    if (forceDirect || isStaffOrAdmin) {
      await performLogout();
      return;
    }

    // Only show feedback form if the user has actually booked a room
    const userId = user?.userId || user?.UserId;
    try {
      const res = await fetch('/api/bookings/my');
      if (res.ok) {
        const bookings = await res.json();
        // If user has never booked a room, log out immediately without showing feedback form
        if (!Array.isArray(bookings) || bookings.length === 0) {
          await performLogout();
          return;
        }
      } else {
        await performLogout();
        return;
      }
    } catch (e) {
      await performLogout();
      return;
    }

    const hasReviewed = userId 
      ? localStorage.getItem(`has_reviewed_${userId}`) === 'true' 
      : localStorage.getItem('guest_has_reviewed') === 'true';
    const hasNewBooking = userId 
      ? localStorage.getItem(`has_new_booking_since_review_${userId}`) === 'true' 
      : false;

    // If the user has already submitted a review and hasn't booked again, log out directly
    if (hasReviewed && !hasNewBooking) {
      await performLogout();
      return;
    }

    setShowFeedbackModal(true);
  };

  const cancelLogout = () => {
    setShowFeedbackModal(false);
  };

  const userRole = user?.role || localStorage.getItem('userRole');
  const isAdminOrStaff = isPrivilegedUser(userRole);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        checkAuth,
        login,
        register,
        logout,
        performLogout,
        forgotPassword,
        verifyResetCode,
        resetPassword,
        hasPermission,
        refreshPermissions,
        hasMenuAccess,
        refreshUserMenus,
        userMenus,
        setUserMenus,
        permissions: user?.permissions || [],
        isAdmin: isAdminOrStaff,
        userRole: user?.role
      }}
    >
      {children}

      {!isAdminOrStaff && (
        <LogoutFeedbackModal
          isOpen={showFeedbackModal}
          onClose={cancelLogout}
          onSkip={performLogout}
          onSubmitFeedback={handleFeedbackSubmitted}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
