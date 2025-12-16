import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getMediaUrl } from '../utils/media';

const NotificationNavbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (showNotifications && isAuthenticated) {
      fetchNotifications();
    }
  }, [showNotifications, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get('/notifications/count');
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?unread=true');
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await api.put(`/notifications/${notification.id}/read`);
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

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
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

    const intervals = [
      { label: 'año', seconds: 31536000 },
      { label: 'mes', seconds: 2592000 },
      { label: 'día', seconds: 86400 },
      { label: 'hora', seconds: 3600 },
      { label: 'minuto', seconds: 60 },
    ];

    for (const i of intervals) {
      const value = Math.floor(seconds / i.seconds);
      if (value >= 1) {
        return `${value} ${i.label}${value > 1 ? 's' : ''}`;
      }
    }

    return 'Ahora';
  };

  if (!isAuthenticated) return null;

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-end items-center h-16">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-gray-100 text-gray-700"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-bold">Notificaciones</h3>
                </div>

                <div className="max-h-[28rem] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No tienes notificaciones
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className="p-4 cursor-pointer hover:bg-gray-50 border-l-4 border-blue-500 bg-blue-50"
                      >
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            {n.triggered_by?.avatar ? (
                              <img
                                src={getMediaUrl(n.triggered_by.avatar)}
                                alt={n.triggered_by.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white font-bold">
                                {n.triggered_by?.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {getNotificationText(n)}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              “{n.story?.title}”
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {getTimeAgo(n.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 border-t bg-gray-50">
                    <button
                      onClick={async () => {
                        await api.put('/notifications/read-all');
                        fetchUnreadCount();
                        fetchNotifications();
                      }}
                      className="w-full text-sm text-primary-600 font-medium hover:bg-primary-50 py-2 rounded"
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
