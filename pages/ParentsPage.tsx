import React from 'react';
import { useProgressStore } from '../store/progressStore';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, History, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const ParentsPage: React.FC = () => {
  const { attempts } = useProgressStore();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-dark-subtle pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="rounded-full w-10 h-10 p-0">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-brand-primary dark:text-dark-primary">Sección para Padres</h1>
            <p className="text-gray-500 dark:text-gray-400">Historial detallado de intentos y progreso</p>
          </div>
        </div>
        <div className="bg-brand-secondary/10 dark:bg-dark-secondary/10 p-3 rounded-2xl">
          <History className="w-8 h-8 text-brand-secondary dark:text-dark-secondary" />
        </div>
      </header>

      {attempts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-dashed border-gray-300 dark:border-dark-subtle">
          <div className="bg-gray-50 dark:bg-dark-subtle w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No hay intentos registrados</h2>
          <p className="text-gray-500 max-w-xs mx-auto">
            Cuando el estudiante complete desafíos o ejercicios, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Últimos Intentos
          </h2>
          <div className="grid gap-4">
            {attempts.map((attempt) => (
              <div 
                key={attempt.id} 
                className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-subtle hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${attempt.didWin ? 'bg-green-500' : 'bg-red-500'}`} />
                      <h3 className="font-bold text-lg">{attempt.topicName}</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      {format(attempt.timestamp, "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Puntaje</p>
                      <p className="text-2xl font-black text-brand-secondary">{attempt.score}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Resultado</p>
                      <p className={`font-bold ${attempt.didWin ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.didWin ? 'SUPERADO' : 'INTENTADO'}
                      </p>
                    </div>
                  </div>
                </div>

                {attempt.lastFailure && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <h4 className="font-bold">Detalle del último error</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-red-600/60 dark:text-red-400/60 font-bold uppercase text-[10px] tracking-widest">Ejercicio</p>
                        <p className="text-lg font-mono font-bold">{attempt.lastFailure.question}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-red-600/60 dark:text-red-400/60 font-bold uppercase text-[10px] tracking-widest">Respuesta Correcta</p>
                        <p className="text-lg font-mono font-bold text-green-600">{attempt.lastFailure.correctAnswer}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-red-600/60 dark:text-red-400/60 font-bold uppercase text-[10px] tracking-widest">Respuesta del Estudiante</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-mono font-bold text-red-600">{attempt.lastFailure.userAnswer}</p>
                          <XCircle className="w-4 h-4 text-red-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="pt-10 text-center">
        <p className="text-sm text-gray-400 italic">
          "El error es una oportunidad para aprender."
        </p>
      </footer>
    </div>
  );
};

export default ParentsPage;
