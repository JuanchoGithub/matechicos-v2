import React from 'react';
import { useNavigate } from 'react-router-dom';
import { grades } from '../data';
import Card from '../components/Card';
import Button from '../components/Button';
import { HOME_TITLE } from '../constants';

import { useProgressStore } from '../store/progressStore';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { topicStats } = useProgressStore();

  const renderMedals = (topicId: string) => {
    const stats = topicStats[topicId];
    if (!stats || !stats.medals) return null;
    return (
      <div className="flex gap-1 mt-2 justify-center">
        {stats.medals.bronze && <span className="text-xl" title="Bronce">🥉</span>}
        {stats.medals.silver && <span className="text-xl" title="Plata">🥈</span>}
        {stats.medals.gold && <span className="text-xl" title="Oro">🥇</span>}
        {stats.medals.diamond && <span className="text-xl" title="Diamante">💎</span>}
      </div>
    );
  };

  const renderLearnTablesMedals = () => {
    const tables = Array.from({ length: 10 }, (_, i) => i + 1);
    const allMedals = { bronze: false, silver: false, gold: false, diamond: false };
    
    tables.forEach(t => {
      const stats = topicStats[`learn-table-${t}`];
      if (stats?.medals) {
        if (stats.medals.bronze) allMedals.bronze = true;
        if (stats.medals.silver) allMedals.silver = true;
        if (stats.medals.gold) allMedals.gold = true;
        if (stats.medals.diamond) allMedals.diamond = true;
      }
    });

    const completedTables = tables.filter(t => topicStats[`learn-table-${t}`]?.medals?.bronze);
    
    return (
      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="flex gap-1 justify-center">
          {allMedals.bronze && <span className="text-xl">🥉</span>}
          {allMedals.silver && <span className="text-xl">🥈</span>}
          {allMedals.gold && <span className="text-xl">🥇</span>}
          {allMedals.diamond && <span className="text-xl">💎</span>}
        </div>
        {completedTables.length > 0 && (
          <span className="text-sm font-bold text-brand-primary dark:text-dark-primary">
            {completedTables.length}/10 tablas iniciadas
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="text-center flex-grow flex flex-col justify-center py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {grades.map((grade) => (
          <Card key={grade.id} onClick={() => navigate(`/grade/${grade.id}`)}>
            <div className="text-8xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-brand-text dark:text-dark-text">{grade.name}</h2>
          </Card>
        ))}
        <Card onClick={() => navigate('/daily-challenge')}>
          <div className="text-8xl mb-4">🔥</div>
          <h2 className="text-3xl font-bold text-brand-text dark:text-dark-text">Desafío Diario</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">10 Velocidad + 5 Descomp. + 1 Prob. + 1 Épico + 1 Pistas</p>
          {renderMedals('daily-challenge')}
        </Card>
        <Card onClick={() => navigate('/learn-tables')}>
          <div className="text-8xl mb-4">📚</div>
          <h2 className="text-3xl font-bold text-brand-text dark:text-dark-text">Aprender las tablas</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Practica una tabla específica</p>
          {renderLearnTablesMedals()}
        </Card>
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