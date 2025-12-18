import React from 'react';
import useHome from '../hooks/useHome';

import LoadingSpinner from '../components/common/LoadingSpinner';
import HeroSection from '../components/home/HeroSection';
import StoriesSection from '../components/home/StoriesSection';

const Home = () => {
  const {
    stories,
    loading,
    displayedStories,
    handleStoryClick,
    nextSlide,
    prevSlide,
  } = useHome();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white">
      <HeroSection />
      
      <StoriesSection
        stories={stories}
        displayedStories={displayedStories}
        onStoryClick={handleStoryClick}
        onPrevSlide={prevSlide}
        onNextSlide={nextSlide}
      />
    </div>
  );
};

export default Home;
