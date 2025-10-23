import { EpicWordProblemExercise, ExerciseType } from '../../../types';

const generateEpicProblem = (i: number): EpicWordProblemExercise => {
  // Part 1: 3 numbers, all addition (3-digit + 3-digit + 2-digit)
  if (i < 5) {
    const n1 = Math.floor(Math.random() * 500) + 100;
    const n2 = Math.floor(Math.random() * 500) + 100;
    const n3 = Math.floor(Math.random() * 90) + 10;
    const answer = n1 + n2 + n3;
    return {
      id: `epic-add-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 3,
      problemText: `En una campaña de reciclaje, la escuela A juntó ${n1} botellas, la escuela B juntó ${n2} y la escuela C juntó ${n3}. ¿Cuántas botellas juntaron en total?`,
      numbers: [n1, n2, n3], operations: ["addition", "addition"], answer: answer,
      explanation: `Para encontrar el total, debíamos sumar las botellas de las tres escuelas. La suma ${n1} + ${n2} + ${n3} da un total de ${answer} botellas.`
    };
  }
  // Part 2: 3 numbers, all subtraction (3-digit - 2-digit - 2-digit)
  if (i < 10) {
    const n1 = Math.floor(Math.random() * 400) + 500; // 500-899
    const n2 = Math.floor(Math.random() * 90) + 10;
    const n3 = Math.floor(Math.random() * 90) + 10;
    const answer = n1 - n2 - n3;
     return {
      id: `epic-sub-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 3,
      problemText: `Una fábrica produjo ${n1} juguetes. Vendió un lote de ${n2} y otro de ${n3}. ¿Cuántos juguetes le quedaron sin vender?`,
      numbers: [n1, n2, n3], operations: ["subtraction", "subtraction"], answer: answer,
      explanation: `Empezamos con el total de ${n1} juguetes. Primero se vendieron ${n2}, y luego ${n3}. Debíamos restar ambas cantidades del total: ${n1} - ${n2} - ${n3} nos deja con ${answer} juguetes.`
    };
  }
  // Part 3: 3 numbers, mixed operations
  if (i < 20) {
     const n1 = Math.floor(Math.random() * 500) + 200;
     const n2 = Math.floor(Math.random() * 100) + 50;
     const n3 = Math.floor(Math.random() * (n2 - 10)) + 10;
     if (i % 2 === 0) { // A + B - C
        const answer = n1 + n2 - n3;
        return {
            id: `epic-mix3-1-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 4,
            problemText: `Un tren salió con ${n1} pasajeros. En la primera estación subieron ${n2} y en la segunda bajaron ${n3}. ¿Cuántos pasajeros hay ahora?`,
            numbers: [n1, n2, n3], operations: ["addition", "subtraction"], answer: answer,
            explanation: `Al principio había ${n1} pasajeros. "Subieron" significa sumar (+${n2}), y "bajaron" significa restar (-${n3}). La operación era ${n1} + ${n2} - ${n3}, que da como resultado ${answer}.`
        };
     } else { // A - B + C
        const answer = n1 - n2 + n3;
        return {
            id: `epic-mix3-2-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 4,
            problemText: `En una granja había ${n1} gallinas. Se vendieron ${n2} pero luego nacieron ${n3} pollitos. ¿Cuántas gallinas hay ahora?`,
            numbers: [n1, n2, n3], operations: ["subtraction", "addition"], answer: answer,
            explanation: `Había ${n1} gallinas. "Se vendieron" significa restar (-${n2}), y "nacieron" significa sumar (+${n3}). La operación era ${n1} - ${n2} + ${n3}, lo que nos da ${answer}.`
        };
     }
  }
  // Part 4: 4 numbers, mixed operations
  const n1 = Math.floor(Math.random() * 500) + 300;
  const n2 = Math.floor(Math.random() * 100) + 50;
  const n3 = Math.floor(Math.random() * 100) + 50;
  const n4 = Math.floor(Math.random() * 50) + 10;
  const answer = n1 + n2 - n3 - n4;
  return {
    id: `epic-mix4-${i}`, type: ExerciseType.EpicWordProblem, question: "Resolvé el problema épico", difficulty: 5,
    problemText: `Mi abuelo tenía ${n1} estampillas. Me regaló ${n2}, pero luego vendió ${n3} y después compró ${n4} nuevas. ¿Cuántas tiene ahora?`,
    numbers: [n1, n2, n3, n4], operations: ["addition", "subtraction", "addition"], answer: n1 - n2 - n3 + n4, // Text: tenía X, me regaló Y (a mí, entonces él tiene menos)
    explanation: `Este era un desafío. Tu abuelo tenía ${n1}. Si te regaló ${n2}, él tiene menos (-${n2}). Si vendió ${n3}, también tiene menos (-${n3}). Si compró ${n4}, tiene más (+${n4}). La cuenta era ${n1} - ${n2} - ${n3} + ${n4}, que da ${n1 - n2 - n3 + n4}.`
  };
};

export const epicWordProblemExercises: EpicWordProblemExercise[] = Array.from({ length: 30 }, (_, i) => generateEpicProblem(i)).sort(() => 0.5 - Math.random());
