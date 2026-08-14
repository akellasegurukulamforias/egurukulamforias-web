import React, { useState } from 'react';

export default function HeroImage() {
  const sources = [
    '/images/Hero_Section.png',
    '/images/Hero_Section.webp',
    '/images/Hero_Section.jpg',
    '/images/hero_section.png',
    '/images/hero_section.webp',
    '/images/hero_section.jpg'
  ];

  const [sourceIndex, setSourceIndex] = useState(0);

  const handleError = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex(prev => prev + 1);
    }
  };

  return (
    <div className="hero-image-container relative flex justify-center items-center w-full h-full min-h-[380px]">
      <img
        src={sources[sourceIndex]}
        alt="Gurukulam Learning"
        onError={handleError}
        className="w-full h-auto max-w-[720px] object-contain hero-blend-image"
      />
    </div>
  );
}
