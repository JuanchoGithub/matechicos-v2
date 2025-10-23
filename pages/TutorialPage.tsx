import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NumberPad from '../components/NumberPad';
import Button from '../components/Button';
import { ArrowLeftIcon, LightBulbIcon } from '../components/icons';

type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

// Helper to generate a simple problem
const generateProblem = (operation: Operation) => {
    let a, b;
    switch (operation) {
        case 'addition':
            a = Math.floor(Math.random() * 90) + 10;
            b = Math.floor(Math.random() * 90) + 10;
            return { a, b, answer: a + b, operator: '+' };
        case 'subtraction':
            a = Math.floor(Math.random() * 90) + 10;
            b = Math.floor(Math.random() * (a - 9)) + 10;
            return { a, b, answer: a - b, operator: '-' };
        case 'multiplication':
            a = Math.floor(Math.random() * 8) + 2; // 2-9
            b = Math.floor(Math.random() * 8) + 2; // 2-9
            return { a, b, answer: a * b, operator: '×' };
        case 'division':
            b = Math.floor(Math.random() * 8) + 2; // divisor 2-9
            const multiplier = Math.floor(Math.random() * 8) + 2; // result 2-9
            a = b * multiplier;
            return { a, b, answer: a / b, operator: '÷' };
    }
};

const operationExplanations: Record<Operation, { title: string; steps: string[] }> = {
    addition: {
        title: "Aprendé a Sumar",
        steps: [
            "¡Sumar es juntar cosas!",
            "Empezamos por la derecha, con las UNIDADES.",
            "Sumamos los números de esa columna.",
            "Si el resultado tiene dos cifras, ¡llevamos una a la columna de las DECENAS!",
            "Luego, sumamos la columna de las DECENAS (¡sin olvidar la que nos llevamos!).",
            "¡Y listo! Ya tenés el resultado."
        ]
    },
    subtraction: {
        title: "Aprendé a Restar",
        steps: [
            "¡Restar es quitar cosas!",
            "Empezamos por la derecha, con las UNIDADES.",
            "Al número de arriba, le quitamos el de abajo.",
            "Si el número de arriba es más chiquito, ¡le pide prestado a su vecino de las DECENAS!",
            "El vecino le presta 10, y se convierte en un número más pequeño.",
            "Luego, restamos la columna de las DECENAS.",
            "¡Y ya está! Tenés el resultado."
        ]
    },
    multiplication: {
        title: "Aprendé a Multiplicar",
        steps: [
            "¡Multiplicar es como sumar el mismo número muchas veces!",
            "Tomamos el número de abajo (el multiplicador).",
            "Lo multiplicamos primero por las UNIDADES del número de arriba.",
            "Si el resultado tiene dos cifras, nos llevamos la decena.",
            "Luego, lo multiplicamos por las DECENAS del número de arriba y sumamos lo que nos llevamos.",
            "¡Genial! Ya tenés el resultado final."
        ]
    },
    division: {
        title: "Aprendé a Dividir",
        steps: [
            "¡Dividir es repartir en partes iguales!",
            "Pensá: ¿cuántas veces entra el número más chico (divisor) en el número más grande (dividendo)?",
            "¡Es como una multiplicación al revés!",
            "Por ejemplo, para 12 ÷ 3, te preguntás: ¿qué número multiplicado por 3 da 12?",
            "La respuesta es 4, ¡porque 3 × 4 = 12!",
            "¡Así de fácil! ¡Ya sabés dividir!"
        ]
    }
};

const staticHints: Record<Operation, string[]> = {
    addition: [
        "¡Uy! Probá de nuevo. ¿Empezaste a sumar por los números de la derecha (las unidades)? 🤔",
        "Recordá que si la suma de una columna te da 10 o más, ¡tenés que 'llevarte' un número a la columna siguiente! 🚀",
        "Asegurate de sumar bien los numeritos de cada columna. ¡Vos podés! ✨"
    ],
    subtraction: [
        "¡Casi! ¿Te acordaste que si el número de arriba es más chiquito, tiene que 'pedirle prestado' al vecino? 🙏",
        "Revisá la resta de la columna de la derecha. ¡A veces nos confundimos ahí! 😉",
        "¡Vamos! La resta es quitar. Al número de arriba le quitamos el de abajo. ¡Fijate bien! 👀"
    ],
    multiplication: [
        "Recordá que multiplicar es como sumar un número varias veces. Por ejemplo, si tenés que hacer 4 × 3, ¡es lo mismo que sumar el 4 tres veces: 4 + 4 + 4! ¡Intentálo así! ➕"
    ],
    division: [
        "¡Casi! Intentá pensar en la tabla de multiplicar del número más chico. ¿Qué multiplicación te da el número grande como resultado?",
        "Imaginá que tenés galletas y amigos. Si tenés 8 galletas y 4 amigos, ¿cuántas le das a cada uno para que todos tengan la misma cantidad? 🍪",
        "Dividir es lo contrario de multiplicar. ¡Probá pensar qué número te falta en la multiplicación! 🤔"
    ]
};

