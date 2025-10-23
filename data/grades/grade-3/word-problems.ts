import { WordProblemExercise, ExerciseType } from '../../../types';

const problems: WordProblemExercise[] = [
  // Stage 1: 2-digit vs 2-digit
  ...Array.from({ length: 20 }, (_, i): WordProblemExercise => {
    const isAddition = Math.random() > 0.5;
    if (isAddition) {
        const num1 = Math.floor(Math.random() * 80) + 10;
        const num2 = Math.floor(Math.random() * 80) + 10;
        const answer = num1 + num2;
        return {
          id: `wp-s1-add-${i}`, type: ExerciseType.WordProblem, question: "Leé el problema y resolvelo", difficulty: 1, difficultyStage: 1,
          problemText: `En una biblioteca hay ${num1} libros de aventuras y ${num2} de ciencia ficción. ¿Cuántos libros hay en total?`,
          numbers: [num1, num2], operation: "addition", answer: answer,
          explanation: `La operación correcta era la **suma**. Para saber el "total" de libros, hay que juntar los de aventuras (${num1}) y los de ciencia ficción (${num2}). La suma ${num1} + ${num2} da ${answer}.`
        };
    } else {
        const num1 = Math.floor(Math.random() * 50) + 40; // 40-89
        const num2 = Math.floor(Math.random() * (num1 - 10)) + 10;
        const answer = num1 - num2;
        return {
          id: `wp-s1-sub-${i}`, type: ExerciseType.WordProblem, question: "Leé el problema y resolvelo", difficulty: 1, difficultyStage: 1,
          problemText: `Un paquete tenía ${num1} galletitas. Si se comieron ${num2}, ¿cuántas quedan?`,
          numbers: [num1, num2], operation: "subtraction", answer: answer,
          explanation: `La operación correcta era la **resta**. Si "se comieron" ${num2} galletitas de un total de ${num1}, para saber cuántas "quedan" hay que restar. La resta ${num1} - ${num2} da ${answer}.`
        };
    }
  }),
  // Stage 2: 3-digit vs 2-digit
  ...Array.from({ length: 20 }, (_, i): WordProblemExercise => {
    const isAddition = Math.random() > 0.5;
    if (isAddition) {
        const num1 = Math.floor(Math.random() * 800) + 100;
        const num2 = Math.floor(Math.random() * 80) + 10;
        const answer = num1 + num2;
        return {
          id: `wp-s2-add-${i}`, type: ExerciseType.WordProblem, question: "Leé el problema y resolvelo", difficulty: 2, difficultyStage: 2,
          problemText: `Un camión recorrió ${num1} kilómetros el lunes y ${num2} el martes. ¿Cuántos kilómetros recorrió en total?`,
          numbers: [num1, num2], operation: "addition", answer: answer,
          explanation: `La operación correcta era la **suma**. Para encontrar el "total" de kilómetros, se deben juntar las distancias de ambos días. La suma de ${num1} + ${num2} es ${answer}.`
        };
    } else {
        const num1 = Math.floor(Math.random() * 800) + 100;
        const num2 = Math.floor(Math.random() * 80) + 10;
        const answer = num1 - num2;
        return {
          id: `wp-s2-sub-${i}`, type: ExerciseType.WordProblem, question: "Leé el problema y resolvelo", difficulty: 2, difficultyStage: 2,
          problemText: `Un libro tiene ${num1} páginas. Si ya leí ${num2}, ¿cuántas me faltan leer?`,
          numbers: [num1, num2], operation: "subtraction", answer: answer,
          explanation: `La operación correcta era la **resta**. Para saber cuántas páginas "faltan", se debe quitar la cantidad ya leída (${num2}) del total de páginas (${num1}). La resta ${num1} - ${num2} da ${answer}.`
        };
    }
  }),
  // Stage 3: 3-digit vs 3-digit
    ...Array.from({ length: 20 }, (_, i): WordProblemExercise => {
    const isAddition = Math.random() > 0.5;
    if (isAddition) {
        const num1 = Math.floor(Math.random() * 800) + 100;
        const num2 = Math.floor(Math.random() * 800) + 100;
        const answer = num1 + num2;
        return {
          id: `wp-s3-add-${i}`, type: ExerciseType.WordProblem, question: "Leé el problema y resolvelo", difficulty: 3, difficultyStage: 3,
          problemText: `En un cine entraron ${num1} personas el sábado y ${num2} el domingo. ¿Cuántas personas fueron en todo el fin de semana?`,
          numbers: [num1, num2], operation: "addition", answer: answer,
          explanation: `La operación correcta era la **suma**. Para saber el total del "fin de semana", hay que sumar la gente del sábado (${num1}) y la del domingo (${num2}). La suma ${num1} + ${num2} da ${answer}.`
        };
    } else {
        const num1 = Math.floor(Math.random() * 500) + 400;
        const num2 = Math.floor(Math.random() * (num1 - 100)) + 100;
        const answer = num1 - num2;
        return {
          id: `wp-s3-sub-${i}`, type: ExerciseType.WordProblem, question: "Leé el problema y resolvelo", difficulty: 3, difficultyStage: 3,
          problemText: `Un avión vuela a ${num1} metros de altura y desciende ${num2} metros. ¿A qué altura está ahora?`,
          numbers: [num1, num2], operation: "subtraction", answer: answer,
          explanation: `La operación correcta era la **resta**. Si el avión "desciende" ${num2} metros desde una altura de ${num1}, para saber su nueva altura hay que restar. El cálculo ${num1} - ${num2} da como resultado ${answer}.`
        };
    }
  }),
];

export const wordProblemExercises: WordProblemExercise[] = problems.sort(() => 0.5 - Math.random());
