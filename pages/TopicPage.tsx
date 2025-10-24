

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { grades } from '../data';
import { useProgress } from '../hooks/useProgress';
import Card from '../components/Card';
import { TOPIC_TITLE } from '../constants';
import { useProgressStore } from '../store/progressStore';
import CompletionMedal from '../components/CompletionMedal';

const TopicPage: React.FC = () => {
  const { gradeId } = useParams();
  const grade = grades.find((g) => g.id === gradeId);

  if (!grade) {
    return <div className="text-center text-red-500">Grado no encontrado.</div>;
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-brand-primary dark:text-dark-primary mb-2">
        {grade.name}
      </h1>
      <h2 className="text-2xl md:text-3xl text-gray-500 dark:text-gray-400 mb-6">{TOPIC_TITLE}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grade.topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} gradeId={grade.id} />
        ))}
      </div>
    </div>
  );
};

interface TopicCardProps {
  topic: import('../types').Topic;
  gradeId: string;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, gradeId }) => {
  const navigate = useNavigate();
  const { progressPercentage, completedCount, totalCount } = useProgress(topic);
  const topicStats = useProgressStore((state) => state.topicStats[topic.id]);

  const handleClick = () => {
    if (topic.challengeType) {
      navigate(`/grade/${gradeId}/challenge/${topic.id}`);
    } else {
      navigate(`/grade/${gradeId}/topic/${topic.id}`);
    }
  };

  return (
    <Card onClick={handleClick}>
      <div className="flex justify-center items-start gap-4 mb-4">
        <div className="text-8xl">{topic.icon}</div>
        <div className="pt-2">
          {topicStats && <CompletionMedal completions={topicStats.completions} />}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-brand-text dark:text-dark-text mb-4">{topic.name}</h3>
      {topicStats && (
        <div className="text-left text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-dark-subtle/50 p-3 rounded-lg mb-4 space-y-1 font-sans">
          <p><strong>Completado:</strong> {topicStats.completions} {topicStats.completions === 1 ? 'vez' : 'veces'}</p>
          <p><strong>Racha Máx:</strong> {topicStats.longestStreak} 🔥</p>
          {topicStats.bestTime !== undefined && (
            <p><strong>Mejor Tiempo:</strong> {topicStats.bestTime}ms</p>
          )}
        </div>
      )}

      {!topic.challengeType ? (
        <>
          <div className="w-full bg-gray-200 dark:bg-dark-subtle rounded-full h-4">
            <div
              className="bg-brand-secondary h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{`${completedCount} / ${totalCount} completados`}</p>
        </>
      ) : (
        <p className="text-brand-primary dark:text-dark-primary font-bold mt-2 text-lg">¡Desafío Especial!</p>
      )}
    </Card>
  );
};

export default TopicPage;