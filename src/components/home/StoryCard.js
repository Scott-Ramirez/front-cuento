import React from 'react';
import { Heart, MessageCircle, Eye, Book } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

const StoryCard = ({ story, onClick }) => {
  return (
    <div
      onClick={(e) => onClick(e, story.id)}
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
  );
};

export default StoryCard;