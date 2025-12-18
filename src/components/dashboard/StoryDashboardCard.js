import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Heart,
  MessageCircle,
  Trash2,
  Book,
  Globe,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

const StoryDashboardCard = ({ story, onDelete, onPublish }) => {
  const isPublished = story.status === 'published';

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleTogglePublish = () => {
    onPublish(story.id, story.status);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* IMAGEN */}
      <div className="relative h-64 bg-gray-200">
        {story.cover_image ? (
          <img
            src={getMediaUrl(story.cover_image)}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <Book size={48} className="text-gray-600" />
          </div>
        )}

        {/* BADGE ESTADO */}
        <div
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold ${
            isPublished ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
          }`}
        >
          <div className="flex items-center gap-1">
            {isPublished ? <Globe size={12} /> : <Lock size={12} />}
            {isPublished ? 'Publicado' : 'Borrador'}
          </div>
        </div>

        {/* STATS en la parte baja de la imagen */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span className="text-sm font-medium">{story.views_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={16} />
                <span className="text-sm font-medium">{story.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle size={16} />
                <span className="text-sm font-medium">{story.comments_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="p-5">
        {/* TÍTULO */}
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">
          {story.title}
        </h3>

        {/* FECHA */}
        <div className="mb-6">
          <span className="text-sm text-gray-600">
            Creado: {formatDate(story.created_at)}
          </span>
        </div>

        {/* SWITCH */}
        <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            {isPublished ? 'Cuento publicado' : 'Cuento en borrador'}
          </span>

          <button
            onClick={handleTogglePublish}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPublished ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublished ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* BOTONES */}
        <div className="flex gap-3">
          <Link
            to={`/story/${story.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
            Ver cuento
          </Link>

          <button
            onClick={() => onDelete(story.id)}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            title="Eliminar cuento"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryDashboardCard;
