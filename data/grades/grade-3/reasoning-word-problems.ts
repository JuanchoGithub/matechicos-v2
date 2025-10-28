import { ReasoningGauntletExercise, ExerciseType, SolutionStep } from '../../../types';

// Helper for random selection
// FIX: Update function to accept readonly arrays to correctly infer types when used with `as const`.
const choice = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Function to convert numbers to Spanish words
function numberToWords(num: number, gender: 'm' | 'f' = 'm'): string {
    if (num === 0) return 'cero';

    const units = ['', gender === 'm' ? 'un' : 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const tens = [
        'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'
    ];
    const twenties = [
        'veinte', gender === 'm' ? 'veintiún' : 'veintiuna', 'veintidós', 'veintitrés', 'veinticuatro',
        'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'
    ];

    if (num < 10) return units[num];
    if (num < 20) return tens[num - 10];
    if (num < 30) return twenties[num - 20];

    const tensMap: Record<number, string> = {
        3: 'treinta', 4: 'cuarenta', 5: 'cincuenta', 6: 'sesenta', 7: 'setenta', 8: 'ochenta', 9: 'noventa'
    };
    
    if (num < 100) {
        const t = Math.floor(num / 10);
        const u = num % 10;
        if (u === 0) return tensMap[t];
        return tensMap[t] + ` y ${units[u]}`;
    }

    if (num === 100) return 'cien';

    const hundredsMap: Record<number, string> = {
        1: 'ciento', 2: gender === 'm' ? 'doscientos' : 'doscientas', 3: gender === 'm' ? 'trescientos' : 'trescientas', 
        4: gender === 'm' ? 'cuatrocientos' : 'cuatrocientas', 5: gender === 'm' ? 'quinientos' : 'quinientas',
        6: gender === 'm' ? 'seiscientos' : 'seiscientas', 7: gender === 'm' ? 'setecientos' : 'setecientas',
        8: gender === 'm' ? 'ochocientos' : 'ochocientas', 9: gender === 'm' ? 'novecientos' : 'novecientas'
    };

    if (num < 1000) {
        const h = Math.floor(num / 100);
        const r = num % 100;
        if (r === 0) return hundredsMap[h];
        return hundredsMap[h] + ` ${numberToWords(r, gender)}`;
    }

    return String(num); // Fallback for larger numbers
}


// Templates array with generate functions
const problemTemplates = [
    // Template for "Sum and Multiply" problems
    {
        generate: () => {
            // FIX: Add 'as const' to infer literal types for gender property, preventing a type error in numberToWords.
            const items = [
                { singular: 'figurita', plural: 'figuritas', container: 'paquete', gender: 'f' },
                { singular: 'caramelo', plural: 'caramelos', container: 'bolsa', gender: 'm' },
                { singular: 'lápiz', plural: 'lápices', container: 'caja', gender: 'm' }
            ] as const;
            const people = [ { name: 'Papá' }, { name: 'Mamá' }, { name: 'mi tía' }, { name: 'mi abuelo' } ];
            const item = choice(items);
            const person1 = choice(people);
            let person2 = choice(people);
            while (person1.name === person2.name) { person2 = choice(people); }
            
            const numPerContainer = choice([5, 10]);
            const numTextPerContainer = numberToWords(numPerContainer);
            const num1 = Math.floor(Math.random() * 4) + 2; // 2-5
            const num2 = Math.floor(Math.random() * 3) + 2; // 2-4
            const num3 = 1;
            const text1 = numberToWords(num1);
            const text2 = numberToWords(num2);
            const text3 = numberToWords(num3, item.gender);

            const totalContainers = num1 + num2 + num3;
            const finalAnswer = totalContainers * numPerContainer;
            
            const problemText = `Cada ${item.container} de ${item.plural} trae __${JSON.stringify({text: numTextPerContainer, value: numPerContainer})}__ ${item.plural}. ${person1.name} me compró __${JSON.stringify({text: text1, value: num1})}__ ${item.container}s, ${person2.name} trajo __${JSON.stringify({text: text2, value: num2})}__ más y me encontré __${JSON.stringify({text: text3, value: num3})}__ ${item.container} más en el suelo. ¿Cuántas ${item.plural} tengo?`;
            
            const solution: SolutionStep[] = [
                    { name: 'totalContainers', numbers: [text1, text2, text3], operation: 'addition', result: totalContainers },
                    { name: 'finalAnswer', numbers: ['totalContainers', numTextPerContainer], operation: 'multiplication', result: finalAnswer }
                ];
            return {
                problemText,
                solution,
                explanation: `Primero, sumamos todos los ${item.container}s: <b>${num1}</b> de ${person1.name} + <b>${num2}</b> de ${person2.name} + <b>${num3}</b> que encontraste = <b>${totalContainers} ${item.container}s</b>. Luego, multiplicamos los ${item.container}s por las ${item.plural} que trae cada uno: <b>${totalContainers} ${item.container}s × ${numPerContainer} ${item.plural}</b> = <b>${finalAnswer} ${item.plural}</b>.`
            };
        }
    },
    // Template for "Dozen Translation & Subtraction"
    {
        generate: () => {
            const items = [ { name: 'huevos' }, { name: 'facturas' }, { name: 'rosas' } ];
            const item = choice(items).name;
            const used = Math.floor(Math.random() * 5) + 6; // 6-10
            const textUsed = numberToWords(used);
            const total = 24; // two dozens
            const answer = total - used;
            
            const solution: SolutionStep[] = [
                    { name: 'finalAnswer', numbers: ["dos docenas", textUsed], operation: 'subtraction', result: answer }
                ];
            return {
                problemText: `La mamá de Juana compró __${JSON.stringify({text: "dos docenas", prompt: "Una docena son 12. ¿Cuántos son dos docenas?", answer: total})}__ de ${item} para una receta. Si usó __${JSON.stringify({text: textUsed, value: used})}__ ${item}, ¿cuántos le quedaron?`,
                solution,
                explanation: `Primero, tenés que saber cuántos son "dos docenas". Como una docena son 12, dos docenas son <b>${total}</b>. Si usó ${used}, restamos para saber cuántos quedaron: <b>${total} - ${used} = ${answer} ${item}</b>.`
            }
        }
    },
    // Template for "Multiplication with Distractors"
    {
        generate: () => {
            const items = [
                { singular: 'bicicleta', plural: 'bicicletas', parts: [{name: 'ruedas', count: 2}, {name: 'pedales', count: 2}]},
                { singular: 'triciclo', plural: 'triciclos', parts: [{name: 'ruedas', count: 3}, {name: 'pedales', count: 2}]},
                { singular: 'auto de juguete', plural: 'autos de juguete', parts: [{name: 'ruedas', count: 4}, {name: 'puertas', count: 2}]}
            ];
            const item = choice(items);
            const part = choice(item.parts);
            const numItems = Math.floor(Math.random() * 4) + 3; // 3-6
            const textItems = numberToWords(numItems);
            const answer = numItems * part.count;

            const solution: SolutionStep[] = [
                    { name: 'finalAnswer', numbers: [textItems, numberToWords(part.count)], operation: 'multiplication', result: answer }
                ];
            return {
                problemText: `Para armar un${item.singular === 'auto de juguete' ? '' : 'a'} ${item.singular} se necesitan __${JSON.stringify({text: numberToWords(part.count), value: part.count})}__ ${part.name}, __${JSON.stringify({text: "un", value: 1})}__ manubrio y __${JSON.stringify({text: "un", value: 1})}__ asiento. Si en la fábrica armaron __${JSON.stringify({text: textItems, value: numItems})}__ ${item.plural}, ¿cuántas ${part.name} usaron?`,
                solution,
                explanation: `El problema pregunta sólo por las ${part.name}. Cada ${item.singular} necesita ${part.count}. Si armaron ${numItems} ${item.plural}, multiplicamos: <b>${numItems} ${item.plural} × ${part.count} ${part.name} = ${answer} ${part.name}</b>. Los otros datos no se usan.`
            }
        }
    },
    // Template for "Time Translation & Subtraction"
    {
        generate: () => {
            const durations = [
                { text: 'media hora', prompt: '¿Cuántos minutos son media hora?', answer: 30 },
                { text: 'una hora', prompt: '¿Cuántos minutos hay en una hora?', answer: 60 }
            ];
            const duration = choice(durations);
            const elapsed = choice([10, 15, 20]);
            const textElapsed = numberToWords(elapsed);
            const answer = duration.answer - elapsed;
            
            const solution: SolutionStep[] = [
                    { name: 'finalAnswer', numbers: [duration.text, textElapsed], operation: 'subtraction', result: answer }
                ];
            return {
                 problemText: `Mi programa favorito dura __${JSON.stringify(duration)}__. Si ya pasaron __${JSON.stringify({text: textElapsed, value: elapsed})}__ minutos, ¿cuántos minutos faltan para que termine?`,
                solution,
                explanation: `"${duration.text}" son <b>${duration.answer}</b> minutos. Para saber cuánto falta, restamos los minutos que ya pasaron del total: <b>${duration.answer} minutos - ${elapsed} minutos = ${answer} minutos</b>.`
            }
        }
    },
     // Template for "Change Calculation"
    {
        generate: () => {
            const items = [
                { name: 'alfajor', price: 80, textPrice: 'ochenta' },
                { name: 'jugo', price: 120, textPrice: 'ciento veinte' },
                { name: 'paquete de galletitas', price: 150, textPrice: 'ciento cincuenta' }
            ];
            const payments = [
                { text: 'cien', value: 100 },
                { text: 'doscientos', value: 200 },
                { text: 'quinientos', value: 500 },
            ];
            const item = choice(items);
            const payment = choice(payments.filter(p => p.value > item.price));
            const answer = payment.value - item.price;
            
            const solution: SolutionStep[] = [
                    { name: 'finalAnswer', numbers: [payment.text, item.textPrice], operation: 'subtraction', result: answer }
                ];
            return {
                problemText: `Quiero comprar __${JSON.stringify({text: "un", value: 1})}__ ${item.name} que cuesta __${JSON.stringify({text: item.textPrice, value: item.price})}__ pesos. Si pago con un billete de __${JSON.stringify(payment)}__ pesos, ¿cuánto vuelto me dan?`,
                solution,
                explanation: `Para saber el vuelto, restamos el precio del ${item.name} de lo que pagamos: <b>${payment.value} - ${item.price} = ${answer} pesos</b>. La cantidad de ${item.name}s ("un") es un dato que no se usa en este caso.`
            }
        }
    },
    // Template for "Division for Pairs"
    {
        generate: () => {
            const items = [ { name: 'medias', pair: 'pares de medias' }, { name: 'guantes', pair: 'pares de guantes' }, { name: 'aros', pair: 'pares de aros' }];
            const item = choice(items);
            const total = (Math.floor(Math.random() * 5) + 4) * 2; // 8-16, even
            const textTotal = numberToWords(total);
            const answer = total / 2;

            const solution: SolutionStep[] = [
                    { name: 'finalAnswer', numbers: [textTotal, 'dos'], operation: 'division', result: answer }
                ];
            return {
                problemText: `En una caja hay __${JSON.stringify({text: textTotal, value: total})}__ ${item.name}, todos del mismo color. Sabiendo que un par son __${JSON.stringify({text: 'dos', value: 2})}__, ¿cuántos <b>${item.pair}</b> puedo formar?`,
                solution,
                explanation: `Un par son <b>dos</b>. Para saber cuántos pares podemos formar, dividimos el total de ${item.name} (<b>${total}</b>) por 2: <b>${total} ÷ 2 = ${answer} ${item.pair}</b>.`
            }
        }
    },
    // Template for "Fractional Age & Future Age"
    {
        generate: () => {
            const names = [{p1: 'Juan', p2: 'Ana'}, {p1: 'Lucas', p2: 'Sofía'}, {p1: 'Mateo', p2: 'Lucía'}];
            const namePair = choice(names);
            const age1 = choice([10, 12, 14, 16]);
            const age2 = age1 / 2;
            const futureYears = Math.floor(Math.random() * 3) + 3; // 3-5
            const textFuture = numberToWords(futureYears);
            const answer = age2 + futureYears;

            const solution: SolutionStep[] = [
                    // This is a unary step. The "translation" stage already solved "la mitad de X".
                    // This step just brings that solved value into the calculator's context.
                    { name: 'currentAge', numbers: ['la mitad'], operation: 'addition', result: age2 },
                    { name: 'finalAnswer', numbers: ["currentAge", textFuture], operation: 'addition', result: answer }
                ];
            return {
                 problemText: `${namePair.p1} tiene __${JSON.stringify({text: numberToWords(age1), value: age1})}__ años. Su hermana ${namePair.p2} tiene __${JSON.stringify({text: "la mitad", prompt: `¿Cuál es la mitad de ${age1}?`, answer: age2})}__ de su edad. ¿Cuántos años tendrá ${namePair.p2} en __${JSON.stringify({text: textFuture, value: futureYears})}__ años?`,
                solution,
                explanation: `Primero, calculamos la edad actual de ${namePair.p2}: "la mitad" de ${age1} es <b>${age2} años</b>. Luego, le sumamos los ${futureYears} años del futuro: <b>${age2} + ${futureYears} = ${answer} años</b>.`
            }
        }
    },
     // Template for "Multi-step Shopping with Change"
    {
        generate: () => {
            const item1 = { name: "helado", price: 200, text: "doscientos" };
            const item2 = { name: "galletitas", price: 50, text: "cincuenta" };
            const paymentAmount = 300;
            const paymentText = "tres billetes de cien";

            const totalCost = item1.price + item2.price;
            const change = paymentAmount - totalCost;

            const solution: SolutionStep[] = [
                    { name: 'totalCost', numbers: [item1.text, item2.text], operation: 'addition', result: totalCost },
                    { name: 'finalAnswer', numbers: [paymentText, 'totalCost'], operation: 'subtraction', result: change }
                ];
            return {
                problemText: `Quiero comprar un ${item1.name} que cuesta __${JSON.stringify({text: item1.text, value: item1.price})}__ pesos y un paquete de ${item2.name} de __${JSON.stringify({text: item2.text, value: item2.price})}__ pesos. Si en mi billetera tengo __${JSON.stringify({text: paymentText, prompt: `¿Cuánto dinero son ${paymentText}?`, answer: paymentAmount})}__, ¿cuánto dinero me sobrará?`,
                solution,
                explanation: `Primero, calculamos el costo total de la compra: el ${item1.name} (<b>${item1.price}</b>) más las ${item2.name} (<b>${item2.price}</b>) suman <b>${totalCost} pesos</b>. Luego, calculamos cuánto dinero tenés: ${paymentText} son <b>${paymentAmount} pesos</b>. Para saber el vuelto, restamos: <b>${paymentAmount} - ${totalCost} = ${change} pesos</b>.`
            };
        }
    },
    // NEW TEMPLATE: Working Backwards
    {
        generate: () => {
            const items = [
                { singular: 'alfajor', price: 150 },
                { singular: 'jugo', price: 120 },
                { singular: 'paquete de figuritas', price: 200 }
            ];
            const people = ['Lola', 'Tomás', 'Martina', 'Benjamín'];
            
            const person = choice(people);
            const item = choice(items);
            const remaining = Math.floor(Math.random() * 100) + 50; // 50-149
            const spent = item.price;
            const initial = spent + remaining;

            const spentObj = { text: numberToWords(spent), value: spent };
            const remainingObj = { text: numberToWords(remaining), value: remaining };

            const problemText = `${person} fue al kiosco con su dinero. Gastó __${JSON.stringify(spentObj)}__ pesos en un ${item.singular}. Al volver, se dio cuenta de que le quedaban __${JSON.stringify(remainingObj)}__ pesos. ¿Con cuánto dinero había salido de su casa?`;
            
            const solution: SolutionStep[] = [
                { name: 'finalAnswer', numbers: [spentObj.text, remainingObj.text], operation: 'addition', result: initial }
            ];
                
            return {
                problemText,
                solution,
                explanation: `Este es un problema 'para atrás'. Si gastó <b>${spent}</b> y le quedaron <b>${remaining}</b>, para saber cuánto tenía al principio tenemos que juntar (sumar) esas dos cantidades. La <b>suma</b> ${spent} + ${remaining} nos da <b>${initial} pesos</b>.`
            };
        }
    },
    // NEW TEMPLATE: Multi-step Comparison
    {
        generate: () => {
            const items = [ { p: 'figuritas' }, { p: 'caramelos' }, { p: 'libros' } ];
            const names = [ { p1: 'Ana', p2: 'Juan', p3: 'Sofía' }, { p1: 'Leo', p2: 'Mía', p3: 'Teo' } ];
            
            const item = choice(items).p;
            const nameSet = choice(names);
            
            const n1 = Math.floor(Math.random() * 5) + 5; // 5-9
            const multiplier = choice([ { text: 'el doble', val: 2 }, { text: 'el triple', val: 3 } ]);
            const n2 = n1 * multiplier.val;
            const less = Math.floor(Math.random() * 4) + 2; // 2-5
            const answer = n2 - less;

            const n1Obj = { text: numberToWords(n1), value: n1 };
            const multObj = { text: multiplier.text, prompt: `¿Cuánto es ${multiplier.text} de ${n1}?`, answer: n2 };
            const lessObj = { text: numberToWords(less), value: less };

            const problemText = `${nameSet.p1} tiene __${JSON.stringify(n1Obj)}__ ${item}. ${nameSet.p2} tiene __${JSON.stringify(multObj)}__ que ${nameSet.p1}. ${nameSet.p3} tiene __${JSON.stringify(lessObj)}__ ${item} menos que ${nameSet.p2}. ¿Cuántos ${item} tiene ${nameSet.p3}?`;

            const solution: SolutionStep[] = [
                { name: 'p2_items', numbers: [multiplier.text], operation: 'addition', result: n2 }, // Unary step
                { name: 'finalAnswer', numbers: ['p2_items', lessObj.text], operation: 'subtraction', result: answer }
            ];

            return {
                problemText,
                solution,
                explanation: `Primero, calculamos cuántos ${item} tiene ${nameSet.p2}: <b>${multiplier.text} de ${n1} es ${n2}</b>. Luego, a ese resultado le restamos los ${less} que tiene de menos ${nameSet.p3}: <b>${n2} - ${less} = ${answer} ${item}</b>.`
            };
        }
    },
    // NEW TEMPLATE: Division (Reversal of assembly problem)
    {
        generate: () => {
            // FIX: Add 'as const' to infer literal types for partGender property, preventing a type error in numberToWords.
            const items = [
                { singular: 'bicicleta', plural: 'bicicletas', part: 'ruedas', partGender: 'f', count: 2 },
                { singular: 'triciclo', plural: 'triciclos', part: 'ruedas', partGender: 'f', count: 3 },
                { singular: 'auto de juguete', plural: 'autos de juguete', part: 'ruedas', partGender: 'f', count: 4 }
            ] as const;

            const item = choice(items);
            const numItems = Math.floor(Math.random() * 4) + 3; // 3-6
            const totalParts = numItems * item.count;
            
            const totalPartsObj = { text: numberToWords(totalParts, item.partGender), value: totalParts };
            const partsPerItemObj = { text: numberToWords(item.count, item.partGender), value: item.count };

            const problemText = `En una fábrica de ${item.plural}, se usaron un total de __${JSON.stringify(totalPartsObj)}__ ${item.part}. Si cada ${item.singular} lleva __${JSON.stringify(partsPerItemObj)}__ ${item.part}, ¿cuántos ${item.plural} se armaron?`;

            const solution: SolutionStep[] = [
                { name: 'finalAnswer', numbers: [totalPartsObj.text, partsPerItemObj.text], operation: 'division', result: numItems }
            ];

            return {
                problemText,
                solution,
                explanation: `Para saber cuántos ${item.plural} se armaron, tenemos que repartir (dividir) el total de ${item.part} usadas (<b>${totalParts}</b>) por la cantidad que lleva cada ${item.singular} (<b>${item.count}</b>). La <b>división</b> es ${totalParts} ÷ ${item.count} = <b>${numItems} ${item.plural}</b>.`
            };
        }
    }
];


// Generation logic
const finalProblems: Omit<ReasoningGauntletExercise, 'id' | 'type' | 'question' | 'difficulty'>[] = [];
const TOTAL_PROBLEMS = 40; // Generate a good number of problems for variety

for (let i = 0; i < TOTAL_PROBLEMS; i++) {
    const template = problemTemplates[i % problemTemplates.length];
    finalProblems.push(template.generate());
}

export const reasoningGauntletExercises: ReasoningGauntletExercise[] = finalProblems.map((p, i): ReasoningGauntletExercise => ({
    ...p,
    id: `reasoning-gauntlet-gen-${i}`,
    type: ExerciseType.ReasoningGauntlet,
    question: "Resolvé el problema paso a paso",
    difficulty: 3
}));
