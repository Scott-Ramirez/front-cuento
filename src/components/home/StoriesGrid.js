import React from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import StoryCard from './StoryCard';

const StoriesGrid = ({ 
  stories, 
  displayedStories, 
  onStoryClick, 
  onPrevSlide, 
  onNextSlide 
}) => {
  if (stories.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">
          No hay historias publicadas aún
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedStories.map((story) => (
          <StoryCard 
            key={story.id} 
            story={story} 
            onClick={onStoryClick}
          />
        ))}
      </div>

      {stories.length > 4 && (
        <>
          <button
            onClick={onPrevSlide}
            className="absolute -left-6 top-1/2 bg-white p-3 rounded-full shadow hover:shadow-lg transition-shadow"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={onNextSlide}
            className="absolute -right-6 top-1/2 bg-white p-3 rounded-full shadow hover:shadow-lg transition-shadow"
          >
            <ChevronRight />
          </button>
        </>
      )}
    </div>
  );
};

export default StoriesGrid;