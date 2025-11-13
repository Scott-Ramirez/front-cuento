import React from 'react';
import { BookOpen, Heart, Github, Twitter, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <BookOpen className="text-primary-400 group-hover:text-primary-300 transition-colors" size={36} />
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                MyCuento
              </span>
            </Link>
            <p className="text-gray-400 mb-6 text-lg max-w-md leading-relaxed">
              Tu espacio para crear, compartir y descubrir historias increíbles. 
              Una plataforma hecha por escritores, para escritores.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
                <Sparkles size={18} className="text-yellow-400" />
                <span className="text-sm font-medium">100% Gratis</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
                <Heart size={18} className="text-red-400" />
                <span className="text-sm font-medium">Comunidad Activa</span>
              </div>
            </div>
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="mailto:contacto@mycuento.com"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Navegación</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-400 transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Recursos</h3>
            <ul className="space-y-3">
              <li>
                <button className="hover:text-primary-400 transition-colors flex items-center gap-2 group text-left">
                  <span className="w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Guía para Escritores
                </button>
              </li>
              <li>
                <button className="hover:text-primary-400 transition-colors flex items-center gap-2 group text-left">
                  <span className="w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Términos y Condiciones
                </button>
              </li>
              <li>
                <button className="hover:text-primary-400 transition-colors flex items-center gap-2 group text-left">
                  <span className="w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Política de Privacidad
                </button>
              </li>
              <li>
                <button className="hover:text-primary-400 transition-colors flex items-center gap-2 group text-left">
                  <span className="w-1 h-1 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Contacto
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; 2025 <span className="text-primary-400 font-semibold">MyCuento</span>. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              Hecho con <Heart size={16} className="text-red-500 animate-pulse" /> para escritores apasionados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
