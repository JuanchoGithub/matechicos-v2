import { WordProblemExercise, ExerciseType } from '../../../types';
import templates from './templates/word-problem-templates.js';

type Template = {
  template: string;
  explanation: string;
  distractor_phrase?: string;
  distractor_explanation?: string;
};

function interpolate(template: string, values: Record<string, any>): string {
  // Replaces {key} with value, and removes placeholders if value is empty/undefined
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || '');
}

function createProblem(
  id: string,
  difficultyStage: number,
  operation: 'addition' | 'subtraction',
  num1: number,
  num2: number,
  answer: number,
  template: Template,
  distractor?: number,
  distractor2?: number,
): WordProblemExercise {
  const distractorValues = { distractor, distractor2 };
  const distractor_phrase = (distractor || distractor2) ? interpolate(template.distractor_phrase || '', distractorValues) : '';
  const distractor_explanation = (distractor || distractor2) ? interpolate(template.distractor_explanation || '', distractorValues) : '';

  const problemText = interpolate(template.template, { num1, num2, distractor_phrase });
  const explanation = interpolate(template.explanation, { num1, num2, answer, distractor_explanation });

  return {
    id,
    type: ExerciseType.WordProblem,
    question: "Leé el problema y resolvelo",
    difficulty: difficultyStage,
    difficultyStage,
    problemText,
    numbers: [num1, num2],
    operation,
    answer,
    explanation,
  };
}


const problems: WordProblemExercise[] = [];

// Stage 1: 2-digit vs 2-digit (BRONZE)
for (let i = 0; i < 60; i++) {
  const isAddition = Math.random() > 0.5;
  if (isAddition) {
    const num1 = Math.floor(Math.random() * 80) + 10;
    const num2 = Math.floor(Math.random() * 80) + 10;
    const answer = num1 + num2;
    const template = templates.stage1.addition[i % templates.stage1.addition.length];
    problems.push(createProblem(`wp-s1-add-${i}`, 1, "addition", num1, num2, answer, template));
  } else {
    const num1 = Math.floor(Math.random() * 50) + 40; // 40-89
    const num2 = Math.floor(Math.random() * (num1 - 10)) + 10;
    const answer = num1 - num2;
    const template = templates.stage1.subtraction[i % templates.stage1.subtraction.length];
    problems.push(createProblem(`wp-s1-sub-${i}`, 1, "subtraction", num1, num2, answer, template));
  }
}

// Stage 2: 3-digit vs 2-digit (SILVER)
for (let i = 0; i < 60; i++) {
    const hasDistractor = Math.random() > 0.5;
    const distractor = hasDistractor ? Math.floor(Math.random() * 20) + 3 : undefined;
    const isAddition = Math.random() > 0.5;
    
    if (isAddition) {
        const num1 = Math.floor(Math.random() * 800) + 100;
        const num2 = Math.floor(Math.random() * 80) + 10;
        const answer = num1 + num2;
        const template = templates.stage2.addition[i % templates.stage2.addition.length];
        problems.push(createProblem(`wp-s2-add-${i}`, 2, "addition", num1, num2, answer, template, distractor));
    } else {
        const num1 = Math.floor(Math.random() * 800) + 100;
        const num2 = Math.floor(Math.random() * 80) + 10;
        const answer = num1 - num2;
        const template = templates.stage2.subtraction[i % templates.stage2.subtraction.length];
        problems.push(createProblem(`wp-s2-sub-${i}`, 2, "subtraction", num1, num2, answer, template, distractor));
    }
}

// Stage 3: 3-digit vs 3-digit (GOLD)
for (let i = 0; i < 60; i++) {
    const hasDistractor = Math.random() > 0.5;
    const hasSecondDistractor = hasDistractor && Math.random() > 0.5;
    const distractor = hasDistractor ? Math.floor(Math.random() * 30) + 5 : undefined;
    const distractor2 = hasSecondDistractor ? Math.floor(Math.random() * 50) + 10 : undefined;
    const isAddition = Math.random() > 0.5;

    if (isAddition) {
        const num1 = Math.floor(Math.random() * 800) + 100;
        const num2 = Math.floor(Math.random() * 800) + 100;
        const answer = num1 + num2;
        const template = templates.stage3.addition[i % templates.stage3.addition.length];
        problems.push(createProblem(`wp-s3-add-${i}`, 3, "addition", num1, num2, answer, template, distractor, distractor2));
    } else {
        const num1 = Math.floor(Math.random() * 500) + 400;
        const num2 = Math.floor(Math.random() * (num1 - 100)) + 100;
        const answer = num1 - num2;
        const template = templates.stage3.subtraction[i % templates.stage3.subtraction.length];
        problems.push(createProblem(`wp-s3-sub-${i}`, 3, "subtraction", num1, num2, answer, template, distractor, distractor2));
    }
}


export const wordProblemExercises: WordProblemExercise[] = problems.sort(() => 0.5 - Math.random());