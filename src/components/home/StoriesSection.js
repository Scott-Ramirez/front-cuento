import React from 'react';
import StoriesGrid from './StoriesGrid';

const StoriesSection = ({
  stories,
  displayedStories,
  onStoryClick,
  onPrevSlide,
  onNextSlide,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">
        Historias Recientes
      </h2>

      <StoriesGrid
        stories={stories}
        displayedStories={displayedStories}
        onStoryClick={onStoryClick}
        onPrevSlide={onPrevSlide}
        onNextSlide={onNextSlide}
      />
    </div>
  );
};

export default StoriesSection;