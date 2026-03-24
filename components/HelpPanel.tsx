import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface HelpPanelProps {
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  gameMode: 'staged' | 'multiplication-decomposition' | 'division-decomposition';
  onClose: () => void;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ operation, gameMode, onClose }) => {
  let title = "¿Cómo funciona?";
  let content: React.ReactNode = null;

  switch (gameMode) {
    case 'staged':
      title = `¿Cómo funcionan las Fases?`;
      content = (
        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
          <li>Este desafío tiene <strong>3 Fases</strong>.</li>
          <li><strong>Fase 1 (🥉):</strong> 10 cuentas fáciles (2 cifras vs 1 cifra).</li>
          <li><strong>Fase 2 (🥈):</strong> 10 cuentas medias (2 cifras vs 2 cifras).</li>
          <li><strong>Fase 3 (🥇):</strong> 5 cuentas con <strong>tiempo</strong>. ¡Sé rápido!</li>
          <li>Usá el lápiz para hacer cálculos en la pantalla.</li>
        </ul>
      );
      break;
    case 'multiplication-decomposition':
      title = "Multiplicación por Descomposición";
      content = (
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <h3 className="font-bold border-b border-brand-primary/20 mb-1">El Método:</h3>
            <ul className="list-decimal list-inside space-y-1">
              <li><strong>Descomponemos</strong> el número (ej: 34 = 30 + 4).</li>
              <li><strong>Unidades:</strong> multiplicamos la unidad (ej: 4 × 2).</li>
              <li><strong>Decenas:</strong> multiplicamos la decena sin el cero (ej: 3 × 2) y luego <strong>multiplicamos por 10</strong> (ej: 6 × 10 = 60).</li>
              <li><strong>Sumamos</strong> los resultados finales (ej: 60 + 8 = 68).</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold border-b border-brand-primary/20 mb-1">Las Fases:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Fase 1 (🥉):</strong> Multiplicadores del 2 al 5.</li>
              <li><strong>Fase 2 (🥈):</strong> Multiplicadores del 6 al 9.</li>
              <li><strong>Fase 3 (🥇):</strong> 5 cuentas contra reloj.</li>
            </ul>
          </div>
        </div>
      );
      break;
    case 'division-decomposition':
      title = "Divisiones por Descomposición";
      content = (
        <div className="space-y-3 text-sm sm:text-base">
          <div>
            <h3 className="font-bold border-b border-brand-primary/20 mb-1">El Método:</h3>
            <ul className="list-decimal list-inside space-y-1">
              <li>¿Cuántas veces entra el divisor?</li>
              <li>Multiplicar y restar.</li>
              <li>Bajar la siguiente cifra.</li>
              <li>Repetir hasta terminar.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold border-b border-brand-primary/20 mb-1">Las Fases:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Fase 1 (🥉):</strong> Divisores fáciles (2 al 5).</li>
              <li><strong>Fase 2 (🥈):</strong> Todos los divisores (2 al 9).</li>
              <li><strong>Fase 3 (🥇):</strong> 5 cuentas contra reloj.</li>
            </ul>
          </div>
        </div>
      );
      break;
  }

  return (
    <aside className="w-full md:max-w-sm flex-shrink-0 animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
      <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-800 p-6 rounded-3xl shadow-lg flex flex-col h-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full transition-colors"
          aria-label="Cerrar ayuda"
        >
          <X className="w-6 h-6 text-amber-700 dark:text-amber-400" />
        </button>
        
        <div className="flex items-center gap-2 mb-4 pr-8">
          <span className="text-2xl">💡</span>
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 leading-tight">{title}</h2>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar text-amber-800 dark:text-amber-300">
          {content}
        </div>
        
        <Button 
          onClick={onClose} 
          variant="ghost" 
          className="mt-4 border-2 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800"
        >
          Entendido
        </Button>
      </div>
    </aside>
  );
};

export default HelpPanel;
