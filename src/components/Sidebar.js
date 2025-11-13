import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Compass, 
  PenTool, 
  User, 
  LogOut,
  Menu,
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/api';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Mis Cuentos' },
    { path: '/create', icon: PenTool, label: 'Crear Cuento' },
    { path: '/explore', icon: Compass, label: 'Explorar' },
    { path: '/profile', icon: User, label: 'Mi Perfil' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-gray-900 text-white
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">MyCuento</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={getAvatarUrl(user.avatar)}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full bg-primary-600 rounded-full flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary-600 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{user?.username}</p>
                <p className="text-xs text-gray-400">Autor</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for main content (hidden on mobile when sidebar is collapsed) */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
};

export default Sidebar;
