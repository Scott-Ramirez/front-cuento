import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, BookOpen, Sparkles, Users, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess, showWarning } from '../utils/alerts';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      const msg = 'Las contraseñas no coinciden';
      setError(msg);
      showWarning(msg);
      return;
    }

    if (formData.password.length < 6) {
      const msg = 'La contraseña debe tener al menos 6 caracteres';
      setError(msg);
      showWarning(msg);
      return;
    }

    setLoading(true);
    const result = await register(formData.email, formData.username, formData.password);

    if (result.success) {
      showSuccess('Tu cuenta ha sido creada exitosamente', '¡Bienvenido a StoryForge!');
      navigate('/dashboard');
    } else {
      setError(result.error);
      showError(result.error || 'Error al crear la cuenta');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Features */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-700 to-primary-900 flex items-center justify-center p-12">
          <div className="max-w-md text-white space-y-12">
            <div>
              <h3 className="text-4xl font-bold mb-4">
                Comienza tu viaje
              </h3>
              <p className="text-primary-100 text-lg">
                Tu próxima gran historia empieza aquí
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 flex-shrink-0">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Crea sin límites</h4>
                  <p className="text-primary-100 text-sm">Publica cuando quieras</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 flex-shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Construye audiencia</h4>
                  <p className="text-primary-100 text-sm">Lectores que aman tu estilo</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 flex-shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Recibe feedback</h4>
                  <p className="text-primary-100 text-sm">Mejora con la comunidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div>
            <Link to="/" className="flex items-center justify-center gap-2 mb-8">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">MyCuento</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">
              Crear Cuenta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Únete gratis a la comunidad
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-md">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    minLength={3}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    placeholder="usuario123"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  <UserPlus size={20} />
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
                </span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
