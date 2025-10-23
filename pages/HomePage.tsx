import React from 'react';
import { useNavigate } from 'react-router-dom';
import { grades } from '../data';
import Card from '../components/Card';
import { HOME_TITLE } from '../constants';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center flex-grow flex flex-col justify-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-6">{HOME_TITLE}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grades.map((grade) => (
          <Card key={grade.id} onClick={() => navigate(`/grade/${grade.id}`)}>
            <div className="text-8xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-brand-text">{grade.name}</h2>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;