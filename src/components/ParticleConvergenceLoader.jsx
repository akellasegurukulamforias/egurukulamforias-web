// src/components/ParticleConvergenceLoader.jsx
// Feather-light, instant transition loader (replaces heavy 380-particle canvas simulation)
import React from 'react';
import InstantPageLoader from './InstantPageLoader';

export default function ParticleConvergenceLoader(props) {
  return <InstantPageLoader {...props} />;
}

export { InstantPageLoader };
