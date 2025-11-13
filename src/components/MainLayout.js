import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import AdminFooter from './AdminFooter';
import NotificationNavbar from './NotificationNavbar';

const MainLayout = ({ children, isAdminRoute = false }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Detectar si es una ruta de detalle de historia vista por usuario autenticado
  const isStoryDetail = location.pathname.startsWith('/stories/');
  const shouldUseAdminLayout = user && (isAdminRoute || isStoryDetail);

  // Admin layout with sidebar (for authenticated users viewing stories or admin routes)
  if (shouldUseAdminLayout) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-0 flex flex-col">
          <NotificationNavbar />
          <main className="flex-1">
            {children}
          </main>
          <AdminFooter />
        </div>
      </div>
    );
  }

  // Public layout with navbar and full footer
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
