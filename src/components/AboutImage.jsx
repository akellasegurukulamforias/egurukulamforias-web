import React, { useState } from 'react';

export function AboutImage({ baseName, alt, className = "", containerClassName = "" }) {
  const extensions = ['.png', '.webp', '.jpg', '.jpeg', '.svg'];
  const sources = extensions.map(ext => `/images/${baseName}${ext}`);

  const [sourceIndex, setSourceIndex] = useState(0);

  const handleError = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex(prev => prev + 1);
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${containerClassName}`}>
      <img
        src={sources[sourceIndex]}
        alt={alt}
        onError={handleError}
        className={`about-blend-image object-contain ${className}`}
      />
    </div>
  );
}

export default AboutImage;
