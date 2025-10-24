import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Button from '../Button';
import { ProblemNumberInText } from '../../types';

interface TextNumberSelectorProps {
    problemText: string;
    onSelectionChange: (numbers: ProblemNumberInText[]) => void;
    onComplete: () => void;
}

const numberRegex = /__(\{.*?\})__/g;

const TextNumberSelector: React.FC<TextNumberSelectorProps> = ({ problemText, onSelectionChange, onComplete }) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    useEffect(() => {
        setSelectedIndices([]);
        onSelectionChange([]);
    }, [problemText, onSelectionChange]);

    const numbers = useMemo(() => {
        try {
            return Array.from(problemText.matchAll(numberRegex), (m, i) => {
                const data = JSON.parse(m[1]);
                // Basic validation
                if (!data.text || (data.value === undefined && data.answer === undefined)) {
                    console.error("Invalid number format in problem text:", m[1]);
                    return null;
                }
                return {
                    fullMatch: m[0],
                    data: data as ProblemNumberInText,
                    index: m.index!,
                };
            }).filter(Boolean) as { fullMatch: string; data: ProblemNumberInText; index: number }[];
        } catch (e) {
            console.error("Failed to parse numbers from problem text:", e);
            return [];
        }
    }, [problemText]);

    const toggleSelection = useCallback((index: number) => {
        setSelectedIndices(prevIndices => {
            const newSelectedIndices = prevIndices.includes(index)
                ? prevIndices.filter(i => i !== index)
                : [...prevIndices, index];

            const selectedNumbersData = newSelectedIndices.map(i => numbers[i].data);
            onSelectionChange(selectedNumbersData);
            
            return newSelectedIndices;
        });
    }, [numbers, onSelectionChange]);

    const content = useMemo(() => {
        const output: React.ReactNode[] = [];
        let lastIndex = 0;

        numbers.forEach((match, i) => {
            const matchIndex = match.index;

            if (matchIndex > lastIndex) {
                const textPart = problemText.substring(lastIndex, matchIndex);
                output.push(<span key={`text-${i}`} dangerouslySetInnerHTML={{ __html: textPart }} />);
            }
            
            const numberData = match.data;
            const isSelected = selectedIndices.includes(i);
            output.push(
                <span
                    key={`num-${i}`}
                    onClick={() => toggleSelection(i)}
                    className={`p-1 rounded-lg transition-all duration-200 cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-500/50 ${isSelected ? 'bg-brand-secondary text-white ring-2 ring-yellow-400' : 'bg-gray-100 dark:bg-dark-subtle'}`}
                >
                    {numberData.text}
                </span>
            );
            
            lastIndex = matchIndex + match.fullMatch.length;
        });

        if (lastIndex < problemText.length) {
            const textPart = problemText.substring(lastIndex);
            output.push(<span key="text-end" dangerouslySetInnerHTML={{ __html: textPart }} />);
        }
        
        return output;
    }, [problemText, numbers, selectedIndices, toggleSelection]);

    return (
        <div className="w-full flex-grow flex flex-col items-center justify-center bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl shadow-2xl space-y-8">
            <h2 className="text-2xl font-bold">Paso 1: Hacé clic en los números que necesitás para resolver el problema.</h2>
            <div className="text-2xl md:text-3xl font-bold leading-relaxed text-center max-w-4xl">
                {content}
            </div>
            <Button onClick={onComplete} disabled={selectedIndices.length === 0}>
                Siguiente Paso
            </Button>
        </div>
    );
};

export default TextNumberSelector;
