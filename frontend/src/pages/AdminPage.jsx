import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFoodCatalog, saveFoodCatalog, syncFoodCatalogToDb, getRoomMeta } from '../data/roomMetadata';
import { getRoomsCatalog, syncRoomsToDb } from '../data/roomsCatalog';
import '../styles/admin.css';

const FEATURE_1_OPTIONS = {
  medium: [
    'High-Speed Wi-Fi 6',
    'Ultra-Fast 500 Mbps Wi-Fi',
    'Complimentary High-Speed Wi-Fi'
  ],
  high: [
    'Gigabit Fiber Wi-Fi 6E',
    'Dedicated 1 Gbps Ultra-Speed Network',
    'Private Encrypted Wi-Fi Suite'
  ]
};

const FEATURE_2_OPTIONS = {
  medium: [
    '50" 4K Smart TV',
    '55" 4K Smart TV',
    '55" 4K Smart TV with Streaming'
  ],
  high: [
    '65" OLED 4K TV & Soundbar',
    '75" Sony 4K Bravia Cinema Display',
    'Bang & Olufsen Premium Audio Suite'
  ]
};

const FEATURE_3_OPTIONS = {
  medium: [
    'Climate Air Conditioning',
    'Rainfall Shower & Botanical Toiletries',
    'Individual Climate Control & Thermostat'
  ],
  high: [
    'Deep Soaking Italian Marble Tub',
    'Dual Calacatta Marble Vanity & Steam Shower',
    'Private Heated Jacuzzi & Hydrotherapy Spa'
  ]
};

const FEATURE_4_OPTIONS = {
  medium: [
    '24/7 Room Service',
    'Artisan Tea & Coffee Maker',
    'Daily Premium Housekeeping'
  ],
  high: [
    '24/7 In-Room Gourmet Dining',
    'Personal 24/7 Suite Butler',
    'Private Chef In-Suite Dining Experience'
  ]
};

const FEATURE_5_OPTIONS = {
  medium: [
    'Valet & Monitored Parking',
    'Private Balcony with Garden View',
    'Electronic Safety Locker & Mini Bar'
  ],
  high: [
    'Private Panoramic Skyline Balcony & Terrace',
    'Private Heated Jacuzzi on Sky Deck',
    'Private Infinity Plunge Pool',
    'Complimentary Executive Club Lounge Access',
    'Dedicated Luxury Chauffeur & Limousine'
  ]
};



