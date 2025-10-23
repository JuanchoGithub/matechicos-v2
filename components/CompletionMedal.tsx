
import React from 'react';

interface CompletionMedalProps {
  completions: number;
}

const CompletionMedal: React.FC<CompletionMedalProps> = ({ completions }) => {
  if (completions <= 0) {
    return null;
  }

  if (completions >= 5) {
    return (
      <span 
        className="text-2xl animate-rainbow-pulse"
        role="img" 
        aria-label="Medalla Arcoíris"
      >
        🌈
      </span>
    );
  }

  const medals = ['🥉', '🥈', '🥇', '💎'];
  const medal = medals[completions - 1];
  const medalNames = ['Bronce', 'Plata', 'Oro', 'Platino'];

  return (
    <span className="text-2xl" role="img" aria-label={`Medalla de ${medalNames[completions - 1]}`}>
      {medal}
    </span>
  );
};

export default CompletionMedal;
