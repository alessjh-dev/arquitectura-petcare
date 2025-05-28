import React from 'react';

interface CardProps {
  title?: string; 
  children: React.ReactNode;
  className?: string; 
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-card text-card-foreground rounded-lg border shadow-sm p-4 md:p-6 ${className || ''}`}>
      {title && (
        <h2 className="text-xl font-semibold mb-3 text-foreground">{title}</h2>
      )}
      <div>
        {children}
      </div>
    </div>
  );
};

export default Card;