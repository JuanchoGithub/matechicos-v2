import { EpicWordProblemExercise, ExerciseType } from '../../../types';
import templates from './templates/epic-word-problem-templates.js';

function interpolate(template: string, values: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || '');
}

const generateEpicProblem = (i: number): EpicWordProblemExercise => {
  // Level 1: 3 numbers, all addition (3-digit + 3-digit + 2-digit)
  if (i < 5) {
    const n1 = Math.floor(Math.random() * 500) + 100;
    const n2 = Math.floor(Math.random() * 500) + 100;
    const n3 = Math.floor(Math.random() * 90) + 10;
    const answer = n1 + n2 + n3;
    const template = templates.level1[i % templates.level1.length];
    return {
      id: `epic-add-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 3,
      problemText: interpolate(template.problemText, { n1, n2, n3 }),
      numbers: [n1, n2, n3], operations: ["addition", "addition"], answer: answer,
      explanation: interpolate(template.explanation, { n1, n2, n3, answer })
    };
  }
  // Level 2: 3 numbers, all subtraction (3-digit - 2-digit - 2-digit)
  if (i < 10) {
    const n1 = Math.floor(Math.random() * 400) + 500; // 500-899
    const n2 = Math.floor(Math.random() * 90) + 10;
    const n3 = Math.floor(Math.random() * 90) + 10;
    const answer = n1 - n2 - n3;
    const template = templates.level2[i % templates.level2.length];
     return {
      id: `epic-sub-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 3,
      problemText: interpolate(template.problemText, { n1, n2, n3 }),
      numbers: [n1, n2, n3], operations: ["subtraction", "subtraction"], answer: answer,
      explanation: interpolate(template.explanation, { n1, n2, n3, answer })
    };
  }
  // Level 3: 3 numbers, mixed operations
  if (i < 20) {
     const n1 = Math.floor(Math.random() * 500) + 200;
     const n2 = Math.floor(Math.random() * 100) + 50;
     const n3 = Math.floor(Math.random() * (n2 - 10)) + 10;
     if (i % 2 === 0) { // A + B - C
        const answer = n1 + n2 - n3;
        const template = templates.level3_add_sub[i % templates.level3_add_sub.length];
        return {
            id: `epic-mix3-1-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 4,
            problemText: interpolate(template.problemText, { n1, n2, n3 }),
            numbers: [n1, n2, n3], operations: ["addition", "subtraction"], answer: answer,
            explanation: interpolate(template.explanation, { n1, n2, n3, answer })
        };
     } else { // A - B + C
        const answer = n1 - n2 + n3;
        const template = templates.level3_sub_add[i % templates.level3_sub_add.length];
        return {
            id: `epic-mix3-2-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 4,
            problemText: interpolate(template.problemText, { n1, n2, n3 }),
            numbers: [n1, n2, n3], operations: ["subtraction", "addition"], answer: answer,
            explanation: interpolate(template.explanation, { n1, n2, n3, answer })
        };
     }
  }
  // Level 4: 4 numbers, mixed operations
  const n1 = Math.floor(Math.random() * 500) + 300;
  const n2 = Math.floor(Math.random() * 100) + 50;
  const n3 = Math.floor(Math.random() * 100) + 50;
  const n4 = Math.floor(Math.random() * 50) + 10;
  const answer = n1 - n2 - n3 + n4;
  const template = templates.level4[i % templates.level4.length];
  return {
    id: `epic-mix4-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 5,
    problemText: interpolate(template.problemText, { n1, n2, n3, n4 }),
    numbers: [n1, n2, n3, n4], 
    operations: ["subtraction", "subtraction", "addition"], // Corrected logic: regaló(-), vendió(-), compró(+)
    answer,
    explanation: interpolate(template.explanation, { n1, n2, n3, n4, answer })
  };
};

export const epicWordProblemExercises: EpicWordProblemExercise[] = Array.from({ length: 30 }, (_, i) => generateEpicProblem(i)).sort(() => 0.5 - Math.random());