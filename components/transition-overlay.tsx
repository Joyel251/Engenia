import React from 'react';

export const TransitionOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-black animate-fade-in" />
  );
};
