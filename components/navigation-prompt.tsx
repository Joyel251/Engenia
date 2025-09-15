import React from 'react';

interface NavigationPromptProps {
  onNavigate: () => void;
}

export const NavigationPrompt: React.FC<NavigationPromptProps> = ({ onNavigate }) => {
  return (
    <div className="mt-8">
      <div 
        onClick={onNavigate}
        className="cursor-pointer px-8 py-3 border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300 text-white"
      >
        Click to Continue
      </div>
    </div>
  );
};
