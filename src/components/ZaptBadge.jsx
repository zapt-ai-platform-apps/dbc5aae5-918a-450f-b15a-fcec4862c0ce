import React from 'react';

const ZaptBadge = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <a 
        href="https://www.zapt.ai" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-xs text-gray-600 hover:text-gray-800"
      >
        Made on ZAPT
      </a>
    </div>
  );
};

export default ZaptBadge;