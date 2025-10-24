import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { grades } from '../data';
import { useProgress } from '../hooks/useProgress';
import Card from '../components/Card';
import { TOPIC_TITLE } from '../constants';
import { useProgressStore, TopicStats } from '../store/progressStore';
import CompletionMedal from '../components/CompletionMedal';
import { useUiStore } from '../store/uiStore';

interface ChallengeMedalsProps {
  medals: {
    bronze?: boolean;
    silver?: boolean;
    gold?: boolean;
    platinum?: boolean;
    rainbow?: boolean;
  };
}

const ChallengeMedals: React.FC<ChallengeMedalsProps> = ({ medals }) => {
  if (!Object.values(medals).some(m => m)) {
    return null;
  }
  return (
    <div className="flex flex-wrap justify-center items-center gap-2 text-2xl my-2" aria-label="Medallas obtenidas">
      {medals.bronze && <span title="Superaste 40 operaciones">🥉</span>}
      {medals.silver && <span title="Superaste 60 operaciones">🥈</span>}
      {medals.gold && <span title="Completaste el desafío">🥇</span>}
      {medals.platinum && <span title="Llegaste al Nivel 2 (Modo Troll)">💎</span>}
      {medals.rainbow && <span title="¡Superaste el Modo Troll!" className="animate-rainbow-pulse inline-block">🌈</span>}
    </div>
  );
};

const TopicPage: React.FC = () => {
  const { gradeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { startMedalAnimation } = useUiStore();
  
  const topicRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const medalInfo = location.state?.awardedMedal;
    if (medalInfo) {
      const { topicId, medal } = medalInfo;
      const element = topicRefs.current[topicId];
      const grade = grades.find((g) => g.id === gradeId);
      const topic = grade?.topics.find(t => t.id === topicId);

      if (element && topic) {
        const rect = element.getBoundingClientRect();
        startMedalAnimation({
          topicId,
          medal,
          elementRect: rect,
          topicName: topic.name,
          topicIcon: topic.icon
        });
        // Clean up state to prevent re-triggering
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, startMedalAnimation, navigate, location.pathname, gradeId]);


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
          // FIX: The ref callback should not return a value. Wrapped the assignment in curly braces to ensure it returns void.
          <div key={topic.id} ref={(el) => { topicRefs.current[topic.id] = el; }}>
            <TopicCard topic={topic} gradeId={grade.id} />
          </div>
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

  const getHighestMedal = (medals?: TopicStats['medals']): string | null => {
    if (!medals) return null;
    if (medals.rainbow) return 'rainbow';
    if (medals.platinum) return 'platinum';
    if (medals.gold) return 'gold';
    if (medals.silver) return 'silver';
    if (medals.bronze) return 'bronze';
    return null;
  };

  const highestMedal = getHighestMedal(topicStats?.medals);

  const handleClick = () => {
    if (topic.challengeType) {
      navigate(`/grade/${gradeId}/challenge/${topic.id}`);
    } else {
      navigate(`/grade/${gradeId}/topic/${topic.id}`);
    }
  };

  // Define default and medal-based color classes
  let titleColorClass = "text-brand-text dark:text-dark-text";
  let statsBgClass = "bg-gray-100 dark:bg-dark-subtle/50";
  let statsTextColorClass = "text-gray-600 dark:text-gray-300";
  let progressBgClass = "bg-gray-200 dark:bg-dark-subtle";
  let subtextColorClass = "text-gray-500 dark:text-gray-400";
  let challengeTextColorClass = "text-brand-primary dark:text-dark-primary";

  if (highestMedal) {
      titleColorClass = ""; // Will inherit from Card
      
      switch (highestMedal) {
          case 'bronze':
          case 'rainbow':
              statsBgClass = "bg-black/20";
              statsTextColorClass = "text-white/90";
              progressBgClass = "bg-black/20";
              subtextColorClass = "text-white/80";
              challengeTextColorClass = "text-white";
              break;
          case 'silver':
              statsBgClass = "bg-black/10";
              statsTextColorClass = "text-gray-800 dark:text-gray-900/90";
              progressBgClass = "bg-black/10";
              subtextColorClass = "text-gray-700 dark:text-gray-900";
              challengeTextColorClass = "text-gray-800 dark:text-gray-900";
              break;
          case 'gold':
              statsBgClass = "bg-yellow-900/10 dark:bg-black/20";
              statsTextColorClass = "text-yellow-900 dark:text-yellow-800/90";
              progressBgClass = "bg-yellow-900/10 dark:bg-black/20";
              subtextColorClass = "text-yellow-800 dark:text-yellow-900";
              challengeTextColorClass = "text-yellow-800 dark:text-yellow-900";
              break;
          case 'platinum':
              statsBgClass = "bg-black/10 dark:bg-black/20";
              statsTextColorClass = "text-gray-800 dark:text-gray-900/90";
              progressBgClass = "bg-black/10 dark:bg-black/20";
              subtextColorClass = "text-gray-700 dark:text-gray-900";
              challengeTextColorClass = "text-gray-800 dark:text-gray-900";
              break;
      }
  }


  return (
    <Card onClick={handleClick} medalTier={highestMedal}>
      <div className="flex justify-center items-start gap-4 mb-4">
        <div className="text-8xl">{topic.icon}</div>
        <div className="pt-2">
          {!topic.challengeType && topicStats && <CompletionMedal completions={topicStats.completions} />}
        </div>
      </div>
      <h3 className={`text-3xl font-bold mb-2 ${titleColorClass}`}>{topic.name}</h3>

      {topic.challengeType && topicStats?.medals && (
        <ChallengeMedals medals={topicStats.medals} />
      )}

      {topicStats && (
        <div className={`text-left text-sm p-3 rounded-lg mt-2 space-y-1 font-sans ${statsBgClass} ${statsTextColorClass}`}>
          <p><strong>Completado:</strong> {topicStats.completions} {topicStats.completions === 1 ? 'vez' : 'veces'}</p>
          <p><strong>Racha Máx:</strong> {topicStats.longestStreak} 🔥</p>
          {topicStats.bestTime !== undefined && (
            <p><strong>Mejor Tiempo:</strong> {topicStats.bestTime}ms</p>
          )}
        </div>
      )}

      {!topic.challengeType ? (
        <>
          <div className={`w-full h-4 rounded-full ${progressBgClass}`}>
            <div
              className="bg-brand-secondary h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className={`mt-2 ${subtextColorClass}`}>{`${completedCount} / ${totalCount} completados`}</p>
        </>
      ) : (
        <p className={`font-bold mt-2 text-lg ${challengeTextColorClass}`}>¡Desafío Especial!</p>
      )}
    </Card>
  );
};

export default TopicPage;
