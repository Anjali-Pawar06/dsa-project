import React from 'react';

export interface AlgoPageProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

// Simple reusable layout used by all algorithm pages.
export const AlgoPage: React.FC<AlgoPageProps> = ({ title, description, children }) => {
  return (
    <div className="algo-page" style={{ padding: '1rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>{title}</h1>
      {description && <p style={{ marginBottom: '1rem' }}>{description}</p>}
      {children}
    </div>
  );
};

export default AlgoPage;
