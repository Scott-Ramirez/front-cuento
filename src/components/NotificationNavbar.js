import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { API_URL } from '../services/api';

const NotificationNavbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return '';
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    if (avatar.startsWith('/')) {
      return `${API_URL}${avatar}`;
    }
    return `${API_URL}/${avatar}`;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Actualizar contador cada 30 segundos
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (showNotifications && isAuthenticated) {
      fetchNotifications();
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
      const response = await api.get('/notifications?unread=true');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Marcar como leída
    try {
      await api.put(`/notifications/${notification.id}/read`);
      // Actualizar lista y contador
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    // Navegar a la vista correspondiente
    setShowNotifications(false);
    navigate(`/stories/${notification.story_id}`);
  };

  const getNotificationText = (notification) => {
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[32rem] overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-purple-50">
                  <h3 className="font-bold text-gray-900 text-lg">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {unreadCount} {unreadCount === 1 ? 'nueva' : 'nuevas'}
                    </p>
                  )}
                </div>
                
                <div className="overflow-y-auto max-h-[28rem]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No tienes notificaciones por ahora</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-all bg-blue-50 border-l-4 border-blue-500"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                              {notification.triggered_by?.avatar ? (
                                <img
                                  src={getAvatarUrl(notification.triggered_by.avatar)}
                                  alt={notification.triggered_by.username}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center"><span class="text-white font-bold text-lg">' + (notification.triggered_by?.username?.[0]?.toUpperCase() || 'U') + '</span></div>';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    {notification.triggered_by?.username?.[0]?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 mb-1">
                                {getNotificationText(notification)}
                              </p>
                              <p className="text-sm text-gray-600 truncate mb-1">
                                "{notification.story?.title}"
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-400">
                                  {getTimeAgo(notification.created_at)}
                                </p>
                                <span className="text-xs text-blue-600 font-medium">• Nueva</span>
                              </div>
                            </div>
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={async () => {
                        try {
                          await api.put('/notifications/read-all');
                          fetchUnreadCount();
                          fetchNotifications();
                        } catch (error) {
                          console.error('Error marking all as read:', error);
                        }
                      }}
                      className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2 hover:bg-primary-50 rounded transition-colors"
                    >
                      Marcar todas como leídas
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationNavbar;
