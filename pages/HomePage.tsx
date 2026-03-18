import React from 'react';
import { useNavigate } from 'react-router-dom';
import { grades } from '../data';
import Card from '../components/Card';
import Button from '../components/Button';
import { HOME_TITLE } from '../constants';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center flex-grow flex flex-col justify-center py-8">
      <h1 className="text-4xl md:text-5xl font-extrabold text-brand-primary dark:text-dark-primary mb-6">{HOME_TITLE} ✨ v2.0</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {grades.map((grade) => (
          <Card key={grade.id} onClick={() => navigate(`/grade/${grade.id}`)}>
            <div className="text-8xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-brand-text dark:text-dark-text">{grade.name}</h2>
          </Card>
        ))}
      </div>
      
      <div className="mt-auto pt-12 border-t border-gray-200 dark:border-dark-subtle">
        <Button 
          variant="secondary" 
          onClick={() => navigate('/parents')}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-4 text-lg shadow-lg hover:scale-105 transition-transform"
        >
          <span className="text-2xl">👨‍👩‍👧‍👦</span>
          Sección para Padres
        </Button>
        <p className="mt-4 text-sm text-gray-400">Historial de progreso y errores para revisión</p>
      </div>
    </div>
  );
};

export default HomePage;