interface AdditionWizardState {
  step: 0 | 1 | 2 | 3; // 0: inactive, 1: units, 2: tens, 3: summary
  unitsResult: string;
  tensResult: string;
  carry: number | null;
}

const TutorialPage: React.FC = () => {
    const { operation: operationParam } = useParams<'operation'>();
    const navigate = useNavigate();

    const operation = useMemo(() => {
        if (operationParam && ['addition', 'subtraction', 'multiplication', 'division'].includes(operationParam)) {
            return operationParam as Operation;
        }
        return null;
    }, [operationParam]);

    const [problem, setProblem] = useState(() => operation ? generateProblem(operation) : { a: 0, b: 0, answer: 0, operator: '+' });
    const [userAnswer, setUserAnswer] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [multiplicationRemediationStep, setMultiplicationRemediationStep] = useState(0); 
    const [divisionRemediationStep, setDivisionRemediationStep] = useState(0);

    const [additionWizard, setAdditionWizard] = useState<AdditionWizardState>({
        step: 0, unitsResult: '', tensResult: '', carry: null,
    });

    const explanation = useMemo(() => operation ? operationExplanations[operation] : { title: '', steps: [] }, [operation]);

    const handleNewProblem = useCallback(() => {
        if (!operation) return;
        setProblem(generateProblem(operation));
        setUserAnswer('');
        setFeedbackMessage('');
        setIsCorrect(null);
        setMultiplicationRemediationStep(0);
        setDivisionRemediationStep(0);
        setAdditionWizard({ step: 0, unitsResult: '', tensResult: '', carry: null });
    }, [operation]);

    const { a_units, a_tens, b_units, b_tens } = useMemo(() => ({
        a_units: problem.a % 10,
        a_tens: Math.floor(problem.a / 10),
        b_units: problem.b % 10,
        b_tens: Math.floor(problem.b / 10),
    }), [problem]);

    const handleSubmit = () => {
        if (!userAnswer || !operation) return;

        const answerNumber = parseInt(userAnswer, 10);

        // --- Addition Wizard Logic ---
        if (operation === 'addition' && additionWizard.step > 0) {
            if (additionWizard.step === 1) { // Solving units
                const correctUnitsSum = a_units + b_units;
                if (answerNumber === correctUnitsSum) {
                    const carry = Math.floor(correctUnitsSum / 10);
                    const unitsDisplay = correctUnitsSum % 10;
                    setAdditionWizard(prev => ({ ...prev, step: 2, carry, unitsResult: String(unitsDisplay) }));
                    setUserAnswer('');
                    let nextMessage = `¡Excelente! El resultado es ${correctUnitsSum}. Dejamos el ${unitsDisplay} abajo y `;
                    if (carry > 0) {
                        nextMessage += `nos llevamos el ${carry} a la columna de las decenas.`;
                    } else {
                        nextMessage += `como no hay llevada, seguimos con las decenas.`;
                    }
                    nextMessage += `\nAhora, ¿cuánto suman las decenas?`;
                    setFeedbackMessage(nextMessage);
                    setIsCorrect(null);
                } else {
                    setFeedbackMessage(`¡Casi! Volvé a intentar sumar ${a_units} + ${b_units}. ¡Vos podés!`);
                    setIsCorrect(false);
                }
                return;
            }
            if (additionWizard.step === 2) { // Solving tens
                const correctTensSum = a_tens + b_tens + (additionWizard.carry || 0);
                if (answerNumber === correctTensSum) {
                    setAdditionWizard(prev => ({ ...prev, step: 3, tensResult: String(correctTensSum) }));
                    setUserAnswer('');
                    setFeedbackMessage(`¡Perfecto! Juntando todo, el resultado final es ${problem.answer}. ¡Lo hiciste genial!`);
                    setIsCorrect(true);
                } else {
                    let hint = `Mmm, revisemos la suma de las decenas. Es ${a_tens} + ${b_tens}`;
                    if(additionWizard.carry) hint += ` + ${additionWizard.carry} que nos llevamos.`;
                    setFeedbackMessage(hint);
                    setIsCorrect(false);
                }
                return;
            }
        }

        // --- Default Problem Logic ---
        const isAnswerCorrect = answerNumber === problem.answer;

        if (isAnswerCorrect) {
            setIsCorrect(true);
            setFeedbackMessage('¡Muy bien! ¡Esa es la respuesta correcta! 🎉');
        } else {
            setIsCorrect(false);
            if (operation === 'addition') {
                setAdditionWizard(prev => ({ ...prev, step: 1 }));
                setFeedbackMessage(`¡Ups! Vamos a hacerlo paso a paso.\nEmpecemos por la derecha, las unidades. ¿Cuánto es ${a_units} + ${b_units}?`);
                setUserAnswer('');
            } else if (operation === 'multiplication' && multiplicationRemediationStep < 2) {
                const newStep = multiplicationRemediationStep + 1;
                setMultiplicationRemediationStep(newStep);
                setUserAnswer(''); 
                
                if (newStep === 1) {
                    setFeedbackMessage(`¡Ups! No es correcto. Probemos de otra forma. Multiplicar ${problem.a} × ${problem.b} es lo mismo que sumar el ${problem.a} un total de ${problem.b} veces. ¡Intentá resolver la suma!`);
                } else if (newStep === 2) {
                    setFeedbackMessage(`Mmm, tampoco. ¡No te preocupes! Vamos a lo más básico. Simplemente contá todos los palitos que ves abajo.`);
                }
            } else if (operation === 'division' && divisionRemediationStep < 1) {
                setDivisionRemediationStep(1);
                setUserAnswer('');
                setFeedbackMessage(`¡No te preocupes! Pensemoslo al revés. ¿Qué número multiplicado por ${problem.b} nos da ${problem.a}?`);
            }
            else {
                 const hints = staticHints[operation];
                 if (operation === 'multiplication' && multiplicationRemediationStep === 2) {
                    setFeedbackMessage('¡Casi! Tomate tu tiempo y contá cada palito con cuidado. ¡Uno por uno!');
                } else {
                    const randomHint = hints[Math.floor(Math.random() * hints.length)];
                    setFeedbackMessage(randomHint);
                }
            }
        }
    };
    
    if (!operation) {
        navigate('/');
        return null;
    }

    const renderAdditionWizard = () => {
        const step = additionWizard.step;
        const colStyle = "flex flex-col items-center justify-center font-mono text-4xl sm:text-5xl md:text-6xl font-bold gap-2 p-1 sm:p-2 rounded-lg transition-all";
        const unitsColStyle = `${colStyle} ${step === 1 ? 'bg-brand-secondary/30' : ''}`;
        const tensColStyle = `${colStyle} ${step === 2 ? 'bg-brand-secondary/30' : ''}`;
        
        return (
            <div className="grid grid-cols-2 gap-x-2 w-40 sm:w-48 text-right">
                {/* Carry Row */}
                <div className={`h-10 sm:h-12 flex items-center justify-center ${step > 1 && additionWizard.carry ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-200 text-yellow-700 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold animate-bounce">
                        {additionWizard.carry}
                    </span>
                </div>
                <div className="h-10 sm:h-12"></div>
    
                {/* Numbers */}
                <div className={tensColStyle}>{a_tens}</div>
                <div className={unitsColStyle}>{a_units}</div>
                <div className={`flex items-center justify-end text-4xl sm:text-5xl font-bold text-gray-400`}>+</div>
                <div></div> {/* Empty space before second number */}
                <div className={tensColStyle}>{b_tens}</div>
                <div className={unitsColStyle}>{b_units}</div>
    
                {/* Divider */}
                <div className="col-span-2 border-t-4 border-gray-700 my-2"></div>
    
                {/* Result */}
                <div className={tensColStyle}>{step === 3 ? additionWizard.tensResult : '?'}</div>
                <div className={unitsColStyle}>{step > 1 ? additionWizard.unitsResult : '?'}</div>
            </div>
        );
    };

    const renderProblemContent = () => {
        if (operation === 'addition' && additionWizard.step > 0) {
            return renderAdditionWizard();
        }
        
        if (operation === 'multiplication' && multiplicationRemediationStep > 0) {
            if (multiplicationRemediationStep === 1) { // Repeated Addition
                const additionString = Array(problem.b).fill(problem.a).join(' + ');
                return <div className="my-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight p-2">{additionString}</div>;
            }
            if (multiplicationRemediationStep === 2) { // Counting "Palitos"
                 const groups = Array(problem.b).fill(0).map((_, groupIndex) => (
                    <div key={groupIndex} className="flex flex-wrap justify-center items-center gap-1 border-2 border-brand-secondary/50 rounded-lg p-1 m-1">
                        {Array(problem.a).fill(0).map((_, stickIndex) => (
                            <span key={stickIndex} className="text-xl md:text-2xl text-brand-primary font-bold select-none">|</span>
                        ))}
                    </div>
                ));
                return <div className="flex flex-wrap justify-center items-center p-2">{groups}</div>;
            }
        }

        if (operation === 'division' && divisionRemediationStep > 0) {
            return (
                <div className="my-4 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight p-2 flex items-center justify-center">
                    <span>{problem.b}</span>
                    <span className="mx-2 sm:mx-4 text-gray-400">×</span>
                    <span className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-dashed border-brand-primary rounded-2xl flex items-center justify-center text-brand-primary">?</span>
                    <span className="mx-2 sm:mx-4 text-gray-400">=</span>
                    <span>{problem.a}</span>
                </div>
            );
        }
        
        // Default case: render the original problem
        return (
            <div className="my-4 text-6xl md:text-7xl font-extrabold tracking-wider">
                <span>{problem.a}</span>
                <span className="mx-2 sm:mx-4 text-gray-400">{problem.operator}</span>
                <span>{problem.b}</span>
            </div>
        );
    };


    return (
        <div className="flex flex-col gap-4 h-full flex-grow relative">
            <button 
                onClick={() => navigate(-1)} 
                className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-200 transition-colors"
                aria-label="Volver"
            >
                <ArrowLeftIcon className="w-6 h-6" /> <span className="hidden sm:inline">Volver</span>
            </button>
            
            <div className="w-full bg-brand-primary/10 p-4 rounded-3xl">
                <h1 className="text-2xl md:text-3xl font-extrabold text-brand-primary mb-3 text-center">{explanation.title}</h1>
                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {explanation.steps.map((step, index) => (
                        <li key={index} className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full shadow-sm">
                            <span className="text-lg">✨</span>
                            <span className="text-sm md:text-base">{step}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="w-full flex-grow flex flex-col gap-4">
                 { feedbackMessage && (
                     <div className={`p-3 rounded-2xl flex items-start gap-3 transition-colors ${isCorrect === true ? 'bg-green-100' : isCorrect === false ? 'bg-red-100' : 'bg-blue-100'}`}>
                         <LightBulbIcon className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mt-1 ${isCorrect === true ? 'text-green-500' : isCorrect === false ? 'text-red-500' : 'text-blue-500'}`} />
                         <div>
                             <p className="font-bold text-md sm:text-lg">{isCorrect ? '¡Excelente!' : 'Un consejo:'}</p>
                             <p className="text-sm sm:text-base whitespace-pre-line">{feedbackMessage}</p>
                         </div>
                    </div>
                )}
                
                <div className="flex-grow flex flex-col md:flex-row gap-4">
                    <main className="bg-white p-4 rounded-3xl shadow-2xl text-center flex-grow flex flex-col items-center justify-center min-h-[250px]">
                        <p className="text-lg md:text-xl mb-2 sm:mb-4">¡Ahora, a practicar!</p>
                        {renderProblemContent()}
                    </main>

                    <aside className="w-full md:max-w-xs lg:max-w-sm flex-shrink-0">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-lg flex flex-col h-full justify-center gap-4">
                             <input
                                type="text"
                                readOnly
                                value={userAnswer}
                                className="text-4xl sm:text-5xl text-center font-bold w-full p-2 sm:p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl"
                                placeholder="?"
                            />
                            <NumberPad 
                                onNumberClick={(num) => setUserAnswer(prev => prev.length < 5 ? prev + num : prev)}
                                onDeleteClick={() => setUserAnswer(prev => prev.slice(0, -1))}
                            />
                             <div className="flex flex-col gap-2">
                                <Button onClick={handleSubmit} disabled={!userAnswer || additionWizard.step === 3} className="w-full">Revisá</Button>
                                <Button onClick={handleNewProblem} variant="secondary" className="w-full">Otro Problema</Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default TutorialPage;