export default function AdminPage() {
  const { user, loading: authLoading, logout, hasPermission, refreshPermissions, hasMenuAccess, userMenus, refreshUserMenus, setUserMenus } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const PAGE_SIZE = 10;

  // Active Tab: 'dashboard' | 'rooms' | 'bookings' | 'users' | 'food' | 'permissions'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  // Tab 1: Dashboard State
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Tab 2: Rooms State
  const [roomsData, setRoomsData] = useState([]);
  const [roomsFiltered, setRoomsFiltered] = useState([]);
  const [roomsPage, setRoomsPage] = useState(1);
  const [roomsSearchNum, setRoomsSearchNum] = useState('');
  const [roomsSearchType, setRoomsSearchType] = useState('All');
  const [roomsSearchStatus, setRoomsSearchStatus] = useState('All');
  const [deletedRooms, setDeletedRooms] = useState([]);
  const [showDeletedRoomsModal, setShowDeletedRoomsModal] = useState(false);

  // Room Modals
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    roomType: 'Deluxe Room',
    subType: 'Deluxe Courtyard Sanctuary',
    price: '',
    capacity: 2,
    status: 'Available',
    description: '',
    images: '',
    facility1: 'High-Speed Wi-Fi 6',
    facility2: '55" 4K Smart TV',
    facility3: 'Climate Air Conditioning',
    facility4: '24/7 Room Service',
    facility5: 'Valet & Monitored Parking'
  });

  // Tab 4: Users State
  const [usersData, setUsersData] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFiltered, setUsersFiltered] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersFilterRole, setUsersFilterRole] = useState('All');
  const [usersFilterStatus, setUsersFilterStatus] = useState('All');
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', phone: '', role: 'User', isActive: true });

  // Tab 3: Bookings State
  const [bookingsData, setBookingsData] = useState([]);
  const [bookingsFiltered, setBookingsFiltered] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [bookingsFilterStatus, setBookingsFilterStatus] = useState('All');

  // Booking Modals
  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState(null);
  const [updateStatusForm, setUpdateStatusForm] = useState({
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash'
  });

  // Tab 5: Food Menu State
  const [foodData, setFoodData] = useState(getFoodCatalog());
  const [foodFiltered, setFoodFiltered] = useState(getFoodCatalog());
  const [foodPage, setFoodPage] = useState(1);
  const [foodCategoryFilter, setFoodCategoryFilter] = useState('All');
  const [foodSearch, setFoodSearch] = useState('');
  const [openFoodMenuId, setOpenFoodMenuId] = useState(null);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [deletedFood, setDeletedFood] = useState([]);
  const [showDeletedFoodModal, setShowDeletedFoodModal] = useState(false);

  const [foodForm, setFoodForm] = useState({
    name: '',
    category: 'Vegetarian',
    price: '',
    diet: 'Veg',
    tag: '',
    desc: '',
    image: ''
  });

  // Tab 6: Role & Permission Management State
  const [rolePermissionsMatrix, setRolePermissionsMatrix] = useState({});
  const [allPermissionsList, setAllPermissionsList] = useState([]);
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState('Staff');
  const [selectedRolePerms, setSelectedRolePerms] = useState([]);
  const [rolePermsLoading, setRolePermsLoading] = useState(false);
  const [rolePermsSaving, setRolePermsSaving] = useState(false);
  const [rolePermsMessage, setRolePermsMessage] = useState('');

  // Tab 7: Menu Master State
  const [allMenusList, setAllMenusList] = useState([]);
  const [roleMenuMatrix, setRoleMenuMatrix] = useState({});
  const [selectedRoleForMenuMaster, setSelectedRoleForMenuMaster] = useState('Staff');
  const [selectedRoleMenuAssignments, setSelectedRoleMenuAssignments] = useState([]);
  const [menuMasterSearch, setMenuMasterSearch] = useState('');
  const [menuMasterCategory, setMenuMasterCategory] = useState('All');
  const [openMenuMasterActionId, setOpenMenuMasterActionId] = useState(null);
  const [menuMasterLoading, setMenuMasterLoading] = useState(false);
  const menuMasterLoadingRef = useRef(false);
  const menuMasterLoadedRef = useRef(false);

  // In-flight and loaded cache refs to eliminate redundant database queries
  const dashboardLoadingRef = useRef(false);
  const dashboardLoadedRef = useRef(false);
  const roomsLoadingRef = useRef(false);
  const roomsLoadedRef = useRef(false);
  const bookingsLoadingRef = useRef(false);
  const bookingsLoadedRef = useRef(false);
  const usersLoadingRef = useRef(false);
  const usersLoadedRef = useRef(false);
  const foodLoadingRef = useRef(false);
  const foodLoadedRef = useRef(false);
  const rolePermsLoadingRef = useRef(false);
  const rolePermsLoadedRef = useRef(false);
  const reportsLoadingRef = useRef(false);
  const reportsLoadedRef = useRef(false);

  const [menuMasterSaving, setMenuMasterSaving] = useState(false);
  const [menuMasterMessage, setMenuMasterMessage] = useState('');
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    displayName: '',
    route: '',
    icon: 'fa-folder',
    module: '',
    displayOrder: 1,
    isActive: true
  });
  const [editMenuFormData, setEditMenuFormData] = useState({
    id: 0,
    name: '',
    displayName: '',
    route: '',
    icon: 'fa-folder',
    module: '',
    displayOrder: 1,
    isActive: true
  });

  // Tab 8: Reports State
  const [reportsData, setReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Toggle admin-body class on document.body for scoped admin styling
  useEffect(() => {
    document.body.classList.add('admin-body');
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, []);

  // Click outside listener to auto-close open mobile navigation & action menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.admin-navbar')) {
        setAdminMenuOpen(false);
      }
      if (!e.target.closest('.admin-card-menu-wrapper')) {
        setOpenFoodMenuId(null);
      }
      if (!e.target.closest('.admin-menu-master-action-wrapper')) {
        setOpenMenuMasterActionId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const userRole = (user?.role || localStorage.getItem('userRole') || 'User').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager';
  // Unified Menu Master access check: Admin has universal access,
  // otherwise access is strictly governed by user's enabled menus in Menu Master
  const checkAccess = (moduleName) => {
    if (!moduleName) return false;
    if (isAdmin) return true;
    if (hasMenuAccess(moduleName)) return true;
    const roleKey = user?.role || userRole;
    const assignments = roleMenuMatrix[roleKey];
    if (Array.isArray(assignments)) {
      const match = assignments.find(m => 
        (m.module && m.module.toLowerCase() === moduleName.toLowerCase()) ||
        (m.menuName && m.menuName.toLowerCase() === moduleName.toLowerCase()) ||
        (m.displayName && m.displayName.toLowerCase() === moduleName.toLowerCase())
      );
      if (match) return match.canView;
    }
    return false;
  };

  // Dynamic fine-grained permission flags driven by database and Menu Master
  const canAccessDashboard = checkAccess('Dashboard');
  const canViewRooms = checkAccess('Rooms');
  const canManageRooms = checkAccess('Rooms');
  const canDeleteRooms = (hasPermission('Room.Delete') || isAdmin || isManager) && checkAccess('Rooms');
  const canExportReports = checkAccess('Reports');
  const canManageUsers = checkAccess('Users');
  const canManageRoles = checkAccess('Permissions') || (isAdmin && checkAccess('MenuMaster'));
  const canManageMenuMaster = checkAccess('MenuMaster');
  const canViewFood = checkAccess('Menu');
  const canManageFood = checkAccess('Menu');
  const canDeleteFood = (hasPermission('Menu.Delete') || isAdmin || isManager) && checkAccess('Menu');

  const isStaffOrAdmin = (role) => {
    if (!role) return false;
    const r = role.toLowerCase();
    return r === 'admin' || r === 'manager' || r === 'staff';
  };

  // Check Admin / Staff Authorization
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isStaffOrAdmin(user.role)) {
        navigate('/login');
      }
    }
  }, [user, authLoading, navigate]);

  const loadRolePermissions = async () => {
    if (rolePermsLoadingRef.current) return;
    rolePermsLoadingRef.current = true;
    setRolePermsLoading(true);
    try {
      const res = await fetch('/api/admin/roles/permissions');
      if (res.ok) {
        const data = await res.json();
        setRolePermissionsMatrix(data.roles || {});
        setAllPermissionsList(data.permissions || []);
        rolePermsLoadedRef.current = true;
        if (data.roles && data.roles[selectedRoleForPerms]) {
          setSelectedRolePerms(data.roles[selectedRoleForPerms]);
        }
      }
    } catch (err) {
      console.error('Failed to load role permissions matrix:', err);
    } finally {
      rolePermsLoadingRef.current = false;
      setRolePermsLoading(false);
    }
  };

  const handleRoleSelectionChange = (roleName) => {
    setSelectedRoleForPerms(roleName);
    if (rolePermissionsMatrix[roleName]) {
      setSelectedRolePerms([...rolePermissionsMatrix[roleName]]);
    } else {
      setSelectedRolePerms([]);
    }
    setRolePermsMessage('');
  };

  const togglePermissionForSelectedRole = (permName) => {
    if (selectedRoleForPerms === 'Admin') return; // Admin possesses universal access
    setSelectedRolePerms((prev) => {
      if (prev.includes(permName)) {
        return prev.filter((p) => p !== permName);
      } else {
        return [...prev, permName];
      }
    });
  };

  const toggleCategoryPermissions = (categoryPerms) => {
    if (selectedRoleForPerms === 'Admin') return;
    const catPermNames = categoryPerms.map((p) => p.name);
    const allSelected = catPermNames.every((pName) => selectedRolePerms.includes(pName));

    if (allSelected) {
      // Deselect all in category
      setSelectedRolePerms((prev) => prev.filter((pName) => !catPermNames.includes(pName)));
    } else {
      // Select all in category
      setSelectedRolePerms((prev) => Array.from(new Set([...prev, ...catPermNames])));
    }
  };

  const saveRolePermissions = async () => {
    setRolePermsSaving(true);
    setRolePermsMessage('');
    try {
      const res = await fetch(`/api/admin/roles/${selectedRoleForPerms}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: selectedRolePerms })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update permissions');
      
      setRolePermsMessage(`✅ Permissions for role '${selectedRoleForPerms}' successfully persisted to PostgreSQL.`);
      
      setRolePermissionsMatrix((prev) => ({
        ...prev,
        [selectedRoleForPerms]: selectedRolePerms
      }));

      // Only refresh logged-in user permissions if the edited role affects the current user
      if (userRole === selectedRoleForPerms.toLowerCase()) {
        await refreshPermissions();
      }
      setTimeout(() => setRolePermsMessage(''), 6000);
    } catch (err) {
      setRolePermsMessage(`❌ ${err.message || 'Error updating permissions.'}`);
    } finally {
      setRolePermsSaving(false);
    }
  };

  const loadMenuMasterData = async (silent = false) => {
    if (menuMasterLoadingRef.current) return;
    menuMasterLoadingRef.current = true;
    if (!silent) setMenuMasterLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/menu-master/matrix', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        
        // Handle both clean dictionary { roles: { Admin: [...] } } and nested { roles: { roles: [...] } }
        let rawMatrix = {};
        if (data && data.roles) {
          if (data.roles.roles && typeof data.roles.roles === 'object') {
            rawMatrix = data.roles.roles;
          } else if (typeof data.roles === 'object' && !Array.isArray(data.roles)) {
            rawMatrix = data.roles;
          }
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          rawMatrix = data;
        }

        // Extract complete menus list
        let allMenus = [];
        if (Array.isArray(data.allMenus)) {
          allMenus = data.allMenus;
        } else if (data.roles && Array.isArray(data.roles.allMenus)) {
          allMenus = data.roles.allMenus;
        } else if (Array.isArray(rawMatrix['Admin'])) {
          allMenus = rawMatrix['Admin'];
        }

        setRoleMenuMatrix(rawMatrix);
        setAllMenusList(allMenus);
        menuMasterLoadedRef.current = true;

        // Update selected role assignments
        const targetRole = selectedRoleForMenuMaster || 'User';
        if (rawMatrix[targetRole] && rawMatrix[targetRole].length > 0) {
          setSelectedRoleMenuAssignments([...rawMatrix[targetRole]]);
        } else if (rawMatrix['Staff'] && rawMatrix['Staff'].length > 0) {
          setSelectedRoleMenuAssignments([...rawMatrix['Staff']]);
        } else if (allMenus.length > 0) {
          setSelectedRoleMenuAssignments(allMenus.map(m => ({
            menuId: m.id || m.menuId,
            menuName: m.name || m.menuName,
            displayName: m.displayName || m.name || m.menuName,
            module: m.module,
            route: m.route,
            icon: m.icon,
            displayOrder: m.displayOrder || 1,
            canView: targetRole === 'Admin'
          })));
        }
      }
    } catch (err) {
      console.error('Failed to load menu master matrix:', err);
    } finally {
      menuMasterLoadingRef.current = false;
      if (!silent) setMenuMasterLoading(false);
    }
  };

  const handleRoleSelectionForMenuMaster = (roleName) => {
    setSelectedRoleForMenuMaster(roleName);
    if (roleMenuMatrix[roleName] && roleMenuMatrix[roleName].length > 0) {
      setSelectedRoleMenuAssignments([...roleMenuMatrix[roleName]]);
    } else if (allMenusList && allMenusList.length > 0) {
      const defaults = allMenusList.map(m => ({
        menuId: m.id || m.menuId,
        menuName: m.name || m.menuName,
        displayName: m.displayName || m.name || m.menuName,
        module: m.module,
        route: m.route,
        icon: m.icon,
        displayOrder: m.displayOrder || 1,
        canView: roleName === 'Admin'
      }));
      setSelectedRoleMenuAssignments(defaults);
    } else {
      setSelectedRoleMenuAssignments([]);
    }
    setMenuMasterMessage('');
  };

  const toggleMenuAccessForRole = (menuId) => {
    if (selectedRoleForMenuMaster === 'Admin') return; // Admin has universal access
    setSelectedRoleMenuAssignments(prev => {
      const updated = prev.map(m => {
        if (m.menuId === menuId) {
          return { ...m, canView: !m.canView };
        }
        return m;
      });
      // Reactively sync roleMenuMatrix count and state in-memory
      setRoleMenuMatrix(current => ({
        ...current,
        [selectedRoleForMenuMaster]: updated
      }));
      return updated;
    });
  };

  const saveRoleMenuAccess = async () => {
    setMenuMasterSaving(true);
    setMenuMasterMessage('');
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/menu-master/roles/${selectedRoleForMenuMaster}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ menus: selectedRoleMenuAssignments })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update menu access');

      setMenuMasterMessage(`✅ Menu access for role '${selectedRoleForMenuMaster}' successfully persisted to PostgreSQL.`);
      
      // Update local roleMenuMatrix state immediately
      setRoleMenuMatrix(prev => ({
        ...prev,
        [selectedRoleForMenuMaster]: [...selectedRoleMenuAssignments]
      }));

      // Immediately sync current user's navigation menus if their role was updated
      if (userRole === selectedRoleForMenuMaster.toLowerCase()) {
        await refreshUserMenus();
      }

      setTimeout(() => setMenuMasterMessage(''), 6000);
    } catch (err) {
      setMenuMasterMessage(`❌ ${err.message || 'Error updating menu access.'}`);
    } finally {
      setMenuMasterSaving(false);
    }
  };

  const handleOpenEditMenuModal = (assignment) => {
    const fullMenu = allMenusList.find(m => m.id === assignment.menuId) || {};
    setEditMenuFormData({
      id: assignment.menuId,
      name: fullMenu.name || assignment.menuName || '',
      displayName: fullMenu.displayName || assignment.displayName || assignment.menuName || '',
      route: fullMenu.route || assignment.route || '',
      icon: fullMenu.icon || assignment.icon || 'fa-folder',
      module: fullMenu.module || assignment.module || '',
      displayOrder: fullMenu.displayOrder !== undefined ? fullMenu.displayOrder : (assignment.displayOrder || 1),
      isActive: fullMenu.isActive !== undefined ? fullMenu.isActive : true
    });
    setShowEditMenuModal(true);
  };

  const handleSaveEditMenu = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editMenuFormData.id) return;

    setMenuMasterSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const updatedPayload = {
        name: editMenuFormData.name,
        displayName: editMenuFormData.displayName,
        route: editMenuFormData.route,
        icon: editMenuFormData.icon,
        module: editMenuFormData.module,
        displayOrder: parseInt(editMenuFormData.displayOrder, 10) || 1,
        isActive: editMenuFormData.isActive
      };

      const res = await fetch(`/api/admin/menu-master/${editMenuFormData.id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(updatedPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update menu settings');

      // 1. Immediately update allMenusList state
      setAllMenusList(prev => prev.map(m => m.id === editMenuFormData.id ? { ...m, ...updatedPayload } : m));

      // 2. Immediately update selectedRoleMenuAssignments state
      setSelectedRoleMenuAssignments(prev => prev.map(m => m.menuId === editMenuFormData.id ? {
        ...m,
        menuName: updatedPayload.name,
        displayName: updatedPayload.displayName,
        route: updatedPayload.route,
        icon: updatedPayload.icon,
        module: updatedPayload.module,
        displayOrder: updatedPayload.displayOrder
      } : m));

      // 3. Immediately update roleMenuMatrix state
      setRoleMenuMatrix(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(r => {
          next[r] = (next[r] || []).map(m => m.menuId === editMenuFormData.id ? {
            ...m,
            menuName: updatedPayload.name,
            displayName: updatedPayload.displayName,
            route: updatedPayload.route,
            icon: updatedPayload.icon,
            module: updatedPayload.module,
            displayOrder: updatedPayload.displayOrder
          } : m);
        });
        return next;
      });

      // 4. Immediately update userMenus in AuthContext so sidebar reflects changes with zero hard refresh
      if (typeof setUserMenus === 'function') {
        setUserMenus(prev => (prev || []).map(m => (m.id === editMenuFormData.id || m.name === updatedPayload.name) ? { ...m, ...updatedPayload } : m));
      }

      setShowEditMenuModal(false);
      setMenuMasterMessage(`✅ Settings for menu '${editMenuFormData.displayName}' successfully saved.`);
      setTimeout(() => setMenuMasterMessage(''), 6000);
    } catch (err) {
      alert(`Error updating menu settings: ${err.message}`);
    } finally {
      setMenuMasterSaving(false);
    }
  };

  const handleCreateMenu = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/menu-master', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(menuFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create menu');

      setShowAddMenuModal(false);
      setMenuFormData({
        name: '',
        displayName: '',
        route: '',
        icon: 'fa-folder',
        module: '',
        displayOrder: (allMenusList.length || 0) + 1,
        isActive: true
      });
      await loadMenuMasterData(true);
      await refreshUserMenus();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const loadReportsData = async () => {
    if (reportsLoadingRef.current) return;
    reportsLoadingRef.current = true;
    setReportsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/admin/reports', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setReportsData(data);
        reportsLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      reportsLoadingRef.current = false;
      setReportsLoading(false);
    }
  };

  // Load Dashboard Data
  const loadDashboard = async () => {
    if (dashboardLoadingRef.current) return;
    dashboardLoadingRef.current = true;
    setDashboardLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/admin/dashboard', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data.stats);
        setRecentBookings(data.recentBookings || []);
        setRecentUsers(data.recentUsers || []);
        dashboardLoadedRef.current = true;
      }
    } catch (err) {
      console.warn('Dashboard load note:', err);
    } finally {
      dashboardLoadingRef.current = false;
      setDashboardLoading(false);
    }
  };

  // Load Rooms Data
  const loadRooms = async () => {
    if (roomsLoadingRef.current) return;
    roomsLoadingRef.current = true;
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRoomsData(data);
          roomsLoadedRef.current = true;
          applyRoomFilters(data, roomsSearchNum, roomsSearchType, roomsSearchStatus);
        } else {
          // If database is empty, display from React rooms catalog and persist to PostgreSQL
          const defaultCatalog = getRoomsCatalog();
          setRoomsData(defaultCatalog);
          roomsLoadedRef.current = true;
          applyRoomFilters(defaultCatalog, roomsSearchNum, roomsSearchType, roomsSearchStatus);
          syncRoomsToDb(defaultCatalog);
        }
      } else {
        const defaultCatalog = getRoomsCatalog();
        setRoomsData(defaultCatalog);
        roomsLoadedRef.current = true;
        applyRoomFilters(defaultCatalog, roomsSearchNum, roomsSearchType, roomsSearchStatus);
      }
    } catch (err) {
      console.warn('Rooms load note:', err);
      const defaultCatalog = getRoomsCatalog();
      setRoomsData(defaultCatalog);
      roomsLoadedRef.current = true;
      applyRoomFilters(defaultCatalog, roomsSearchNum, roomsSearchType, roomsSearchStatus);
    } finally {
      roomsLoadingRef.current = false;
    }
  };

  // Manual Trigger to Synchronize React Rooms Catalog into Database
  const handleSyncRoomsToDb = async () => {
    const catalog = getRoomsCatalog();
    const result = await syncRoomsToDb(catalog);
    if (result.success) {
      alert(`✅ Successfully synchronized ${result.data?.added || 0} new and updated ${result.data?.updated || 0} rooms to the database!`);
      await loadRooms();
    } else {
      alert(`⚠️ Sync notice: ${result.error || 'Check console for details.'}`);
    }
  };

  const loadDeletedRooms = async () => {
    try {
      const res = await fetch('/api/admin/rooms/deleted');
      if (res.ok) {
        const data = await res.json();
        setDeletedRooms(data);
      }
    } catch (err) {
      console.warn('Deleted rooms load note:', err);
    }
  };

  // Apply Rooms Filters
  const applyRoomFilters = (data, searchNum, searchType, searchStatus) => {
    let filtered = [...data];
    if (searchNum && searchNum.trim()) {
      const q = searchNum.trim().toLowerCase();
      filtered = filtered.filter((r) =>
        String(r.roomNumber || r.RoomNumber || '').toLowerCase().includes(q) ||
        String(r.subType || r.SubType || '').toLowerCase().includes(q) ||
        String(r.roomType || r.RoomType || '').toLowerCase().includes(q) ||
        String(r.facility1 || r.Facility1 || '').toLowerCase().includes(q)
      );
    }
    if (searchType === 'Top Tier') {
      const topTierNumbers = Array.from({ length: 27 }, (_, i) => String(i + 1));
      filtered = filtered.filter((r) => topTierNumbers.includes(String(r.roomNumber || r.RoomNumber)) || (String(r.images || r.Images || '').includes(',')));
    } else if (searchType === 'Suites') {
      const topTierNumbers = Array.from({ length: 27 }, (_, i) => String(i + 1));
      filtered = filtered.filter((r) => !topTierNumbers.includes(String(r.roomNumber || r.RoomNumber)));
    } else if (searchType !== 'All') {
      filtered = filtered.filter((r) => String(r.roomType || r.RoomType).toLowerCase().includes(searchType.toLowerCase()));
    }
    if (searchStatus !== 'All') {
      filtered = filtered.filter((r) => (r.status || r.Status) === searchStatus);
    }
    setRoomsFiltered(filtered);
    setRoomsPage(1);
  };

  useEffect(() => {
    applyRoomFilters(roomsData, roomsSearchNum, roomsSearchType, roomsSearchStatus);
  }, [roomsSearchNum, roomsSearchType, roomsSearchStatus, roomsData]);

  // Load Bookings Data
  const loadBookings = async () => {
    if (bookingsLoadingRef.current) return;
    bookingsLoadingRef.current = true;
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookingsData(data);
        bookingsLoadedRef.current = true;
        applyBookingFilters(data, bookingsSearch, bookingsFilterStatus);
      }
    } catch (err) {
      console.warn('Bookings load note:', err);
    } finally {
      bookingsLoadingRef.current = false;
    }
  };

  const applyBookingFilters = (data, search, status) => {
    let filtered = [...data];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (b) =>
          String(b.bookingId || b.BookingId).includes(q) ||
          ((b.guestName || '').toLowerCase().includes(q)) ||
          ((b.userEmail || b.user?.email || '').toLowerCase().includes(q)) ||
          ((b.roomNumber || b.room?.roomNumber || '').toLowerCase().includes(q)) ||
          ((b.roomType || b.room?.roomType || '').toLowerCase().includes(q))
      );
    }
    if (status !== 'All') {
      filtered = filtered.filter((b) => (b.bookingStatus || b.BookingStatus) === status);
    }
    setBookingsFiltered(filtered);
    setBookingsPage(1);
  };

  useEffect(() => {
    applyBookingFilters(bookingsData, bookingsSearch, bookingsFilterStatus);
  }, [bookingsSearch, bookingsFilterStatus, bookingsData]);

  // Load Users Data
  const loadUsers = async () => {
    if (usersLoadingRef.current) return;
    usersLoadingRef.current = true;
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/admin/users', { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setUsersData(list);
        usersLoadedRef.current = true;
        applyUserFilters(list, usersSearch, usersFilterRole, usersFilterStatus);
      } else {
        console.warn('Failed to fetch users, HTTP status:', res.status);
      }
    } catch (err) {
      console.warn('Users load note:', err);
    } finally {
      usersLoadingRef.current = false;
      setUsersLoading(false);
    }
  };

  const applyUserFilters = (data, search, role, status = 'All') => {
    let filtered = Array.isArray(data) ? [...data] : [];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (u) =>
          ((u.name || u.Name || '').toLowerCase().includes(q)) ||
          ((u.email || u.Email || '').toLowerCase().includes(q)) ||
          ((u.phone || u.Phone || '').includes(q))
      );
    }
    if (role && role !== 'All') {
      filtered = filtered.filter((u) => (u.role || u.Role || '').toLowerCase() === role.toLowerCase());
    }
    if (status && status !== 'All') {
      const wantActive = status === 'Active';
      filtered = filtered.filter((u) => {
        const isActive = u.isActive !== undefined ? u.isActive : (u.IsActive !== undefined ? u.IsActive : true);
        return isActive === wantActive;
      });
    }
    setUsersFiltered(filtered);
    setUsersPage(1);
  };

  useEffect(() => {
    applyUserFilters(usersData, usersSearch, usersFilterRole, usersFilterStatus);
  }, [usersSearch, usersFilterRole, usersFilterStatus, usersData]);

  // Load Food Menu
  const loadFoodMenu = async () => {
    if (foodLoadingRef.current) return;
    foodLoadingRef.current = true;
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((d) => ({
            id: d.id || d.Id,
            name: d.name || d.Name,
            category: d.category || d.Category,
            price: d.price || d.Price,
            diet: d.dietType || d.DietType || 'Veg',
            tag: d.tag || d.Tag,
            desc: d.description || d.Description,
            image: d.imageUrl || d.ImageUrl || 'images/food/paneer-butter-masala.jpg'
          }));
          setFoodData(formatted);
          foodLoadedRef.current = true;
          saveFoodCatalog(formatted);
          applyFoodFilters(formatted, foodCategoryFilter);
          return;
        }
      }
    } catch (e) {
      console.warn('Food menu load note:', e);
    } finally {
      foodLoadingRef.current = false;
    }
    const localCatalog = getFoodCatalog();
    setFoodData(localCatalog);
    foodLoadedRef.current = true;
    applyFoodFilters(localCatalog, foodCategoryFilter);
    // Persist React food catalog into database
    syncFoodCatalogToDb(localCatalog);
  };

  // Manual Trigger to Synchronize React Food Catalog into Database
  const handleSyncFoodToDb = async () => {
    const catalog = getFoodCatalog();
    const result = await syncFoodCatalogToDb(catalog);
    if (result.success) {
      alert(`✅ Successfully synchronized ${result.data?.added || 0} new and updated ${result.data?.updated || 0} dishes to the database!`);
      await loadFoodMenu();
    } else {
      alert(`⚠️ Sync notice: ${result.error || 'Check console for details.'}`);
    }
  };

  const applyFoodFilters = (data, cat, search = '') => {
    let filtered = [...data];
    if (cat && cat !== 'All') {
      filtered = filtered.filter((f) => f.category && f.category.toLowerCase().includes(cat.toLowerCase()));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((f) =>
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.desc && f.desc.toLowerCase().includes(q)) ||
        (f.tag && f.tag.toLowerCase().includes(q)) ||
        (f.category && f.category.toLowerCase().includes(q)) ||
        (f.diet && f.diet.toLowerCase().includes(q))
      );
    }
    setFoodFiltered(filtered);
    setFoodPage(1);
  };

  useEffect(() => {
    applyFoodFilters(foodData, foodCategoryFilter, foodSearch);
  }, [foodCategoryFilter, foodSearch, foodData]);

  // Unified On-Demand Tab Data Loader (Strict lazy-loading: loads only when tab is accessed and not yet in memory cache)
  const loadTabData = async (tab, force = false) => {
    if (!tab) return;
    if (tab === 'dashboard') {
      if (force || !dashboardLoadedRef.current) await loadDashboard();
      if (force || !roomsLoadedRef.current) loadRooms();
      if (force || !bookingsLoadedRef.current) loadBookings();
      if (canManageUsers && (force || !usersLoadedRef.current)) loadUsers();
    } else if (tab === 'rooms') {
      if (force || !roomsLoadedRef.current) {
        await loadRooms();
        if (canDeleteRooms) loadDeletedRooms();
      }
    } else if (tab === 'bookings') {
      if (force || !bookingsLoadedRef.current) await loadBookings();
    } else if (tab === 'users') {
      if (force || !usersLoadedRef.current) await loadUsers();
    } else if (tab === 'food') {
      if (force || !foodLoadedRef.current) await loadFoodMenu();
    } else if (tab === 'permissions') {
      if (force || !rolePermsLoadedRef.current) await loadRolePermissions();
    } else if (tab === 'menu-master') {
      if (force || !menuMasterLoadedRef.current) await loadMenuMasterData();
    } else if (tab === 'reports') {
      if (force || !reportsLoadedRef.current) await loadReportsData();
    }
  };

  const switchTab = (tab) => {
    if (tab === 'rooms' && !checkAccess('Rooms')) {
      alert('🔒 Access Denied: Room module access is restricted in Menu Master.');
      return;
    }
    if (tab === 'bookings' && !checkAccess('Bookings')) {
      alert('🔒 Access Denied: Bookings module access is restricted in Menu Master.');
      return;
    }
    if (tab === 'users' && !checkAccess('Users')) {
      alert('🔒 Access Denied: User Accounts module is restricted in Menu Master.');
      return;
    }
    if (tab === 'permissions' && !checkAccess('Permissions') && !isAdmin) {
      alert('🔒 Access Denied: Role & Permission configuration is restricted in Menu Master.');
      return;
    }
    if (tab === 'menu-master' && !checkAccess('MenuMaster')) {
      alert('🔒 Access Denied: Menu Master administration is restricted in Menu Master.');
      return;
    }
    if (tab === 'reports' && !checkAccess('Reports')) {
      alert('🔒 Access Denied: Reports & Analytics module is restricted in Menu Master.');
      return;
    }
    if (tab === 'food' && !checkAccess('Menu')) {
      alert('🔒 Access Denied: Gastronomy Menu access is restricted in Menu Master.');
      return;
    }

    if (window.location.hash === `#${tab}`) {
      setActiveTab(tab);
      loadTabData(tab, false);
    } else {
      window.location.hash = `#${tab}`;
    }
  };

  // Sync tab with URL hash with dynamic Menu Master permission boundaries
  useEffect(() => {
    if (!user || !isStaffOrAdmin(user?.role)) return;
    const rawHash = (location.hash || '').replace('#', '').toLowerCase();
    const validTabs = ['dashboard', 'rooms', 'bookings', 'users', 'food', 'permissions', 'menu-master', 'reports'];
    const tabToUse = validTabs.includes(rawHash) ? rawHash : 'dashboard';

    let targetTab = tabToUse;
    if (tabToUse === 'users' && !checkAccess('Users')) targetTab = 'dashboard';
    else if (tabToUse === 'permissions' && !checkAccess('Permissions') && !isAdmin) targetTab = 'dashboard';
    else if (tabToUse === 'menu-master' && !checkAccess('MenuMaster')) targetTab = 'dashboard';
    else if (tabToUse === 'reports' && !checkAccess('Reports')) targetTab = 'dashboard';
    else if (tabToUse === 'rooms' && !checkAccess('Rooms')) targetTab = 'dashboard';
    else if (tabToUse === 'bookings' && !checkAccess('Bookings')) targetTab = 'dashboard';
    else if (tabToUse === 'food' && !checkAccess('Menu')) targetTab = 'dashboard';

    setActiveTab(targetTab);
    loadTabData(targetTab, false);
  }, [location.hash, user?.role]);

  // === PHOTO UPLOAD HANDLERS ===
  const handleRoomPhotosUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files || files.length === 0) return;

    let processed = 0;
    const newImgs = [];

    files.forEach((file) => {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
        alert(`File "${file.name}" must be a .jpg, .jpeg, or .png image.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        newImgs.push(ev.target.result);
        processed++;
        if (processed === files.length) {
          setRoomForm((prev) => {
            const currentList = prev.images ? prev.images.split(',').map((s) => s.trim()).filter(Boolean) : [];
            return {
              ...prev,
              images: [...currentList, ...newImgs].join(', ')
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveRoomImage = (indexToRemove) => {
    setRoomForm((prev) => {
      const list = prev.images ? prev.images.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const updated = list.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, images: updated.join(', ') };
    });
  };

  const handleFoodPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      alert('Please select a valid .jpg, .jpeg, or .png image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFoodForm((prev) => ({
        ...prev,
        image: ev.target.result
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // === ROOM ACTIONS ===
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      roomNumber: '',
      roomType: 'Deluxe Room',
      subType: 'Deluxe Courtyard Sanctuary',
      price: '',
      capacity: 2,
      status: 'Available',
      description: '',
      images: '',
      facility1: 'High-Speed Wi-Fi 6',
      facility2: '55" 4K Smart TV',
      facility3: 'Climate Air Conditioning',
      facility4: '24/7 Room Service',
      facility5: 'Valet & Monitored Parking'
    });
    setShowAddRoomModal(true);
  };

  const handleSaveAddRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: roomForm.roomNumber,
          roomType: roomForm.roomType,
          subType: roomForm.subType,
          price: parseFloat(roomForm.price),
          capacity: parseInt(roomForm.capacity) || 2,
          status: roomForm.status,
          description: roomForm.description,
          images: roomForm.images,
          facility1: roomForm.facility1,
          facility2: roomForm.facility2,
          facility3: roomForm.facility3,
          facility4: roomForm.facility4,
          facility5: roomForm.facility5
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add room.');
      }

      alert('Suite added successfully!');
      setShowAddRoomModal(false);
      loadRooms();
      loadDashboard();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleOpenEditRoom = (room) => {
    if (!room) return;
    setEditingRoom(room);
    const rType = room.roomType || room.RoomType || 'Deluxe Room';
    const rNum = room.roomNumber || room.RoomNumber || '';
    const meta = getRoomMeta(rType, rNum, room) || {};
    const facilities = Array.isArray(meta.facilities) ? meta.facilities : [];
    setRoomForm({
      roomNumber: rNum,
      roomType: rType,
      subType: room.subType || room.SubType || meta.subType || 'Deluxe Courtyard Sanctuary',
      price: room.price ?? room.Price ?? '',
      capacity: room.capacity || room.Capacity || 2,
      status: room.status || room.Status || 'Available',
      description: room.description || room.Description || '',
      images: room.images || room.Images || '',
      facility1: room.facility1 || room.Facility1 || facilities[0] || 'High-Speed Wi-Fi 6',
      facility2: room.facility2 || room.Facility2 || facilities[1] || '55" 4K Smart TV',
      facility3: room.facility3 || room.Facility3 || facilities[2] || 'Climate Air Conditioning',
      facility4: room.facility4 || room.Facility4 || facilities[3] || '24/7 Room Service',
      facility5: room.facility5 || room.Facility5 || facilities[4] || 'Valet & Monitored Parking'
    });
    setShowEditRoomModal(true);
  };

  const handleSaveEditRoom = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;
    const rId = editingRoom.roomId || editingRoom.RoomId;

    try {
      const res = await fetch(`/api/rooms/${rId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: roomForm.roomNumber,
          roomType: roomForm.roomType,
          subType: roomForm.subType,
          price: parseFloat(roomForm.price),
          capacity: parseInt(roomForm.capacity) || 2,
          status: roomForm.status,
          description: roomForm.description,
          images: roomForm.images,
          facility1: roomForm.facility1,
          facility2: roomForm.facility2,
          facility3: roomForm.facility3,
          facility4: roomForm.facility4,
          facility5: roomForm.facility5
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update suite.');
      }

      alert('Suite updated successfully!');
      setShowEditRoomModal(false);
      setEditingRoom(null);
      loadRooms();
      loadDashboard();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you wish to delete Room #${roomNumber}? It will be moved to the archive.`)) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete room.');
      }

      alert(`Room #${roomNumber} archived successfully.`);
      loadRooms();
      loadDeletedRooms();
      loadDashboard();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRestoreRoom = async (roomId, roomNumber) => {
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}/restore`, { method: 'PUT' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to restore room.');
      }

      alert(`Room #${roomNumber} restored successfully.`);
      loadRooms();
      loadDeletedRooms();
      loadDashboard();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePermanentDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you wish to PERMANENTLY delete Room #${roomNumber}? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/rooms/${roomId}/permanent`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to permanently delete room.');
      }

      alert(`Room #${roomNumber} permanently deleted.`);
      loadRooms();
      loadDeletedRooms();
      loadDashboard();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // === BOOKING ACTIONS ===
  const handleExportExcel = async () => {
    try {
      const list = bookingsData.length > 0 ? bookingsData : await (async () => {
        const res = await fetch('/api/admin/bookings');
        return res.ok ? await res.json() : [];
      })();

      if (!list || list.length === 0) {
        alert('No bookings available to export.');
        return;
      }

      const headers = [
        'Booking ID',
        'Guest Name',
        'Email',
        'Phone',
        'Room Number',
        'Suite Type',
        'Package',
        'Check-In Date',
        'Check-Out Date',
        'Guests',
        'Total Amount (INR)',
        'Reservation Status',
        'Payment Status',
        'Transaction ID',
        'Booking Date'
      ];

      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = list.map((b) => {
        const id = b.bookingId || b.BookingId;
        const guest = b.guestName || b.GuestName || b.user?.name || b.User?.Name || 'Guest';
        const email = b.user?.email || b.User?.Email || b.email || b.Email || '';
        const phone = b.user?.phone || b.User?.Phone || b.phone || b.Phone || '';
        const roomNum = b.room?.roomNumber || b.Room?.RoomNumber || b.roomNumber || b.RoomNumber || '';
        const roomType = b.room?.roomType || b.Room?.RoomType || b.roomType || b.RoomType || '';
        const pkg = b.package || b.Package || 'Stay';
        const checkIn = b.checkIn ? new Date(b.checkIn).toISOString().split('T')[0] : '';
        const checkOut = b.checkOut ? new Date(b.checkOut).toISOString().split('T')[0] : '';
        const guests = b.numberOfGuests || b.NumberOfGuests || 1;
        const total = Number(b.totalAmount || b.TotalAmount || 0).toFixed(2);
        const status = b.bookingStatus || b.BookingStatus || 'Pending';
        const payStatus = b.paymentStatus || b.PaymentStatus || 'Pending';
        const txn = b.transactionId || b.TransactionId || 'N/A';
        const created = b.createdAt ? new Date(b.createdAt).toISOString().replace('T', ' ').slice(0, 19) : '';

        return [
          id,
          escape(guest),
          escape(email),
          escape(phone),
          escape(roomNum),
          escape(roomType),
          escape(pkg),
          escape(checkIn),
          escape(checkOut),
          guests,
          total,
          escape(status),
          escape(payStatus),
          escape(txn),
          escape(created)
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AnsuKumarHotels_Reservations_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleOpenUpdateStatus = (booking) => {
    setSelectedBookingForStatus(booking);
    setUpdateStatusForm({
      status: booking.bookingStatus || 'Confirmed',
      paymentStatus: booking.paymentStatus || 'Paid',
      paymentMethod: booking.transactionId || booking.TransactionId || 'Cash'
    });
  };

  const handleSaveUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedBookingForStatus) return;
    const bId = selectedBookingForStatus.bookingId || selectedBookingForStatus.BookingId;

    try {
      const res = await fetch(`/api/admin/bookings/${bId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatusForm.status,
          paymentStatus: updateStatusForm.paymentStatus,
          paymentMethod: updateStatusForm.paymentMethod
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Status update failed.');
      }

      alert(`Booking #${bId} status updated successfully.`);
      setSelectedBookingForStatus(null);
      loadBookings();
      loadRooms();
      loadDashboard();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you wish to cancel Booking #${bookingId}?`)) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'PUT' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Cancellation failed.');
      }

      alert(`Booking #${bookingId} cancelled.`);
      loadBookings();
      loadRooms();
      loadDashboard();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // === USER ACTIONS ===
  const handleToggleUserActive = async (userId, currentlyActive) => {
    const actionName = currentlyActive ? 'deactivate' : 'activate';
    const endpoint = currentlyActive ? `/api/admin/users/${userId}/deactivate` : `/api/admin/users/${userId}/activate`;
    try {
      const res = await fetch(endpoint, { method: 'PUT' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Failed to ${actionName} user.`);
      }

      await loadUsers();
      await loadDashboard();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleOpenEditUser = (u) => {
    if (!u) return;
    setEditingUser(u);
    const activeVal = u.isActive !== undefined ? u.isActive : (u.IsActive !== undefined ? u.IsActive : true);
    setUserForm({
      name: u.name || u.Name || '',
      phone: u.phone || u.Phone || '',
      role: u.role || u.Role || 'User',
      isActive: activeVal === true || activeVal === 'true'
    });
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const uId = editingUser.id || editingUser.userId || editingUser.UserId;

    try {
      const res = await fetch(`/api/admin/users/${uId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userForm.name.trim(),
          phone: userForm.phone ? userForm.phone.trim() : null,
          role: userForm.role,
          isActive: userForm.isActive === true || userForm.isActive === 'true'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update user.');
      }

      alert('User details updated successfully.');
      setEditingUser(null);
      await loadUsers();
      await loadDashboard();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // === FOOD ACTIONS ===
  const handleOpenAddFood = () => {
    setFoodForm({
      name: '',
      category: 'Vegetarian',
      price: '',
      diet: 'Veg',
      tag: '',
      desc: '',
      image: ''
    });
    setEditingFood(null);
    setShowAddFoodModal(true);
  };

  const handleOpenEditFood = (item) => {
    setEditingFood(item);
    setFoodForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      diet: item.diet || 'Veg',
      tag: item.tag || '',
      desc: item.desc || '',
      image: item.image || ''
    });
    setShowAddFoodModal(true);
  };

  const handleSaveAddFood = (e) => {
    e.preventDefault();
    if (!foodForm.name || !foodForm.price) {
      alert('Please fill in dish name and price.');
      return;
    }

    const defaultImg = foodForm.category === 'Vegetarian'
      ? 'images/food/paneer-butter-masala.jpg'
      : foodForm.category === 'Non-Vegetarian'
        ? 'images/food/butter-chicken.jpg'
        : 'images/food/gulab-jamun.jpg';

    if (editingFood) {
      const updated = foodData.map((f) =>
        f.name === editingFood.name
          ? {
              ...f,
              name: foodForm.name.trim(),
              category: foodForm.category,
              price: parseFloat(foodForm.price) || 0,
              diet: foodForm.diet || (foodForm.category === 'Vegetarian' ? 'Veg' : foodForm.category === 'Non-Vegetarian' ? 'Non-Veg' : 'Sweet'),
              tag: foodForm.tag ? foodForm.tag.trim() : null,
              desc: foodForm.desc ? foodForm.desc.trim() : '',
              image: foodForm.image ? foodForm.image.trim() : f.image
            }
          : f
      );
      setFoodData(updated);
      saveFoodCatalog(updated);
      applyFoodFilters(updated, foodCategoryFilter, foodSearch);
      setShowAddFoodModal(false);
      setEditingFood(null);
      setFoodForm({
        name: '',
        category: 'Vegetarian',
        price: '',
        diet: 'Veg',
        tag: '',
        desc: '',
        image: ''
      });
      alert(`Dish "${foodForm.name}" updated successfully!`);
      return;
    }

    const newDish = {
      id: Date.now(),
      name: foodForm.name.trim(),
      category: foodForm.category,
      price: parseFloat(foodForm.price) || 0,
      diet: foodForm.diet || (foodForm.category === 'Vegetarian' ? 'Veg' : foodForm.category === 'Non-Vegetarian' ? 'Non-Veg' : 'Sweet'),
      tag: foodForm.tag ? foodForm.tag.trim() : null,
      desc: foodForm.desc ? foodForm.desc.trim() : '',
      image: foodForm.image ? foodForm.image.trim() : defaultImg
    };

    const updated = [newDish, ...foodData];
    setFoodData(updated);
    saveFoodCatalog(updated);
    applyFoodFilters(updated, foodCategoryFilter, foodSearch);
    setShowAddFoodModal(false);
    setFoodForm({
      name: '',
      category: 'Vegetarian',
      price: '',
      diet: 'Veg',
      tag: '',
      desc: '',
      image: ''
    });
    alert(`Gastronomy item "${newDish.name}" added to ${newDish.category} menu successfully!`);
  };

  const handleDeleteFood = (dishName) => {
    if (!window.confirm(`Are you sure you wish to remove "${dishName}" from the menu?`)) return;
    const item = foodData.find((f) => f.name === dishName);
    if (item) {
      setDeletedFood((prev) => [...prev, item]);
      const updated = foodData.filter((f) => f.name !== dishName);
      setFoodData(updated);
      saveFoodCatalog(updated);
      applyFoodFilters(updated, foodCategoryFilter);
    }
  };

  const handleRestoreFood = (dishName) => {
    const item = deletedFood.find((f) => f.name === dishName);
    if (item) {
      setDeletedFood((prev) => prev.filter((f) => f.name !== dishName));
      const updated = [item, ...foodData];
      setFoodData(updated);
      saveFoodCatalog(updated);
      applyFoodFilters(updated, foodCategoryFilter);
    }
  };

  // Helper Pagination Renderer
  const renderPagination = (totalItems, currentPage, setPageFn) => {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

    const pageButtons = [];
    for (let p = 1; p <= totalPages; p++) {
      pageButtons.push(
        <button
          key={p}
          className={`page-btn ${p === currentPage ? 'active' : ''}`}
          onClick={() => setPageFn(p)}
        >
          {p}
        </button>
      );
    }

    return (
      <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div className="pagination-info" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> records (Page {currentPage} of {totalPages})
        </div>
        <div className="pagination-controls" style={{ display: 'flex', gap: '4px' }}>
          <button
            className="page-btn"
            disabled={currentPage <= 1}
            onClick={() => setPageFn(currentPage - 1)}
          >
            ◀ Prev
          </button>
          {pageButtons}
          <button
            className="page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setPageFn(currentPage + 1)}
          >
            Next ▶ 
          </button>
        </div>
      </div>

    );
  };

  return (
    <div className="admin-body">
      {/* TOP ADMIN NAVBAR */}
      <header className="navbar admin-navbar">
        <div className="nav-container admin-nav-container">
          <div className="admin-nav-brand-group">
            <Link to="/admin" className="logo" onClick={() => setAdminMenuOpen(false)}>
              <i className="fa-solid fa-crown" style={{ color: 'var(--admin-accent-gold)', marginRight: '6px' }}></i>{' '}
              ANSU KUMAR <span>ADMIN</span>
            </Link>
            <span className="admin-nav-badge">
              {isAdmin ? 'Administrator Portal' : isManager ? 'Operations Manager Portal' : 'Front Desk Portal'}
            </span>
          </div>

          <button
            type="button"
            className={`admin-menu-toggle-btn ${adminMenuOpen ? 'active' : ''}`}
            onClick={() => setAdminMenuOpen(!adminMenuOpen)}
            aria-label="Toggle Admin Navigation & Settings Menu"
            title="Settings / Actions"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`admin-nav-actions-group ${adminMenuOpen ? 'active' : ''}`}>
            {/* Mobile Drawer Navigation Links (Mobile Only) */}
            <div className="admin-mobile-drawer-nav">
              <div className="admin-drawer-nav-label">Admin Navigation</div>
              <ul className="admin-drawer-menu-list">
                {userMenus && userMenus.length > 0 ? (
                  userMenus
                    .filter(m => m.isActive)
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map(m => {
                      const slug = m.route && m.route.includes('#') ? m.route.split('#')[1] : m.name.toLowerCase();
                      return (
                        <li key={'drawer-' + (m.id || m.name)}>
                          <a
                            href={`#${slug}`}
                            className={`admin-drawer-nav-item ${activeTab === slug ? 'active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              switchTab(slug);
                              setAdminMenuOpen(false);
                            }}
                          >
                            <i className={`fa-solid ${m.icon || 'fa-folder'}`}></i> <span>{m.displayName}</span>
                          </a>
                        </li>
                      );
                    })
                ) : (
                  <>
                    <li>
                      <a
                        href="#dashboard"
                        className={`admin-drawer-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); switchTab('dashboard'); setAdminMenuOpen(false); }}
                      >
                        <i className="fa-solid fa-gauge-high"></i> <span>Dashboard Overview</span>
                      </a>
                    </li>
                    {checkAccess('Rooms') && (
                      <li>
                        <a
                          href="#rooms"
                          className={`admin-drawer-nav-item ${activeTab === 'rooms' ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); switchTab('rooms'); setAdminMenuOpen(false); }}
                        >
                          <i className="fa-solid fa-door-open"></i> <span>Rooms & Suites</span>
                        </a>
                      </li>
                    )}
                    {checkAccess('Bookings') && (
                      <li>
                        <a
                          href="#bookings"
                          className={`admin-drawer-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); switchTab('bookings'); setAdminMenuOpen(false); }}
                        >
                          <i className="fa-solid fa-calendar-check"></i> <span>All Bookings</span>
                        </a>
                      </li>
                    )}
                    {checkAccess('Users') && (
                      <li>
                        <a
                          href="#users"
                          className={`admin-drawer-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); switchTab('users'); setAdminMenuOpen(false); }}
                        >
                          <i className="fa-solid fa-users"></i> <span>User Accounts</span>
                        </a>
                      </li>
                    )}
                    {checkAccess('Reports') && (
                      <li>
                        <a
                          href="#reports"
                          className={`admin-drawer-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); switchTab('reports'); setAdminMenuOpen(false); }}
                        >
                          <i className="fa-solid fa-chart-pie"></i> <span>Reports & Analytics</span>
                        </a>
                      </li>
                    )}
                    {checkAccess('Menu') && (
                      <li>
                        <a
                          href="#food"
                          className={`admin-drawer-nav-item ${activeTab === 'food' ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); switchTab('food'); setAdminMenuOpen(false); }}
                        >
                          <i className="fa-solid fa-utensils"></i> <span>Gastronomy Menu</span>
                        </a>
                      </li>
                    )}
                    {checkAccess('MenuMaster') && (
                      <li>
                        <a
                          href="#menu-master"
                          className={`admin-drawer-nav-item ${activeTab === 'menu-master' ? 'active' : ''}`}
                          onClick={(e) => { e.preventDefault(); switchTab('menu-master'); setAdminMenuOpen(false); }}
                        >
                          <i className="fa-solid fa-sitemap"></i> <span>Menu Master</span>
                        </a>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
            <div className="admin-drawer-divider"></div>
            <button type="button" className="theme-toggle-btn admin-theme-toggle" onClick={() => { toggleTheme(); setAdminMenuOpen(false); }} title="Toggle Theme">
              <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>{' '}
              <span className="theme-label">{isDark ? 'Light' : 'Dark'}</span>
            </button>
            <Link to="/" className="btn btn-secondary admin-website-btn" onClick={() => setAdminMenuOpen(false)}>
              <i className="fa-solid fa-globe"></i> Guest Website
            </Link>
            <div id="authNav" className="admin-auth-nav">
              {user && (
                <>
                  <Link to="/profile" className="admin-user-profile-link" title={`${user.name} (${user.role})`} onClick={() => setAdminMenuOpen(false)}>
                    <i className="fa-solid fa-user"></i> <span className="admin-user-name">{user.name}</span> <span className="admin-user-role">({user.role})</span>
                  </Link>
                  <button
                    onClick={() => { setAdminMenuOpen(false); logout(); }}
                    className="btn btn-secondary admin-logout-btn"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN ADMIN WRAPPER WITH PERSISTENT SIDEBAR */}
      <div className="admin-wrapper">
        {/* ADMIN SIDEBAR NAVIGATION */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--admin-accent-gold)' }}>
              {isAdmin ? 'System Administration' : isManager ? 'Operations Desk' : 'Front Desk Console'}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFF', marginTop: '4px' }}>
              {isAdmin ? 'Full Security Access' : isManager ? 'Management & Reports' : 'Front Desk Reception'}
            </div>
          </div>

          <ul className="admin-sidebar-menu">
            {userMenus && userMenus.length > 0 ? (
              userMenus
                .filter(m => m.isActive)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map(m => {
                  const slug = m.route && m.route.includes('#') ? m.route.split('#')[1] : m.name.toLowerCase();
                  return (
                    <li key={m.id || m.name}>
                      <a
                        href={`#${slug}`}
                        className={activeTab === slug ? 'active' : ''}
                        onClick={(e) => {
                          e.preventDefault();
                          switchTab(slug);
                        }}
                      >
                        <i className={`fa-solid ${m.icon || 'fa-folder'}`}></i> <span>{m.displayName}</span>
                      </a>
                    </li>
                  );
                })
            ) : (
              <>
                <li>
                  <a
                    href="#dashboard"
                    className={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={(e) => { e.preventDefault(); switchTab('dashboard'); }}
                  >
                    <i className="fa-solid fa-gauge-high"></i> <span>Dashboard Overview</span>
                  </a>
                </li>
                {checkAccess('Rooms') && (
                  <li>
                    <a
                      href="#rooms"
                      className={activeTab === 'rooms' ? 'active' : ''}
                      onClick={(e) => { e.preventDefault(); switchTab('rooms'); }}
                    >
                      <i className="fa-solid fa-door-open"></i> <span>Rooms & Suites</span>
                    </a>
                  </li>
                )}
                {checkAccess('Bookings') && (
                  <li>
                    <a
                      href="#bookings"
                      className={activeTab === 'bookings' ? 'active' : ''}
                      onClick={(e) => { e.preventDefault(); switchTab('bookings'); }}
                    >
                      <i className="fa-solid fa-calendar-check"></i> <span>All Bookings</span>
                    </a>
                  </li>
                )}
                {checkAccess('Users') && (
                  <li>
                    <a
                      href="#users"
                      className={activeTab === 'users' ? 'active' : ''}
                      onClick={(e) => { e.preventDefault(); switchTab('users'); }}
                    >
                      <i className="fa-solid fa-users"></i> <span>User Accounts</span>
                    </a>
                  </li>
                )}
                {checkAccess('Reports') && (
                  <li>
                    <a
                      href="#reports"
                      className={activeTab === 'reports' ? 'active' : ''}
                      onClick={(e) => { e.preventDefault(); switchTab('reports'); }}
                    >
                      <i className="fa-solid fa-chart-pie"></i> <span>Reports & Analytics</span>
                    </a>
                  </li>
                )}
                {checkAccess('Menu') && (
                  <li>
                    <a
                      href="#food"
                      className={activeTab === 'food' ? 'active' : ''}
                      onClick={(e) => { e.preventDefault(); switchTab('food'); }}
                    >
                      <i className="fa-solid fa-utensils"></i> <span>Gastronomy Menu</span>
                    </a>
                  </li>
                )}
                {checkAccess('MenuMaster') && (
                  <li>
                    <a
                      href="#menu-master"
                      className={activeTab === 'menu-master' ? 'active' : ''}
                      onClick={(e) => { e.preventDefault(); switchTab('menu-master'); }}
                    >
                      <i className="fa-solid fa-bars-staggered"></i> <span>Menu Master</span>
                    </a>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="admin-sidebar-footer" style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto', fontSize: '11.5px', color: '#7F8C8D' }}>
            <div>Ansu Kumar Hotels v2.4 (React)</div>
            <div style={{ marginTop: '2px' }}>PostgreSQL Active</div>
          </div>
        </aside>

        {/* ADMIN MAIN CONTENT AREA */}
        <main className="admin-content">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div id="tab-dashboard">
              <div className="section-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <span className="section-tag">Executive Summary</span>
                <h2 className="section-title">Hotel Operations Overview</h2>
              </div>

              <div className="dashboard-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--admin-text-main)' }}>
                  <div className="label"><i className="fa-solid fa-hotel" style={{ marginRight: '6px' }}></i> Total Active Suites</div>
                  <div className="value">{dashboardStats?.totalRooms ?? roomsData.length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--admin-success)' }}>
                  <div className="label"><i className="fa-solid fa-circle-check" style={{ marginRight: '6px', color: 'var(--admin-success)' }}></i> Available Suites</div>
                  <div className="value" style={{ color: 'var(--admin-success)' }}>{dashboardStats?.availableRooms ?? roomsData.filter((r) => r.status === 'Available').length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--admin-danger)' }}>
                  <div className="label"><i className="fa-solid fa-lock" style={{ marginRight: '6px', color: 'var(--admin-danger)' }}></i> Occupied Suites</div>
                  <div className="value" style={{ color: 'var(--admin-danger)' }}>{dashboardStats?.occupiedRooms ?? roomsData.filter((r) => r.status === 'Occupied').length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--admin-accent-gold)' }}>
                  <div className="label"><i className="fa-solid fa-calendar-check" style={{ marginRight: '6px', color: 'var(--admin-accent-gold)' }}></i> Total Bookings</div>
                  <div className="value" style={{ color: 'var(--admin-accent-gold)' }}>{dashboardStats?.totalBookings ?? bookingsData.length}</div>
                </div>
                {canManageUsers && (
                  <div className="stat-card" style={{ borderLeft: '4px solid #3498DB' }}>
                    <div className="label"><i className="fa-solid fa-users" style={{ marginRight: '6px', color: '#3498DB' }}></i> Registered Users</div>
                    <div className="value" style={{ color: '#3498DB' }}>{dashboardStats?.totalUsers ?? usersData.length}</div>
                  </div>
                )}
                <div className="stat-card" style={{ borderLeft: '4px solid #E67E22' }}>
                  <div className="label"><i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '6px', color: '#E67E22' }}></i> Pending Bookings</div>
                  <div className="value" style={{ color: '#E67E22' }}>{dashboardStats?.pendingBookings ?? bookingsData.filter((b) => b.bookingStatus === 'Pending').length}</div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="admin-quick-actions-panel" style={{ marginTop: '28px', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--admin-text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-bolt" style={{ color: 'var(--admin-accent-gold)' }}></i> Quick Management Actions
                </h3>
                <div className="admin-quick-actions-list" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {canManageRooms && (
                    <button className="btn btn-primary" onClick={() => { setShowAddRoomModal(true); switchTab('rooms'); }}>
                      <i className="fa-solid fa-plus"></i> Add New Suite
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={() => switchTab('bookings')}>
                    <i className="fa-solid fa-list-check"></i> Review Bookings
                  </button>
                  {canManageFood && (
                    <button className="btn btn-secondary" onClick={() => switchTab('food')}>
                      <i className="fa-solid fa-utensils"></i> Update Food Menu
                    </button>
                  )}
                  {canManageUsers && (
                    <button className="btn btn-secondary" onClick={() => switchTab('users')}>
                      <i className="fa-solid fa-user-gear"></i> Manage Users
                    </button>
                  )}
                </div>
              </div>

              {/* Recent Activity: Bookings and Registered Users */}
              <div className="admin-tables-grid">
                {/* Recent Registered Guests - Admin Only */}
                {canManageUsers && (() => {
                  const displayUsers = recentUsers.length > 0 ? recentUsers : usersData.slice(0, 5);
                  const totalUsersCount = Math.max(usersData.length, recentUsers.length, displayUsers.length);
                  return (
                    <div className="admin-table-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '15px', color: 'var(--admin-text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fa-solid fa-user-plus" style={{ color: '#3498DB' }}></i> Recently Registered Guests
                        </h3>
                        <button className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => switchTab('users')}>
                          View All ({totalUsersCount})
                        </button>
                      </div>
                      <div className="table-wrapper">
                        <table className="table admin-overview-table">
                          <colgroup>
                            <col style={{ width: '24%' }} />
                            <col style={{ width: '30%' }} />
                            <col style={{ width: '24%' }} />
                            <col style={{ width: '22%' }} />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>Guest</th>
                              <th>Email</th>
                              <th>Status</th>
                              <th>Registered</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayUsers.map((ru) => {
                              const id = ru.userId || ru.UserId || ru.id;
                              const name = ru.name || ru.Name || 'User';
                              const email = ru.email || ru.Email || '';
                              const active = ru.isActive !== undefined ? ru.isActive : (ru.IsActive !== undefined ? ru.IsActive : true);
                              const dateStr = ru.createdAt || ru.CreatedAt ? new Date(ru.createdAt || ru.CreatedAt).toLocaleDateString('en-GB') : 'Recent';

                              return (
                                <tr key={id || email}>
                                  <td style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{name}</td>
                                  <td style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={email}>{email}</td>
                                  <td>
                                    <span className={`badge ${active ? 'badge-active' : 'badge-inactive'}`} style={{ fontSize: '10px' }}>
                                      {active ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td style={{ fontSize: '11px', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>{dateStr}</td>
                                </tr>
                              );
                            })}
                            {displayUsers.length === 0 && (
                              <tr>
                                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '16px' }}>No users found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* Recent Bookings */}
                {(() => {
                  const displayBookings = recentBookings.length > 0 ? recentBookings : bookingsData.slice(0, 5);
                  const totalBookingsCount = Math.max(bookingsData.length, recentBookings.length, displayBookings.length);
                  return (
                    <div className="admin-table-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '15px', color: 'var(--admin-text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fa-solid fa-calendar-days" style={{ color: 'var(--admin-accent-gold)' }}></i> Recent Bookings
                        </h3>
                        <button className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => switchTab('bookings')}>
                          View All ({totalBookingsCount})
                        </button>
                      </div>
                      <div className="table-wrapper">
                        <table className="table admin-overview-table">
                          <colgroup>
                            <col style={{ width: '9%' }} />
                            <col style={{ width: '23%' }} />
                            <col style={{ width: '26%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '27%' }} />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Guest</th>
                              <th>Room & Suite</th>
                              <th>Tariff</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayBookings.map((rb) => {
                              const id = rb.bookingId || rb.BookingId;
                              const guest = rb.guestName || rb.GuestName || 'Guest';
                              const total = rb.totalAmount || rb.TotalAmount || 0;
                              const status = rb.bookingStatus || rb.BookingStatus || 'Pending';
                              const rNum = rb.roomNumber || rb.RoomNumber || rb.room?.roomNumber || 'N/A';
                              const rType = rb.roomType || rb.RoomType || rb.room?.roomType || 'Luxury Suite';

                              return (
                                <tr key={id}>
                                  <td style={{ fontWeight: 700, color: 'var(--admin-accent-gold)', whiteSpace: 'nowrap' }}>#{id}</td>
                                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={guest}>{guest}</td>
                                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <strong style={{ color: 'var(--admin-text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rType}>{rType}</strong>
                                    <div style={{ fontSize: '11px', color: 'var(--admin-accent-gold)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                      <i className="fa-solid fa-door-open" style={{ marginRight: '3px' }}></i> Room #{rNum}
                                    </div>
                                  </td>
                                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>₹{Number(total).toLocaleString('en-IN')}</td>
                                  <td>
                                    <span className={`badge badge-${status.toLowerCase()}`} style={{ fontSize: '10px' }}>
                                      {status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                            {displayBookings.length === 0 && (
                              <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '16px' }}>No bookings recorded.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 2: ROOMS & SUITES */}
          {activeTab === 'rooms' && (
            <div id="tab-rooms">
              <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 className="section-title">Rooms & Suites Management</h2>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px', margin: 0 }}>
                    Configure pricing, 5 luxury perks, status, and multi-image photo galleries for all suites.
                  </p>
                </div>
                <div className="admin-section-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {canDeleteRooms && (
                    <button className="btn btn-secondary" onClick={() => setShowDeletedRoomsModal(true)}>
                      <i className="fa-solid fa-trash-can"></i> Deleted Archive ({deletedRooms.length})
                    </button>
                  )}
                  {canManageRooms && (
                    <button className="btn btn-secondary" onClick={handleSyncRoomsToDb} title="Synchronize React rooms catalog to database">
                      <i className="fa-solid fa-cloud-arrow-up"></i> Sync to DB
                    </button>
                  )}
                  {canManageRooms && (
                    <button className="btn btn-primary" onClick={() => setShowAddRoomModal(true)}>
                      <i className="fa-solid fa-plus"></i> Add New Suite
                    </button>
                  )}
                </div>
              </div>

              {/* Rooms Filter Bar */}
              <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search Room # / Subtype"
                  className="form-control"
                  value={roomsSearchNum}
                  onChange={(e) => setRoomsSearchNum(e.target.value)}
                  style={{ width: '220px' }}
                />
                <select
                  className="form-control"
                  value={roomsSearchType}
                  onChange={(e) => setRoomsSearchType(e.target.value)}
                  style={{ width: '190px' }}
                >
                  <option value="All">All Categories (112)</option>
                  <option value="Top Tier">Top-Tier Suites (27)</option>
                  <option value="Suites">Standard Suites (85)</option>
                  <option value="Deluxe Room">Deluxe Rooms</option>
                  <option value="Premium Room">Premium Rooms</option>
                  <option value="Executive Suite">Executive Suites</option>
                </select>
                <select
                  className="form-control"
                  value={roomsSearchStatus}
                  onChange={(e) => setRoomsSearchStatus(e.target.value)}
                  style={{ width: '160px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              {/* Rooms Table */}
              <div className="table-wrapper">
                <table className="table admin-rooms-table">
                  <thead>
                    <tr>
                      <th>Room #</th>
                      <th>Category & Subtype</th>
                      <th>Nightly Tariff</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>5 Key Facilities</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomsFiltered
                      .slice((roomsPage - 1) * PAGE_SIZE, roomsPage * PAGE_SIZE)
                      .map((room) => {
                        const rId = room.roomId || room.RoomId;
                        const rNum = room.roomNumber || room.RoomNumber;
                        const rType = room.roomType || room.RoomType;
                        const rSubType = room.subType || room.SubType;
                        const rPrice = room.price || room.Price;
                        const rStatus = room.status || room.Status;
                        const rCap = room.capacity || room.Capacity || 2;
                        const meta = getRoomMeta(rType, rNum, room);

                        return (
                          <tr key={rId}>
                            <td style={{ fontWeight: 700, color: 'var(--admin-accent-gold)', whiteSpace: 'nowrap' }}>#{rNum}</td>
                            <td>
                              <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{rType}</div>
                              {rSubType && <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>{rSubType}</div>}
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--admin-accent-gold)', whiteSpace: 'nowrap' }}>₹{Number(rPrice).toLocaleString('en-IN')}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{rCap} Guests</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <span className={`badge badge-${rStatus === 'Available' ? 'available' : rStatus === 'Occupied' ? 'occupied' : 'maintenance'}`}>
                                {rStatus}
                              </span>
                            </td>
                            <td className="room-facilities-cell" style={{ fontSize: '11px', maxWidth: '240px' }}>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }} title={(meta.facilities || []).join(', ')}>
                                {(meta.facilities || []).slice(0, 3).join(', ')}...
                              </div>
                            </td>
                            <td className="room-actions-cell" style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>
                              {canManageRooms ? (
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }} onClick={() => handleOpenEditRoom(room)}>
                                    <i className="fa-solid fa-pen"></i> Edit
                                  </button>
                                  {canDeleteRooms && (
                                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }} onClick={() => handleDeleteRoom(rId, rNum)}>
                                      <i className="fa-solid fa-trash"></i> Delete
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span style={{ fontSize: '11.5px', color: 'var(--admin-text-muted)' }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {renderPagination(roomsFiltered.length, roomsPage, setRoomsPage)}
            </div>
          )}

          {/* TAB 3: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div id="tab-bookings">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 className="section-title">All Reservations Management</h2>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px', margin: 0 }}>
                    Monitor guest check-ins, record UPI payments, update reservation statuses, and download tax invoices.
                  </p>
                </div>
                {canExportReports && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleExportExcel}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-file-excel" style={{ color: '#107C41' }}></i> Export Excel
                  </button>
                )}
              </div>

              {/* Bookings Filter Bar */}
              <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search Guest Name / ID / Room #"
                  className="form-control"
                  value={bookingsSearch}
                  onChange={(e) => setBookingsSearch(e.target.value)}
                  style={{ width: '250px' }}
                />
                <select
                  className="form-control"
                  value={bookingsFilterStatus}
                  onChange={(e) => setBookingsFilterStatus(e.target.value)}
                  style={{ width: '160px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="CheckedIn">Checked In</option>
                  <option value="CheckedOut">Checked Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Bookings Table */}
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Booking #</th>
                      <th>Guest Details</th>
                      <th>Reserved Suite & Room</th>
                      <th>Dates & Package</th>
                      <th>Amount & Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsFiltered
                      .slice((bookingsPage - 1) * PAGE_SIZE, bookingsPage * PAGE_SIZE)
                      .map((b) => {
                        const bId = b.bookingId || b.BookingId;
                        const isPaid = b.paymentStatus === 'Paid';
                        const checkInDate = new Date(b.checkIn).toLocaleDateString('en-GB');
                        const checkOutDate = new Date(b.checkOut).toLocaleDateString('en-GB');
                        const roomNum = b.roomNumber || b.RoomNumber || b.room?.roomNumber || 'N/A';
                        const roomType = b.roomType || b.RoomType || b.room?.roomType || 'Luxury Suite';
                        const userMail = b.userEmail || b.UserEmail || b.user?.email || '';

                        return (
                          <tr key={bId}>
                            <td style={{ fontWeight: 700, color: 'var(--admin-accent-gold)' }}>#{bId}</td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{b.guestName}</div>
                              {userMail && <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>{userMail}</div>}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--admin-text-main)' }}>{roomType}</div>
                              <div style={{ fontSize: '11.5px', color: 'var(--admin-accent-gold)', fontWeight: 700, marginTop: '2px' }}>
                                <i className="fa-solid fa-door-open" style={{ marginRight: '4px' }}></i> Room #{roomNum}
                              </div>
                            </td>
                            <td style={{ fontSize: '12px' }}>
                              <div>{checkInDate} → {checkOutDate}</div>
                              <span className="badge badge-package">{b.package || 'Stay'}</span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--admin-accent-gold)' }}>₹{Number(b.totalAmount).toLocaleString('en-IN')}</div>
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                                <span className={`badge ${isPaid ? 'badge-paid' : 'badge-pending'}`}>{b.paymentStatus}</span>
                                <span className="badge badge-package" style={{ fontSize: '10.5px', textTransform: 'none' }}>
                                  <i
                                    className={
                                      (b.transactionId || '').toLowerCase().includes('card')
                                        ? 'fa-solid fa-credit-card'
                                        : (b.transactionId || '').toLowerCase().includes('cash')
                                          ? 'fa-solid fa-money-bill-wave'
                                          : 'fa-solid fa-qrcode'
                                    }
                                    style={{ marginRight: '4px' }}
                                  ></i>
                                  {b.transactionId || 'Cash'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge badge-${(b.bookingStatus || 'pending').toLowerCase()}`}>
                                {b.bookingStatus}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleOpenUpdateStatus(b)}>
                                  Status
                                </button>
                                <a href={`/api/bookings/${bId}/invoice`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} title="View Invoice">
                                  <i className="fa-solid fa-file-invoice"></i>
                                </a>
                                {b.bookingStatus !== 'Cancelled' && (
                                  <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleCancelBooking(bId)}>
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {renderPagination(bookingsFiltered.length, bookingsPage, setBookingsPage)}
            </div>
          )}

          {/* TAB 4: USERS */}
          {activeTab === 'users' && (
            <div id="tab-users">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 className="section-title">User Accounts Directory</h2>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px', margin: 0 }}>
                    Manage guest credentials, assign administrator roles, and govern active authentication access.
                  </p>
                </div>
              </div>

              {/* Users Filter Bar */}
              <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search Name / Email / Phone"
                  className="form-control"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  style={{ width: '240px' }}
                />
                <select
                  className="form-control"
                  value={usersFilterRole}
                  onChange={(e) => setUsersFilterRole(e.target.value)}
                  style={{ width: '150px' }}
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Administrators</option>
                  <option value="Manager">Operations Managers</option>
                  <option value="Staff">Front Desk Staff</option>
                  <option value="User">Standard Guests</option>
                </select>
                <select
                  className="form-control"
                  value={usersFilterStatus}
                  onChange={(e) => setUsersFilterStatus(e.target.value)}
                  style={{ width: '160px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Accounts</option>
                  <option value="Inactive">Deactivated Accounts</option>
                </select>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={loadUsers}
                  disabled={usersLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
                  title="Reload registered users immediately from PostgreSQL"
                >
                  <i className={`fa-solid fa-arrows-rotate ${usersLoading ? 'fa-spin' : ''}`}></i> Refresh
                </button>
              </div>

              {/* Users Table */}
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersFiltered.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--admin-text-muted)' }}>
                          No user accounts matching current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      usersFiltered
                        .slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE)
                        .map((u) => {
                          const uId = u.id || u.userId || u.UserId;
                          const uName = u.name || u.Name || 'User';
                          const uEmail = u.email || u.Email || '';
                          const uPhone = u.phone || u.Phone || '—';
                          const uRole = u.role || u.Role || 'User';
                          const isActive = u.isActive !== undefined ? u.isActive : (u.IsActive !== undefined ? u.IsActive : true);

                          const getRoleBadgeClass = (r) => {
                            const low = (r || '').toLowerCase();
                            if (low === 'admin') return 'badge-confirmed';
                            if (low === 'manager') return 'badge-paid';
                            if (low === 'staff') return 'badge-pending';
                            return 'badge-package';
                          };

                          return (
                            <tr key={uId}>
                              <td style={{ fontWeight: 700, color: 'var(--admin-accent-gold)' }}>#{uId}</td>
                              <td style={{ fontWeight: 600 }}>{uName}</td>
                              <td>{uEmail}</td>
                              <td>{uPhone}</td>
                              <td>
                                <span className={`badge ${getRoleBadgeClass(uRole)}`}>
                                  {uRole}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${isActive ? 'badge-active' : 'badge-inactive'}`}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleOpenEditUser(u)}>
                                    <i className="fa-solid fa-pen"></i> Edit
                                  </button>
                                  <button
                                    className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
                                    style={{ padding: '4px 8px', fontSize: '11px' }}
                                    onClick={() => handleToggleUserActive(uId, isActive)}
                                  >
                                    {isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {renderPagination(usersFiltered.length, usersPage, setUsersPage)}
            </div>
          )}

          {/* TAB 5: GASTRONOMY FOOD MENU */}
          {activeTab === 'food' && (
            <div id="tab-food">
              <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 className="section-title">Gastronomy Menu Catalogue</h2>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px', margin: 0 }}>
                    Manage 20 signature culinary dishes, pricing, dietary categorizations, and recipe descriptions.
                  </p>
                </div>
                <div className="admin-section-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {canDeleteFood && (
                    <button className="btn btn-secondary" onClick={() => setShowDeletedFoodModal(true)}>
                      <i className="fa-solid fa-trash-can"></i> Archive ({deletedFood.length})
                    </button>
                  )}
                  {canManageFood && (
                    <button className="btn btn-secondary" onClick={handleSyncFoodToDb} title="Synchronize React gastronomy catalog to database">
                      <i className="fa-solid fa-cloud-arrow-up"></i> Sync to DB
                    </button>
                  )}
                  {canManageFood && (
                    <button className="btn btn-primary" onClick={() => setShowAddFoodModal(true)}>
                      <i className="fa-solid fa-plus"></i> Add New Dish
                    </button>
                  )}
                </div>
              </div>

              {/* Food Search & Category Filter */}
              <div className="filter-bar admin-food-filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div className="admin-search-input-group">
                  <input
                    type="text"
                    placeholder="Search dishes (e.g., Paneer, Biryani)..."
                    className="form-control admin-search-input"
                    value={foodSearch}
                    onChange={(e) => setFoodSearch(e.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-search-btn"
                    title="Search"
                    aria-label="Search dishes"
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
                <select
                  className="form-control"
                  value={foodCategoryFilter}
                  onChange={(e) => setFoodCategoryFilter(e.target.value)}
                  style={{ width: '220px' }}
                >
                  <option value="All">All Categories ({foodData.length})</option>
                  <option value="Vegetarian">Vegetarian ({foodData.filter((f) => f.category === 'Vegetarian').length})</option>
                  <option value="Non-Vegetarian">Non-Vegetarian ({foodData.filter((f) => f.category === 'Non-Vegetarian').length})</option>
                  <option value="Desserts">Desserts & Drinks ({foodData.filter((f) => f.category?.includes('Dessert') || f.category?.includes('Drink')).length})</option>
                </select>
                {foodSearch && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setFoodSearch('')}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Desktop Food Table */}
              <div className="table-wrapper desktop-food-table">
                <table className="table admin-food-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Dish Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Diet & Tag</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodFiltered
                      .slice((foodPage - 1) * PAGE_SIZE, foodPage * PAGE_SIZE)
                      .map((item, idx) => (
                        <tr key={item.name + idx}>
                          <td>
                            <img
                              src={item.image && (item.image.startsWith('data:') || item.image.startsWith('http') || item.image.startsWith('/')) ? item.image : `/${item.image}`}
                              alt={item.name}
                              style={{ width: '45px', height: '45px', borderRadius: '4px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/deluxe-room.jpg';
                              }}
                            />
                          </td>
                          <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{item.name}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{item.category}</td>
                          <td style={{ fontWeight: 700, color: 'var(--admin-accent-gold)', whiteSpace: 'nowrap' }}>₹{item.price}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span className="badge badge-package">{item.diet}</span>
                            {item.tag && <div style={{ fontSize: '10.5px', color: 'var(--admin-accent-gold)', marginTop: '2px' }}>{item.tag}</div>}
                          </td>
                          <td style={{ fontSize: '12px', maxWidth: '300px', color: 'var(--admin-text-muted)' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }} title={item.desc}>
                              {item.desc}
                            </div>
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {canManageFood && (
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }} onClick={() => handleOpenEditFood(item)}>
                                  <i className="fa-solid fa-pen"></i> Edit
                                </button>
                              )}
                              {canDeleteFood && (
                                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }} onClick={() => handleDeleteFood(item.name)}>
                                  <i className="fa-solid fa-trash"></i> Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Food Cards (Mobile Only) */}
              <div className="mobile-food-cards">
                {foodFiltered.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                    <i className="fa-solid fa-utensils" style={{ fontSize: '26px', color: 'var(--admin-accent-gold)', marginBottom: '8px', display: 'block' }}></i>
                    <div>No dishes match your filter.</div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => { setFoodSearch(''); setFoodCategoryFilter('All'); }}
                      style={{ marginTop: '10px', fontSize: '12px' }}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  foodFiltered
                    .slice((foodPage - 1) * PAGE_SIZE, foodPage * PAGE_SIZE)
                    .map((item, idx) => {
                      const isMenuOpen = openFoodMenuId === item.name;
                      return (
                        <div key={'mob-' + item.name + idx} className="admin-food-card">
                          <div className="admin-food-card-body">
                            <div className="admin-food-img-container">
                              <img
                                src={item.image && (item.image.startsWith('data:') || item.image.startsWith('http') || item.image.startsWith('/')) ? item.image : `/${item.image}`}
                                alt={item.name}
                                className="admin-food-card-img"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/deluxe-room.jpg';
                                }}
                              />
                              <span className={`badge badge-package admin-food-diet-badge ${item.diet?.toLowerCase() === 'veg' || item.diet?.toLowerCase() === 'vegetarian' ? 'badge-veg' : 'badge-nonveg'}`}>
                                {item.diet}
                              </span>
                            </div>
                            <div className="admin-food-card-details">
                              <div className="admin-food-card-top-row">
                                <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                                  <h4 className="admin-food-card-title" title={item.name}>{item.name}</h4>
                                  <div className="admin-food-card-meta">
                                    <span className="admin-food-category-pill">
                                      <i className="fa-solid fa-utensils" style={{ marginRight: '4px' }}></i> {item.category}
                                    </span>
                                    {item.tag && <span className="admin-food-tag-pill">{item.tag}</span>}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                  <span className="admin-food-card-price">₹{item.price}</span>
                                  <div className="admin-card-menu-wrapper">
                                    <button
                                      type="button"
                                      className="admin-card-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenFoodMenuId(isMenuOpen ? null : item.name);
                                      }}
                                      aria-label="Dish Actions"
                                      title="Options"
                                    >
                                      <i className="fa-solid fa-ellipsis-vertical"></i>
                                    </button>
                                    {isMenuOpen && (
                                      <div className="admin-card-dropdown-menu">
                                        {canManageFood && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenFoodMenuId(null);
                                              handleOpenEditFood(item);
                                            }}
                                          >
                                            <i className="fa-solid fa-pen-to-square"></i> Edit Dish
                                          </button>
                                        )}
                                        {canDeleteFood && (
                                          <button
                                            type="button"
                                            className="menu-danger"
                                            onClick={() => {
                                              setOpenFoodMenuId(null);
                                              handleDeleteFood(item.name);
                                            }}
                                          >
                                            <i className="fa-solid fa-trash"></i> Remove Dish
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <p className="admin-food-card-desc">{item.desc}</p>

                              <div className="admin-food-card-actions">
                                {canManageFood && (
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ padding: '6px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    onClick={() => handleOpenEditFood(item)}
                                  >
                                    <i className="fa-solid fa-pen-to-square"></i> Edit
                                  </button>
                                )}
                                {canDeleteFood && (
                                  <button
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: '6px 12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    onClick={() => handleDeleteFood(item.name)}
                                  >
                                    <i className="fa-solid fa-trash"></i> Remove Dish
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {renderPagination(foodFiltered.length, foodPage, setFoodPage)}
            </div>
          )}

          {/* TAB 6: DYNAMIC RBAC ROLE & PERMISSION MANAGEMENT */}
          {activeTab === 'permissions' && (
            <div id="tab-permissions">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 className="section-title">Role & Permission Management</h2>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px', margin: 0 }}>
                    Configure dynamic Role-Based Access Control (RBAC) permissions persisted to PostgreSQL database.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={loadRolePermissions}
                    disabled={rolePermsLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className={`fa-solid fa-arrows-rotate ${rolePermsLoading ? 'fa-spin' : ''}`}></i> Refresh Matrix
                  </button>
                  {selectedRoleForPerms !== 'Admin' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={saveRolePermissions}
                      disabled={rolePermsSaving}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '170px', justifyContent: 'center' }}
                    >
                      {rolePermsSaving ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-floppy-disk"></i> Save {selectedRoleForPerms} Permissions
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {rolePermsMessage && (
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    background: rolePermsMessage.startsWith('✅') ? 'rgba(5, 150, 105, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                    color: rolePermsMessage.startsWith('✅') ? 'var(--admin-success)' : 'var(--admin-danger)',
                    border: `1px solid ${rolePermsMessage.startsWith('✅') ? 'rgba(5, 150, 105, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`
                  }}
                >
                  {rolePermsMessage}
                </div>
              )}

              {/* Role Selection Selector Bar */}
              <div className="card" style={{ padding: '16px 20px', marginBottom: '22px', border: '1px solid var(--admin-border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--admin-text-main)' }}>Select System Role:</span>
                    {['Admin', 'Manager', 'Staff', 'User'].map((rName) => {
                      const isSelected = selectedRoleForPerms === rName;
                      return (
                        <button
                          key={rName}
                          type="button"
                          onClick={() => handleRoleSelectionChange(rName)}
                          className={`role-tab-pill ${isSelected ? 'selected' : 'unselected'}`}
                        >
                          <i className={`fa-solid ${rName === 'Admin' ? 'fa-crown' : rName === 'Manager' ? 'fa-user-tie' : rName === 'Staff' ? 'fa-id-badge' : 'fa-user'}`}></i>
                          <span>{rName}</span>
                          <span className="role-tab-pill-badge">
                            {rName === 'Admin' ? 'Universal' : `${(rolePermissionsMatrix[rName] || []).length} perms`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--admin-text-muted)' }}>
                    Active Role: <strong style={{ color: 'var(--admin-accent-gold)' }}>{selectedRoleForPerms}</strong>
                    {selectedRoleForPerms === 'Admin' && ' (Full Security Access Granted to All System Modules)'}
                  </div>
                </div>
              </div>

              {/* Permissions Categories Grid */}
              {rolePermsLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--admin-accent-gold)', marginBottom: '12px' }}></i>
                  <div>Loading dynamic permissions matrix from database...</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                  {allPermissionsList.map((catGroup) => {
                    const catPerms = catGroup.permissions || [];
                    const selectedInCat = catPerms.filter((p) => selectedRolePerms.includes(p.name)).length;
                    const allInCatSelected = catPerms.length > 0 && selectedInCat === catPerms.length;

                    return (
                      <div
                        key={catGroup.category}
                        className="card"
                        style={{
                          borderRadius: '10px',
                          border: '1px solid var(--admin-border)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Category Header */}
                        <div
                          style={{
                            padding: '14px 18px',
                            background: 'var(--admin-card-header-bg)',
                            borderBottom: '1px solid var(--admin-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i
                              className={`fa-solid ${
                                catGroup.category === 'Rooms' ? 'fa-door-open' :
                                catGroup.category === 'Bookings' ? 'fa-calendar-check' :
                                catGroup.category === 'Users' ? 'fa-users' :
                                catGroup.category === 'Menu' ? 'fa-utensils' :
                                catGroup.category === 'Feedback' ? 'fa-star' :
                                'fa-shield-halved'
                              }`}
                              style={{ color: 'var(--admin-accent-gold)' }}
                            ></i>
                            <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                              {catGroup.category} Permissions
                            </h4>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                              {selectedRoleForPerms === 'Admin' ? `${catPerms.length}/${catPerms.length}` : `${selectedInCat}/${catPerms.length}`}
                            </span>
                            {selectedRoleForPerms !== 'Admin' && (
                              <button
                                type="button"
                                onClick={() => toggleCategoryPermissions(catPerms)}
                                className="btn btn-secondary"
                                style={{ padding: '2px 8px', fontSize: '10.5px' }}
                              >
                                {allInCatSelected ? 'Deselect All' : 'Select All'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Permissions List */}
                        <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                          {catPerms.map((perm) => {
                            const isChecked = selectedRoleForPerms === 'Admin' || selectedRolePerms.includes(perm.name);
                            return (
                              <label
                                key={perm.name}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px',
                                  cursor: selectedRoleForPerms === 'Admin' ? 'default' : 'pointer',
                                  padding: '8px 10px',
                                  borderRadius: '6px',
                                  background: isChecked ? 'var(--admin-accent-subtle)' : 'transparent',
                                  border: `1px solid ${isChecked ? 'rgba(217, 119, 6, 0.2)' : 'transparent'}`,
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={selectedRoleForPerms === 'Admin'}
                                  onChange={() => togglePermissionForSelectedRole(perm.name)}
                                  style={{ marginTop: '3px', cursor: selectedRoleForPerms === 'Admin' ? 'default' : 'pointer' }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-main)' }}>
                                    {perm.name}
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                                    {perm.description}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: MENU MASTER DYNAMIC NAVIGATION & ACCESS CONTROL */}
          {activeTab === 'menu-master' && (
            <div id="tab-menu-master">
              <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 className="section-title">Menu Master & Access Control</h2>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px', margin: 0 }}>
                    Configure dynamic system modules, navigation menus, and role-to-menu visibility persisted to PostgreSQL.
                  </p>
                </div>
                <div className="admin-section-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => loadMenuMasterData(false)}
                    disabled={menuMasterLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className={`fa-solid fa-arrows-rotate ${menuMasterLoading ? 'fa-spin' : ''}`}></i> Refresh Matrix
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddMenuModal(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fa-solid fa-plus"></i> Add New Menu
                    </button>
                  )}
                  {selectedRoleForMenuMaster !== 'Admin' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={saveRoleMenuAccess}
                      disabled={menuMasterSaving}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '180px', justifyContent: 'center' }}
                    >
                      {menuMasterSaving ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-floppy-disk"></i> Save {selectedRoleForMenuMaster} Access
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {menuMasterMessage && (
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    background: menuMasterMessage.startsWith('✅') ? 'rgba(5, 150, 105, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                    color: menuMasterMessage.startsWith('✅') ? 'var(--admin-success)' : 'var(--admin-danger)',
                    border: `1px solid ${menuMasterMessage.startsWith('✅') ? 'rgba(5, 150, 105, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`
                  }}
                >
                  {menuMasterMessage}
                </div>
              )}

              {/* Menu Master Search & Filter (Mobile Only via CSS) */}
              <div className="filter-bar admin-menu-filter-bar">
                <div className="admin-search-input-group">
                  <input
                    type="text"
                    placeholder="Search menus or routes..."
                    className="form-control admin-search-input"
                    value={menuMasterSearch}
                    onChange={(e) => setMenuMasterSearch(e.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-search-btn"
                    title="Search"
                    aria-label="Search menus"
                  >
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
                <select
                  className="form-control admin-menu-select-box"
                  value={menuMasterCategory}
                  onChange={(e) => setMenuMasterCategory(e.target.value)}
                >
                  <option value="All">All Modules</option>
                  {Array.from(new Set(allMenusList.map((m) => m.module || m.name))).filter(Boolean).map((mod) => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
                {menuMasterSearch && (
                  <button
                    type="button"
                    className="btn btn-secondary admin-menu-clear-btn"
                    onClick={() => setMenuMasterSearch('')}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Role Selection Bar */}
              <div className="card" style={{ padding: '14px 18px', marginBottom: '20px', border: '1px solid var(--admin-border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--admin-text-main)', whiteSpace: 'nowrap' }}>Select Role:</span>
                    <div className="role-tab-pills-container">
                      {['Admin', 'Manager', 'Staff', 'User'].map((rName) => {
                        const isSelected = selectedRoleForMenuMaster === rName;
                        const activeCount = (roleMenuMatrix[rName] || []).filter(m => m.canView).length;
                        return (
                          <button
                            key={rName}
                            type="button"
                            onClick={() => handleRoleSelectionForMenuMaster(rName)}
                            className={`role-tab-pill ${isSelected ? 'selected' : 'unselected'}`}
                          >
                            <i className={`fa-solid ${rName === 'Admin' ? 'fa-crown' : rName === 'Manager' ? 'fa-user-tie' : rName === 'Staff' ? 'fa-id-badge' : 'fa-user'}`}></i>
                            <span>{rName}</span>
                            <span className="role-tab-pill-badge">
                              {rName === 'Admin' ? 'Universal' : `${activeCount} menus`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                    Configuring Access for: <strong style={{ color: 'var(--admin-accent-gold)' }}>{selectedRoleForMenuMaster}</strong>
                    {selectedRoleForMenuMaster === 'Admin' && ' (Full Unrestricted Access Granted to All System Menus)'}
                  </div>
                </div>
              </div>

              {/* Menu Master Grid / Table */}
              {menuMasterLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: 'var(--admin-accent-gold)', marginBottom: '12px' }}></i>
                  <div>Loading Menu Master matrix from PostgreSQL...</div>
                </div>
              ) : (() => {
                const filteredMenuAssignments = selectedRoleMenuAssignments.filter((assignment) => {
                  const matchingMenu = allMenusList.find((m) => m.id === assignment.menuId);
                  const mName = assignment.displayName || assignment.menuName || '';
                  const mRoute = assignment.route || '';
                  const mModule = assignment.module || (matchingMenu ? matchingMenu.module : '') || '';

                  if (menuMasterCategory !== 'All' && mModule !== menuMasterCategory) {
                    return false;
                  }
                  if (menuMasterSearch && menuMasterSearch.trim()) {
                    const q = menuMasterSearch.trim().toLowerCase();
                    return mName.toLowerCase().includes(q) || mRoute.toLowerCase().includes(q) || mModule.toLowerCase().includes(q);
                  }
                  return true;
                });

                return (
                  <>
                    {/* Mobile Menu Master Cards (Mobile Only) */}
                    <div className="mobile-menu-master-cards">
                      {filteredMenuAssignments.length === 0 ? (
                        <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                          <i className="fa-solid fa-folder-open" style={{ fontSize: '26px', color: 'var(--admin-accent-gold)', marginBottom: '8px', display: 'block' }}></i>
                          <div>No menu items match your filter.</div>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => { setMenuMasterSearch(''); setMenuMasterCategory('All'); }}
                            style={{ marginTop: '10px', fontSize: '12px' }}
                          >
                            Reset Filters
                          </button>
                        </div>
                      ) : (
                        filteredMenuAssignments.map((assignment, index) => {
                          const isGranted = selectedRoleForMenuMaster === 'Admin' || assignment.canView;
                          const matchingMenu = allMenusList.find((m) => m.id === assignment.menuId);
                          const isMenuItemActive = matchingMenu ? matchingMenu.isActive : true;
                          const isActionOpen = openMenuMasterActionId === assignment.menuId;

                          return (
                            <div key={'mob-menu-' + assignment.menuId} className="admin-menu-master-card">
                              <div className="admin-menu-master-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '1 1 auto' }}>
                                  <div
                                    style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '8px',
                                      background: isGranted ? 'var(--admin-accent-subtle)' : 'rgba(239, 68, 68, 0.1)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: isGranted ? 'var(--admin-accent-gold)' : 'var(--admin-danger)',
                                      flexShrink: 0
                                    }}
                                  >
                                    <i className={`fa-solid ${assignment.icon || 'fa-folder'}`}></i>
                                  </div>
                                  <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--admin-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {assignment.displayName || assignment.menuName}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      #{assignment.displayOrder || index + 1} • <code>{assignment.route}</code>
                                    </div>
                                  </div>
                                </div>
                                {isAdmin && (
                                  <div className="admin-menu-master-action-wrapper" style={{ position: 'relative' }}>
                                    <button
                                      type="button"
                                      className="admin-card-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuMasterActionId(isActionOpen ? null : assignment.menuId);
                                      }}
                                      title="Options"
                                    >
                                      <i className="fa-solid fa-ellipsis-vertical"></i>
                                    </button>
                                    {isActionOpen && (
                                      <div className="admin-card-dropdown-menu">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenMenuMasterActionId(null);
                                            handleOpenEditMenuModal(assignment);
                                          }}
                                        >
                                          <i className="fa-solid fa-pen-to-square"></i> Edit Menu
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="admin-menu-master-card-meta">
                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--admin-accent-subtle)', color: 'var(--admin-accent-gold)', fontSize: '11px', fontWeight: 600 }}>
                                  Module: {assignment.module || 'System'}
                                </span>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    background: isMenuItemActive ? 'rgba(5, 150, 105, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                    color: isMenuItemActive ? 'var(--admin-success)' : 'var(--admin-danger)'
                                  }}
                                >
                                  {isMenuItemActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              <div className="admin-menu-master-card-footer">
                                <label
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: selectedRoleForMenuMaster === 'Admin' ? 'default' : 'pointer'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isGranted}
                                    disabled={selectedRoleForMenuMaster === 'Admin'}
                                    onChange={() => toggleMenuAccessForRole(assignment.menuId)}
                                    style={{
                                      width: '18px',
                                      height: '18px',
                                      cursor: selectedRoleForMenuMaster === 'Admin' ? 'default' : 'pointer'
                                    }}
                                  />
                                  <span style={{ fontSize: '12px', fontWeight: 600, color: isGranted ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                                    {selectedRoleForMenuMaster} Access: {isGranted ? 'Enabled' : 'Disabled'}
                                  </span>
                                </label>
                                {isAdmin && (
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleOpenEditMenuModal(assignment)}
                                    style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                  >
                                    <i className="fa-solid fa-pen-to-square"></i> Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Desktop / Responsive Table View */}
                    <div className="card table-wrapper menu-controller-container desktop-menu-master-table" style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                      <table className="admin-table table" style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'var(--admin-card-header-bg)', borderBottom: '1px solid var(--admin-border)' }}>
                            <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>Order</th>
                            <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>Menu / Module</th>
                            <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>Route Path</th>
                            <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>Module Key</th>
                            <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>Status</th>
                            <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>
                              {selectedRoleForMenuMaster} Access
                            </th>
                            <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMenuAssignments.length === 0 ? (
                            <tr>
                              <td colSpan="7" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                                <i className="fa-solid fa-folder-open" style={{ fontSize: '28px', color: 'var(--admin-accent-gold)', marginBottom: '10px', display: 'block' }}></i>
                                <div>No menu items found for role '{selectedRoleForMenuMaster}'.</div>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => loadMenuMasterData(false)}
                                  style={{ marginTop: '12px', fontSize: '12px', padding: '6px 14px' }}
                                >
                                  <i className="fa-solid fa-arrows-rotate"></i> Reload Menu Master
                                </button>
                              </td>
                            </tr>
                          ) : (
                            filteredMenuAssignments.map((assignment, index) => {
                            const isGranted = selectedRoleForMenuMaster === 'Admin' || assignment.canView;
                            const matchingMenu = allMenusList.find(m => m.id === assignment.menuId);
                            const isMenuItemActive = matchingMenu ? matchingMenu.isActive : true;

                            return (
                              <tr
                                key={assignment.menuId}
                                style={{
                                  borderBottom: '1px solid var(--admin-border)',
                                  background: isGranted ? 'transparent' : 'rgba(239, 68, 68, 0.03)'
                                }}
                              >
                                <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
                                  #{assignment.displayOrder || index + 1}
                                </td>
                                <td style={{ padding: '14px 18px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div
                                      style={{
                                      width: '34px',
                                      height: '34px',
                                      borderRadius: '8px',
                                      background: isGranted ? 'var(--admin-accent-subtle)' : 'rgba(239, 68, 68, 0.1)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: isGranted ? 'var(--admin-accent-gold)' : 'var(--admin-danger)'
                                    }}
                                  >
                                    <i className={`fa-solid ${assignment.icon || 'fa-folder'}`}></i>
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--admin-text-main)' }}>
                                      {assignment.displayName || assignment.menuName}
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: 'var(--admin-text-muted)' }}>
                                      Name: {assignment.menuName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '14px 18px', fontSize: '13px', color: 'var(--admin-text-muted)' }}>
                                <code>{assignment.route}</code>
                              </td>
                              <td style={{ padding: '14px 18px', fontSize: '13px' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'var(--admin-accent-subtle)', color: 'var(--admin-accent-gold)', fontSize: '11.5px', fontWeight: 600 }}>
                                  {assignment.module}
                                </span>
                              </td>
                              <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    background: isMenuItemActive ? 'rgba(5, 150, 105, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                    color: isMenuItemActive ? 'var(--admin-success)' : 'var(--admin-danger)'
                                  }}
                                >
                                  {isMenuItemActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                <label
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: selectedRoleForMenuMaster === 'Admin' ? 'default' : 'pointer'
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isGranted}
                                    disabled={selectedRoleForMenuMaster === 'Admin'}
                                    onChange={() => toggleMenuAccessForRole(assignment.menuId)}
                                    style={{
                                      width: '18px',
                                      height: '18px',
                                      cursor: selectedRoleForMenuMaster === 'Admin' ? 'default' : 'pointer'
                                    }}
                                  />
                                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: isGranted ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                                    {isGranted ? 'Enabled' : 'Disabled'}
                                  </span>
                                </label>
                              </td>
                              <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                {isAdmin && (
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => handleOpenEditMenuModal(assignment)}
                                    style={{ padding: '5px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                    title="Edit Menu Settings"
                                  >
                                    <i className="fa-solid fa-pen-to-square"></i> Edit
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        }))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
            </div>
          )}

          {/* TAB 8: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <div id="tab-reports">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 className="section-title">Reports & Financial Analytics</h2>
                  <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px', margin: 0 }}>
                    Real-time operational revenue breakdown, booking metrics, and export data.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={loadReportsData}
                    disabled={reportsLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className={`fa-solid fa-arrows-rotate ${reportsLoading ? 'fa-spin' : ''}`}></i> Refresh Metrics
                  </button>
                  {canExportReports && (
                    <a
                      href="/api/admin/reports/export"
                      download
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                    >
                      <i className="fa-solid fa-file-excel"></i> Export Reservations (Excel/CSV)
                    </a>
                  )}
                </div>
              </div>

              {/* Stat KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                <div className="card stat-card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)', fontWeight: 600 }}>
                    Total Reservations
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-text-main)', marginTop: '8px' }}>
                    {reportsData?.totalBookings ?? bookingsData.length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-success)', marginTop: '4px' }}>
                    <i className="fa-solid fa-circle-check"></i> Monitored in PostgreSQL
                  </div>
                </div>

                <div className="card stat-card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)', fontWeight: 600 }}>
                    Gross Revenue (INR)
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-accent-gold)', marginTop: '8px' }}>
                    ₹{(reportsData?.totalRevenue ?? bookingsData.reduce((acc, b) => acc + (b.totalAmount || 0), 0)).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                    All Verified Stays & Bookings
                  </div>
                </div>

                <div className="card stat-card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)', fontWeight: 600 }}>
                    Confirmed Bookings
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-text-main)', marginTop: '8px' }}>
                    {bookingsData.filter(b => (b.bookingStatus || '').toLowerCase() === 'confirmed').length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-success)', marginTop: '4px' }}>
                    Active Guest Reservations
                  </div>
                </div>

                <div className="card stat-card" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--admin-text-muted)', fontWeight: 600 }}>
                    Pending Confirmations
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--admin-warning, #f59e0b)', marginTop: '8px' }}>
                    {bookingsData.filter(b => (b.bookingStatus || '').toLowerCase() === 'pending').length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                    Awaiting Verification
                  </div>
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className="card" style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', background: 'var(--admin-card-header-bg)', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                    Exportable Reservation Records
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>
                    Displaying up to 50 latest records
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--admin-text-muted)' }}>Booking ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--admin-text-muted)' }}>Guest Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--admin-text-muted)' }}>Room Number</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--admin-text-muted)' }}>Check-In</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--admin-text-muted)' }}>Check-Out</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: 'var(--admin-text-muted)' }}>Total Amount</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--admin-text-muted)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsData.slice(0, 50).map((b) => (
                        <tr key={b.bookingId} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{b.bookingId}</td>
                          <td style={{ padding: '12px 16px' }}>{b.guestName || b.user?.name || 'Guest'}</td>
                          <td style={{ padding: '12px 16px' }}>{b.room?.roomNumber || 'N/A'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '12.5px' }}>{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ padding: '12px 16px', fontSize: '12.5px' }}>{b.checkOut ? new Date(b.checkOut).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--admin-accent-gold)' }}>
                            ₹{(b.totalAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, background: 'var(--admin-accent-subtle)', color: 'var(--admin-accent-gold)' }}>
                              {b.bookingStatus || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADD / EDIT ROOM MODAL */}
      {(showAddRoomModal || showEditRoomModal) && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddRoomModal(false);
              setShowEditRoomModal(false);
            }
          }}
        >
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh' }}>
            <div className="modal-header">
              <h3>
                {showEditRoomModal ? 'Edit Suite Details' : 'Add New Luxury Suite'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowAddRoomModal(false);
                  setShowEditRoomModal(false);
                }}
                title="Close Dialog"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form
              onSubmit={showEditRoomModal ? handleSaveEditRoom : handleSaveAddRoom}
              style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}
            >
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Room Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={roomForm.roomNumber}
                      onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Room Type *</label>
                    <select
                      className="form-control"
                      value={roomForm.roomType}
                      onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    >
                      <option value="Deluxe Room">Deluxe Room</option>
                      <option value="Premium Room">Premium Room</option>
                      <option value="Executive Suite">Executive Suite</option>
                    </select>
                  </div>
                </div>

                <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                  <div className="form-group">
                    <label>Tariff (₹ / Night) *</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={roomForm.price}
                      onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacity (Guests)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="10"
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={roomForm.status}
                      onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide a captivating description for this luxury suite..."
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  ></textarea>
                </div>

                {/* Suite Images Upload & Previews */}
                <div className="form-group">
                  <label>Suite Images (.jpg, .jpeg, .png)</label>
                  <div
                    className="image-upload-zone"
                    onClick={() => document.getElementById('room-modal-photo-upload')?.click()}
                  >
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '24px', color: 'var(--admin-accent-gold)', marginBottom: '4px' }}></i>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-main)' }}>
                      Upload Room Images (.jpg, .jpeg, .png)
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                      Click to select photos from your device
                    </div>
                    <input
                      id="room-modal-photo-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/jpg"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleRoomPhotosUpload}
                    />
                  </div>

                  {/* Thumbnail Previews */}
                  {roomForm.images && (
                    <div className="image-preview-strip">
                      {roomForm.images.split(',').map((imgUrl, idx) => {
                        const trimmed = imgUrl.trim();
                        if (!trimmed) return null;
                        return (
                          <div key={idx} className="image-preview-thumb">
                            <img
                              src={trimmed.startsWith('data:') || trimmed.startsWith('http') || trimmed.startsWith('/') ? trimmed : `/${trimmed}`}
                              alt={`Suite ${idx + 1}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/deluxe-room.jpg';
                              }}
                            />
                            <button
                              type="button"
                              className="image-preview-remove"
                              onClick={() => handleRemoveRoomImage(idx)}
                              title="Remove photo"
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Or enter image paths e.g. images/rooms/room-101-1.jpg, images/rooms/room-101-2.jpg"
                    style={{ marginTop: '8px', fontSize: '12px' }}
                    value={roomForm.images}
                    onChange={(e) => setRoomForm({ ...roomForm, images: e.target.value })}
                  />
                </div>

                {/* 5 Key Suite Features & Facilities (Select Medium to High inside each) */}
                <div className="facilities-group-box">
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: '12px' }}>
                    5 Key Suite Facilities (Select Options from Medium to High):
                  </div>

                  <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* Feature 1 */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '11px' }}>Feature 1 (Connectivity)</label>
                      <select
                        className="form-control"
                        value={roomForm.facility1}
                        onChange={(e) => setRoomForm({ ...roomForm, facility1: e.target.value })}
                      >
                        <optgroup label="Medium / Standard Tier">
                          {(FEATURE_1_OPTIONS?.medium || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        <optgroup label="High / Luxury Tier">
                          {(FEATURE_1_OPTIONS?.high || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        {!FEATURE_1_OPTIONS?.medium?.includes(roomForm.facility1) && !FEATURE_1_OPTIONS?.high?.includes(roomForm.facility1) && roomForm.facility1 && (
                          <option value={roomForm.facility1}>{roomForm.facility1}</option>
                        )}
                      </select>
                    </div>

                    {/* Feature 2 */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '11px' }}>Feature 2 (Entertainment)</label>
                      <select
                        className="form-control"
                        value={roomForm.facility2}
                        onChange={(e) => setRoomForm({ ...roomForm, facility2: e.target.value })}
                      >
                        <optgroup label="Medium / Standard Tier">
                          {(FEATURE_2_OPTIONS?.medium || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        <optgroup label="High / Luxury Tier">
                          {(FEATURE_2_OPTIONS?.high || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        {!FEATURE_2_OPTIONS?.medium?.includes(roomForm.facility2) && !FEATURE_2_OPTIONS?.high?.includes(roomForm.facility2) && roomForm.facility2 && (
                          <option value={roomForm.facility2}>{roomForm.facility2}</option>
                        )}
                      </select>
                    </div>

                    {/* Feature 3 */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '11px' }}>Feature 3 (Comfort & Bath)</label>
                      <select
                        className="form-control"
                        value={roomForm.facility3}
                        onChange={(e) => setRoomForm({ ...roomForm, facility3: e.target.value })}
                      >
                        <optgroup label="Medium / Standard Tier">
                          {(FEATURE_3_OPTIONS?.medium || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        <optgroup label="High / Luxury Tier">
                          {(FEATURE_3_OPTIONS?.high || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        {!FEATURE_3_OPTIONS?.medium?.includes(roomForm.facility3) && !FEATURE_3_OPTIONS?.high?.includes(roomForm.facility3) && roomForm.facility3 && (
                          <option value={roomForm.facility3}>{roomForm.facility3}</option>
                        )}
                      </select>
                    </div>

                    {/* Feature 4 */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '11px' }}>Feature 4 (Hospitality & Service)</label>
                      <select
                        className="form-control"
                        value={roomForm.facility4}
                        onChange={(e) => setRoomForm({ ...roomForm, facility4: e.target.value })}
                      >
                        <optgroup label="Medium / Standard Tier">
                          {(FEATURE_4_OPTIONS?.medium || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        <optgroup label="High / Luxury Tier">
                          {(FEATURE_4_OPTIONS?.high || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        {!FEATURE_4_OPTIONS?.medium?.includes(roomForm.facility4) && !FEATURE_4_OPTIONS?.high?.includes(roomForm.facility4) && roomForm.facility4 && (
                          <option value={roomForm.facility4}>{roomForm.facility4}</option>
                        )}
                      </select>
                    </div>

                    {/* Feature 5 */}
                    <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px' }}>Feature 5 (Balcony / Exclusive Amenity / Pool)</label>
                      <select
                        className="form-control"
                        value={roomForm.facility5}
                        onChange={(e) => setRoomForm({ ...roomForm, facility5: e.target.value })}
                      >
                        <optgroup label="Medium / Standard Tier">
                          {(FEATURE_5_OPTIONS?.medium || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        <optgroup label="High / Luxury Tier">
                          {(FEATURE_5_OPTIONS?.high || []).map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                        {!FEATURE_5_OPTIONS?.medium?.includes(roomForm.facility5) && !FEATURE_5_OPTIONS?.high?.includes(roomForm.facility5) && roomForm.facility5 && (
                          <option value={roomForm.facility5}>{roomForm.facility5}</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddRoomModal(false);
                    setShowEditRoomModal(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {showEditRoomModal ? 'Save Changes' : 'Create Suite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE BOOKING STATUS MODAL */}
      {selectedBookingForStatus && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBookingForStatus(null);
          }}
        >
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3>Update Booking #{selectedBookingForStatus.bookingId || selectedBookingForStatus.BookingId}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedBookingForStatus(null)}
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSaveUpdateStatus} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div style={{ background: 'var(--admin-card-header-bg)', border: '1px solid var(--admin-border)', borderRadius: '6px', padding: '12px 14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>Guest: <strong>{selectedBookingForStatus.guestName || selectedBookingForStatus.GuestName}</strong></div>
                  <div>Amount: <strong style={{ color: 'var(--admin-accent-gold)', fontSize: '15px' }}>₹{Number(selectedBookingForStatus.totalAmount || selectedBookingForStatus.TotalAmount).toLocaleString('en-IN')}</strong></div>
                </div>

                <div className="form-group">
                  <label>Reservation Status</label>
                  <select
                    className="form-control"
                    value={updateStatusForm.status}
                    onChange={(e) => setUpdateStatusForm({ ...updateStatusForm, status: e.target.value })}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="CheckedIn">Checked In</option>
                    <option value="CheckedOut">Checked Out</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Status</label>
                  <select
                    className="form-control"
                    value={updateStatusForm.paymentStatus}
                    onChange={(e) => setUpdateStatusForm({ ...updateStatusForm, paymentStatus: e.target.value })}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Way of Payment (Payment Method)</label>
                  <select
                    className="form-control"
                    value={updateStatusForm.paymentMethod}
                    onChange={(e) => setUpdateStatusForm({ ...updateStatusForm, paymentMethod: e.target.value })}
                  >
                    <option value="Cash">Cash (Pay at Hotel / Reception)</option>
                    <option value="UPI / Online API">UPI / Online API (GPay / PhonePe / Paytm)</option>
                    <option value="Card (Debit / Credit)">Card (Debit / Credit Card)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedBookingForStatus(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingUser(null);
          }}
        >
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3>Edit User Account</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingUser(null)}
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSaveEditUser} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>System Role</label>
                  <select
                    className="form-control"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="User">Standard User / Guest</option>
                    <option value="Staff">Front Desk Staff</option>
                    <option value="Manager">Operations Manager</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={userForm.isActive ? 'true' : 'false'}
                    onChange={(e) => setUserForm({ ...userForm, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive / Deactivated</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETED ROOMS ARCHIVE MODAL */}
      {showDeletedRoomsModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeletedRoomsModal(false);
          }}
        >
          <div className="modal-content" style={{ maxWidth: '640px', maxHeight: '85vh' }}>
            <div className="modal-header">
              <h3>Deleted Suites Archive</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDeletedRoomsModal(false)}
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto' }}>
              {deletedRooms.length === 0 ? (
                <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '30px' }}>No deleted suites in archive.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Room #</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedRooms.map((r) => {
                        const id = r.roomId || r.RoomId;
                        const num = r.roomNumber || r.RoomNumber;
                        return (
                          <tr key={id}>
                            <td style={{ fontWeight: 700 }}>#{num}</td>
                            <td>{r.roomType || r.RoomType}</td>
                            <td>₹{Number(r.price || r.Price).toLocaleString('en-IN')}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                  className="btn btn-primary"
                                  style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  onClick={() => handleRestoreRoom(id, num)}
                                  title="Restore Suite"
                                >
                                  <i className="fa-solid fa-rotate-left"></i> Restore
                                </button>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px' }}
                                  onClick={() => handlePermanentDeleteRoom(id, num)}
                                  title="Delete Permanently"
                                >
                                  <i className="fa-solid fa-trash"></i> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeletedRoomsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD FOOD MODAL */}
      {showAddFoodModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddFoodModal(false);
          }}
        >
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>{editingFood ? 'Edit Gastronomy Dish' : 'Add New Gastronomy Dish'}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowAddFoodModal(false);
                  setEditingFood(null);
                }}
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSaveAddFood} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Dish Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={foodForm.name}
                    onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={foodForm.category}
                      onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Desserts & Drinks">Desserts & Drinks</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      value={foodForm.price}
                      onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Diet Tag (e.g. Veg, Non-Veg, Seafood)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={foodForm.diet}
                    onChange={(e) => setFoodForm({ ...foodForm, diet: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe the flavors and ingredients..."
                    value={foodForm.desc}
                    onChange={(e) => setFoodForm({ ...foodForm, desc: e.target.value })}
                  ></textarea>
                </div>

                {/* Dish Photo Upload & Preview */}
                <div className="form-group">
                  <label>Dish Photo (.jpg, .jpeg, .png)</label>
                  <div
                    className="image-upload-zone"
                    onClick={() => document.getElementById('food-modal-photo-upload')?.click()}
                  >
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '22px', color: 'var(--admin-accent-gold)', marginBottom: '4px' }}></i>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-main)' }}>
                      {foodForm.image ? 'Change Dish Photo' : 'Upload Dish Photo (.jpg, .jpeg, .png)'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                      Click to select image file from your device
                    </div>
                    <input
                      id="food-modal-photo-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/jpg"
                      style={{ display: 'none' }}
                      onChange={handleFoodPhotoUpload}
                    />
                  </div>

                  {foodForm.image && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="image-preview-thumb" style={{ width: '80px', height: '60px' }}>
                        <img
                          src={foodForm.image.startsWith('data:') || foodForm.image.startsWith('http') || foodForm.image.startsWith('/') ? foodForm.image : `/${foodForm.image}`}
                          alt="Dish Preview"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/deluxe-room.jpg';
                          }}
                        />
                        <button
                          type="button"
                          className="image-preview-remove"
                          onClick={() => setFoodForm((prev) => ({ ...prev, image: '' }))}
                          title="Remove photo"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--admin-text-muted)' }}>Photo selected</span>
                    </div>
                  )}

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Or enter image path e.g. images/food/paneer-butter-masala.jpg"
                    style={{ marginTop: '8px', fontSize: '12px' }}
                    value={foodForm.image}
                    onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddFoodModal(false);
                    setEditingFood(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFood ? 'Update Dish' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETED FOOD ARCHIVE MODAL */}
      {showDeletedFoodModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeletedFoodModal(false);
          }}
        >
          <div className="modal-content" style={{ maxWidth: '540px', maxHeight: '85vh' }}>
            <div className="modal-header">
              <h3>Deleted Dishes Archive</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDeletedFoodModal(false)}
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto' }}>
              {deletedFood.length === 0 ? (
                <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '20px' }}>No deleted dishes in archive.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Dish Name</th>
                        <th>Category</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedFood.map((f) => (
                        <tr key={f.name}>
                          <td style={{ fontWeight: 600 }}>{f.name}</td>
                          <td>{f.category}</td>
                          <td>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleRestoreFood(f.name)}
                            >
                              <i className="fa-solid fa-rotate-left"></i> Restore
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeletedFoodModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW MENU MODAL */}
      {showAddMenuModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddMenuModal(false);
          }}
        >
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Create New Menu / Module</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddMenuModal(false)}
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleCreateMenu} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Menu Technical Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spa, Events, Invoices"
                    value={menuFormData.name}
                    onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Display Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spa & Wellness Suite"
                    value={menuFormData.displayName}
                    onChange={(e) => setMenuFormData({ ...menuFormData, displayName: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Module Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spa"
                    value={menuFormData.module}
                    onChange={(e) => setMenuFormData({ ...menuFormData, module: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Route / Hash *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. /admin#spa"
                      value={menuFormData.route}
                      onChange={(e) => setMenuFormData({ ...menuFormData, route: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      FontAwesome Icon
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. fa-spa"
                      value={menuFormData.icon}
                      onChange={(e) => setMenuFormData({ ...menuFormData, icon: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={menuFormData.displayOrder}
                      onChange={(e) => setMenuFormData({ ...menuFormData, displayOrder: parseInt(e.target.value) || 1 })}
                      className="form-control"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                    />
                  </div>
                  <div style={{ paddingTop: '18px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={menuFormData.isActive}
                        onChange={(e) => setMenuFormData({ ...menuFormData, isActive: e.target.checked })}
                      />
                      Is Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--admin-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddMenuModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MENU SETTINGS MODAL */}
      {showEditMenuModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditMenuModal(false);
          }}
        >
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Edit Menu Settings</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowEditMenuModal(false)}
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSaveEditMenu} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Menu Technical Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMenuFormData.name}
                    onChange={(e) => setEditMenuFormData({ ...editMenuFormData, name: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Display Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMenuFormData.displayName}
                    onChange={(e) => setEditMenuFormData({ ...editMenuFormData, displayName: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Module Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMenuFormData.module}
                    onChange={(e) => setEditMenuFormData({ ...editMenuFormData, module: e.target.value })}
                    className="form-control"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Route / Hash *
                    </label>
                    <input
                      type="text"
                      required
                      value={editMenuFormData.route}
                      onChange={(e) => setEditMenuFormData({ ...editMenuFormData, route: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      FontAwesome Icon
                    </label>
                    <input
                      type="text"
                      value={editMenuFormData.icon}
                      onChange={(e) => setEditMenuFormData({ ...editMenuFormData, icon: e.target.value })}
                      className="form-control"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={editMenuFormData.displayOrder}
                      onChange={(e) => setEditMenuFormData({ ...editMenuFormData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                      className="form-control"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                    />
                  </div>
                  <div style={{ paddingTop: '18px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={editMenuFormData.isActive}
                        onChange={(e) => setEditMenuFormData({ ...editMenuFormData, isActive: e.target.checked })}
                      />
                      Is Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--admin-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditMenuModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={menuMasterSaving}>
                  {menuMasterSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
