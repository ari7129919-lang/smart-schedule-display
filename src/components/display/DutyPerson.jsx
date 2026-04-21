import React from 'react';
import LeafIcon from './LeafIcon';

export default function DutyPerson({ 
  name = '', 
  screenScale = 1 
}) {
  return (
    <div 
      className="bg-white/85 rounded-3xl p-6"
      style={{ 
        boxShadow: 'var(--shadow-soft)',
        padding: `${24 * screenScale}px`
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <LeafIcon single size={20 * screenScale} color="#7A86A8" />
        <h3 
          className="text-primary font-medium"
          style={{ fontSize: `${26 * screenScale}px` }}
        >
          אחראי שותפים
        </h3>
      </div>
      
      <div 
        className="text-primary font-medium text-center py-3 bg-accent/10 rounded-xl"
        style={{ fontSize: `${30 * screenScale}px` }}
      >
        {name || 'לא הוגדר'}
      </div>
    </div>
  );
}