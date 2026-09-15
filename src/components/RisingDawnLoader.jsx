// src/components/RisingDawnLoader.jsx
// Feather-light, instant transition loader (replaces heavy sunrise canvas simulation)
import React from 'react';
import InstantPageLoader from './InstantPageLoader';

export default function RisingDawnLoader(props) {
  return <InstantPageLoader {...props} />;
}

export { RisingDawnLoader, InstantPageLoader as ParticleConvergenceLoader };
