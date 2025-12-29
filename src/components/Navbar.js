import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, BookOpen, Menu, X, LogOut, User, Home, Compass, LayoutDashboard, PlusCircle, RefreshCw, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [releaseNoteNotifications, setReleaseNoteNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userStats, setUserStats] = useState({ totalStories: 0, lastUpdate: null });
  const notificationRef = useRef(null);

  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      if (isDashboard) {
        fetchUserStats();
      }
      // Actualizar contador cada 30 segundos
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (isDashboard) {
          fetchUserStats();
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isDashboard]);

  useEffect(() => {
    if (showNotifications && isAuthenticated) {
      fetchNotifications();
      fetchReleaseNoteNotifications();
    }
  }, [showNotifications, isAuthenticated]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchReleaseNoteNotifications = async () => {
    try {
      const response = await api.get('/notifications/release-notes');
      setReleaseNoteNotifications(response.data);
    } catch (error) {
      console.error('Error fetching release note notifications:', error);
      // En caso de error, mostrar datos vacíos
      setReleaseNoteNotifications([]);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/stories/my-stories');
      const stories = Array.isArray(response.data) ? response.data : [];
      setUserStats({
        totalStories: stories.length,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleRefresh = () => {
    if (isDashboard) {
      fetchUserStats();
    }
    fetchUnreadCount();
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleNotificationClick = async (notification) => {
    // Para release notes, solo cerrar el panel de notificaciones
    if (notification.type === 'release_note') {
      setShowNotifications(false);
      return;
    }

    // Marcar como leída solo si es una notificación regular
    if (!notification.is_read) {
      try {
        await api.put(`/notifications/${notification.id}/read`);
        fetchUnreadCount();
        fetchNotifications();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navegar a la vista correspondiente
    setShowNotifications(false);
    navigate(`/stories/${notification.story_id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNotificationText = (notification) => {
    if (notification.type === 'release_note') {
      return `Nueva actualización: ${notification.title}`;
    }
    
    const username = notification.triggered_by?.username || 'Alguien';
    switch (notification.type) {
      case 'like':
        return `${username} dio like a tu cuento`;
      case 'comment':
        return `${username} comentó en tu cuento`;
      case 'reply':
        return `${username} respondió a tu comentario`;
      default:
        return 'Nueva notificación';
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.type === 'release_note') {
      const typeColorMap = {
        'major': 'text-red-500',
        'security': 'text-orange-500',
        'minor': 'text-blue-500',
        'patch': 'text-green-500'
      };
      return (
        <RefreshCw className={`h-4 w-4 ${typeColorMap[notification.releaseType] || 'text-gray-500'}`} />
      );
    }
    return <Bell className="h-4 w-4 text-blue-500" />;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' años';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' meses';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' días';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' horas';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutos';
    
    return 'Ahora';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="text-primary-600" size={32} />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              MyCuento
            </span>
          </Link>

          {/* Right Side - Auth Buttons for non-authenticated users */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-6 py-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                Registrarse
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* User Info for Dashboard */}
              {isDashboard && (
                <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-primary-600" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        ¡Hola, {user?.username || 'Usuario'}!
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        Tienes {userStats.totalStories} {userStats.totalStories === 1 ? 'cuento' : 'cuentos'}
                        {userStats.lastUpdate && (
                          <span className="text-xs text-gray-500">
                            • Act. {formatTime(userStats.lastUpdate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    title="Actualizar"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              )}

              {/* Create Story Button */}
              <Link
                to="/create"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusCircle size={20} />
                <span>Crear Cuento</span>
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Bell size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900">Notificaciones</h3>
                      </div>
                      {notifications.length === 0 && releaseNoteNotifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No tienes notificaciones
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {/* Release Notes como notificaciones especiales */}
                          {releaseNoteNotifications.map((notification) => (
                            <div
                              key={`release-${notification.id}`}
                              onClick={() => handleNotificationClick(notification)}
                              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  {getNotificationIcon(notification)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm text-gray-900 font-semibold">
                                      {getNotificationText(notification)}
                                    </p>
                                    {notification.isNew && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ¡Nuevo!
                                      </span>
                                    )}
                                  </div>
                                  {notification.summary && (
                                    <p className="text-xs text-gray-600 mb-1">
                                      {notification.summary.substring(0, 100)}...
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      notification.releaseType === 'major' ? 'bg-red-100 text-red-800' :
                                      notification.releaseType === 'security' ? 'bg-orange-100 text-orange-800' :
                                      notification.releaseType === 'minor' ? 'bg-blue-100 text-blue-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      v{notification.version}
                                    </span>
                                    <p className="text-xs text-gray-400">
                                      {getTimeAgo(notification.releaseDate)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Separador si hay ambos tipos de notificaciones */}
                          {releaseNoteNotifications.length > 0 && notifications.length > 0 && (
                            <div className="px-4 py-2 bg-gray-50">
                              <p className="text-xs text-gray-500 font-medium">Actividad de tus cuentos</p>
                            </div>
                          )}

                          {/* Notificaciones regulares */}
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                !notification.is_read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-medium text-sm">
                                    {notification.triggered_by?.username?.[0]?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 font-medium">
                                    {getNotificationText(notification)}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {notification.story?.title}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {getTimeAgo(notification.created_at)}
                                  </p>
                                </div>
                                {!notification.is_read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="hidden md:flex items-center gap-2">
                  {/* Admin Panel Link */}
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                      title="Panel de Administración"
                    >
                      <Settings size={18} />
                      <span className="text-sm">Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <User size={20} />
                    <span>{user?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-700 hover:text-red-600 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut size={20} />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-gray-700"
                >
                  {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            )}
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && isAuthenticated && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                <Home size={20} />
                <span>Inicio</span>
              </Link>
              <Link
                to="/explore"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                <Compass size={20} />
                <span>Explorar</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/stories/create"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                <PlusCircle size={20} />
                <span>Crear Cuento</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                <User size={20} />
                <span>Perfil</span>
              </Link>
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Settings size={20} />
                  <span>Admin Panel</span>
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
