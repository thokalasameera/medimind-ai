import React from 'react';

const GlassCard = ({ 
  children, 
  className = '', 
  glowColor = 'cyan', // 'cyan', 'emerald', 'purple', 'crimson', 'none'
  onClick,
  title,
  headerActions
}) => {
  
  // Custom futuristic border glowing maps
  const glowClasses = {
    cyan: 'glow-border-cyan',
    emerald: 'glow-border-emerald',
    purple: 'glow-border-purple',
    crimson: 'glow-border-crimson',
    none: 'border-slate-200/10 dark:border-slate-800/20'
  };

  const selectedGlow = glowClasses[glowColor] || glowClasses.none;

  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel rounded-2xl p-6 transition-all duration-500
        ${selectedGlow} 
        ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''} 
        ${className}
      `}
    >
      {/* CARD HEADER */}
      {(title || headerActions) && (
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-200/10 dark:border-slate-800/10">
          {title && (
            <h3 className="text-md font-bold text-cyber-dark dark:text-white uppercase tracking-wider font-cyber-title flex items-center">
              {title}
            </h3>
          )}
          {headerActions && <div className="flex space-x-2">{headerActions}</div>}
        </div>
      )}
      
      {/* CARD BODY */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
