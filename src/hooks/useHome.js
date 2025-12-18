import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showWarning } from '../utils/alerts';

const useHome = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await api.get('/stories');
      setStories(Array.isArray(data) ? data.slice(0, 8) : []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([]);
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

  const totalPages = Math.ceil((stories?.length || 0) / 4);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(totalPages, 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(totalPages, 1)) % Math.max(totalPages, 1));
  };

  const displayedStories = Array.isArray(stories) ? stories.slice(
    currentSlide * 4,
    currentSlide * 4 + 4
  ) : [];

  return {
    stories,
    loading,
    currentSlide,
    displayedStories,
    handleStoryClick,
    nextSlide,
    prevSlide,
    totalPages,
    fetchStories,
  };
};

export default useHome;