import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, BookOpen, Award, TrendingUp, Users, Sparkles, ChevronLeft, ChevronRight, Book } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showWarning } from '../utils/alerts';

const Home = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStories = async () => {
    try {
      const response = await api.get('/stories');
      // Limitar a 8 historias para el carrusel (2 páginas de 4)
      setStories(response.data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (e, storyId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showWarning('Necesitas iniciar sesión para ver los cuentos completos', 'Inicia sesión');
      navigate('/login');
    } else {
      navigate(`/read/${storyId}`);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(stories.length / 4));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(stories.length / 4)) % Math.ceil(stories.length / 4));
  };

  // Obtener las 4 historias de la página actual
  const displayedStories = stories.slice(currentSlide * 4, currentSlide * 4 + 4);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section con imagen de fondo */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image con Opacidad */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2128&q=80)',
          }}
        >
          {/* Overlay con gradiente para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-purple-900/85 to-primary-900/90"></div>
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Bienvenido a <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">MyCuento</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            Donde las historias cobran vida. Crea, comparte y descubre cuentos únicos en una comunidad de escritores apasionados.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link
              to="/register"
              className="px-10 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-primary-500/50 transform hover:scale-105"
            >
              Comenzar Ahora
            </Link>
            <Link
              to="/login"
              className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg hover:bg-white/20 transition-all duration-300 font-bold text-lg shadow-2xl"
            >
              Iniciar Sesión
            </Link>
          </div>
          
          {/* Stats o Features rápidas */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{stories.length}+</div>
              <div className="text-gray-300 font-medium">Historias</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-300 font-medium">Gratis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">∞</div>
              <div className="text-gray-300 font-medium">Creatividad</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* Resto del contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Historias Recientes</h2>
          <p className="text-gray-600">Explora los últimos cuentos publicados por nuestra comunidad</p>
        </div>

        {/* Stories Carousel */}
        {stories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-gray-500 text-lg mb-4">No hay cuentos publicados todavía</p>
            <p className="text-gray-400">¡Sé el primero en compartir tu historia!</p>
          </div>
        ) : (
          <div className="relative">
            {/* Carrusel Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedStories.map((story) => (
                <div
                  key={story.id}
                  className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={(e) => handleStoryClick(e, story.id)}
                >
                  {/* Cover Image con overlay - estilo Explore */}
                  <div className="relative h-80 bg-gray-200 overflow-hidden">
                    {story.cover_image ? (
                      <img
                        src={`http://localhost:3000${story.cover_image}`}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                        <Book size={64} className="text-white opacity-50" />
                      </div>
                    )}
                    
                    {/* Overlay oscuro al hacer hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-300"></div>

                    {/* Autor en la parte superior izquierda */}
                    <div className="absolute top-3 left-3">
                      <p className="text-white text-xs bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                        {story.user?.username || 'Anónimo'}
                      </p>
                    </div>

                    {/* Stats en la parte superior derecha */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
                        <Eye size={14} />
                        <span>{story.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
                        <Heart size={14} className="text-red-400" />
                        <span>{story.likes_count || story.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
                        <MessageCircle size={14} className="text-blue-400" />
                        <span>{story.comments_count || story.comments?.length || 0}</span>
                      </div>
                    </div>

                    {/* Título en la parte inferior */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg mb-1 line-clamp-2 drop-shadow-lg">
                        {story.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            {stories.length > 4 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                  aria-label="Anterior"
                >
                  <ChevronLeft size={24} className="text-gray-800" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                  aria-label="Siguiente"
                >
                  <ChevronRight size={24} className="text-gray-800" />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {stories.length > 4 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.ceil(stories.length / 4) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index ? 'w-8 bg-primary-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Ir a página ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* How it works Section */}
          <div className="mt-24 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
              <p className="text-xl text-gray-600">Comienza tu viaje en 3 simples pasos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Crea tu cuenta</h3>
                <p className="text-gray-600">
                  Regístrate gratis en segundos y únete a nuestra comunidad de escritores
                </p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-primary-600">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Escribe tu historia</h3>
                <p className="text-gray-600">
                  Usa nuestro editor intuitivo para crear y publicar tus cuentos
                </p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-primary-600">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Comparte y conecta</h3>
                <p className="text-gray-600">
                  Recibe likes, comentarios y construye tu audiencia de lectores
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24 mb-16 bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué MyCuento?</h2>
              <p className="text-xl text-gray-600">La plataforma perfecta para escritores creativos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <Sparkles className="text-primary-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Editor Intuitivo</h3>
                <p className="text-gray-600 text-sm">
                  Herramientas sencillas para escribir y formatear tus historias
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <Users className="text-primary-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Comunidad Activa</h3>
                <p className="text-gray-600 text-sm">
                  Interactúa con lectores y otros escritores apasionados
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <TrendingUp className="text-primary-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Estadísticas</h3>
                <p className="text-gray-600 text-sm">
                  Monitorea vistas, likes y el engagement de tus historias
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <Award className="text-primary-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">100% Gratis</h3>
                <p className="text-gray-600 text-sm">
                  Sin límites ni restricciones, publica todo lo que quieras
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 mb-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">¿Listo para compartir tu historia?</h2>
            <p className="text-xl mb-8 text-primary-100">
              Únete a cientos de escritores que ya están compartiendo sus creaciones
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
            >
              Comenzar Ahora - Es Gratis
            </Link>
          </div>
      </div>
    </div>
  );
};

export default Home;
