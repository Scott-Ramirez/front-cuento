import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1481627834876-b7833e8f5570)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-purple-900/85 to-primary-900/90" />
      </div>

      <div className="relative z-10 text-center max-w-5xl px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Bienvenido a{' '}
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            MyCuento
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-10">
          Donde las historias cobran vida. Crea, comparte y descubre cuentos
          únicos.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/register"
            className="px-10 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-bold shadow-xl hover:scale-105 transition"
          >
            Comenzar Ahora
          </Link>

          <Link
            to="/login"
            className="px-10 py-4 bg-white/10 text-white border-2 border-white rounded-lg font-bold hover:bg-white/20 transition"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;