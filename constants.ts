import { StageConfig } from './types';

export const APP_TITLE = "MathKids";
export const HOME_TITLE = "Elegí tu Grado";
export const TOPIC_TITLE = "Elegí un Tema";
export const CORRECT_FEEDBACK = "¡Correcto!";
export const INCORRECT_FEEDBACK = "¡Ups! Casi lo tenés";
export const NEXT_EXERCISE_BUTTON = "Siguiente";
export const SUBMIT_BUTTON = "Revisá";
export const TRY_AGAIN_BUTTON = "Intentar de nuevo";

export const STAGES_CONFIG: StageConfig[] = [
    { name: 'F1', total: 10 },
    { name: 'F2', total: 10 },
    { name: 'F3', total: 5, time: 60000 },
];