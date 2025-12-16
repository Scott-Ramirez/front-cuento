// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Eye,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Book,
} from 'lucide-react';

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showWarning } from '../utils/alerts';
import { getMediaUrl } from '../utils/media';

const Home = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await api.get('/stories');
      setStories(data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (e, storyId) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showWarning(
        'Necesitas iniciar sesión para ver los cuentos completos',
        'Inicia sesión'
      );
      navigate('/login');
      return;
    }

    navigate(`/read/${storyId}`);
  };

  const totalPages = Math.ceil(stories.length / 4);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const displayedStories = stories.slice(
    currentSlide * 4,
    currentSlide * 4 + 4
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* HERO */}
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

      {/* STORIES */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Historias Recientes
        </h2>

        {stories.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">
              No hay historias publicadas aún
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedStories.map((story) => (
                <div
                  key={story.id}
                  onClick={(e) => handleStoryClick(e, story.id)}
                  className="cursor-pointer group bg-white rounded-lg shadow hover:shadow-xl transition"
                >
                  <div className="relative h-80 overflow-hidden bg-gray-200">
                    {story.cover_image ? (
                      <img
                        src={getMediaUrl(story.cover_image)}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                        <Book size={64} className="text-white opacity-50" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    <div className="absolute top-3 left-3 text-xs text-white bg-black/60 px-3 py-1 rounded-full">
                      {story.user?.username || 'Anónimo'}
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2 text-white text-xs">
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                        <Eye size={14} /> {story.views_count || 0}
                      </div>
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                        <Heart size={14} className="text-red-400" />
                        {story.likes?.length || 0}
                      </div>
                      <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                        <MessageCircle size={14} className="text-blue-400" />
                        {story.comments?.length || 0}
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold line-clamp-2">
                        {story.title}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {stories.length > 4 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute -left-6 top-1/2 bg-white p-3 rounded-full shadow"
                >
                  <ChevronLeft />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute -right-6 top-1/2 bg-white p-3 rounded-full shadow"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
