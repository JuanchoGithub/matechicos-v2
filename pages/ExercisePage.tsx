import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { grades } from '../data';
import { ExerciseMode } from '../types';

import StagedDecompositionGame from './exercises/StagedDecompositionGame';
import MultiplicationDecompositionGame from './exercises/MultiplicationDecompositionGame';
import StandardExercise from './exercises/StandardExercise';

const ExercisePage: React.FC = () => {
    const { gradeId, topicId } = useParams();
    
    const topic = useMemo(() => 
        grades.find(g => g.id === gradeId)?.topics.find(t => t.id === topicId),
        [gradeId, topicId]
    );

    if (!topic || !gradeId) {
        return <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold">Cargando tema...</h2>
        </div>;
    }

    // Use a default mode if not specified for backward compatibility
    const mode = topic.exerciseMode ?? ExerciseMode.Standard;

    switch (mode) {
        case ExerciseMode.PedagogicalDecompositionMultiplication:
            return <MultiplicationDecompositionGame topic={topic} gradeId={gradeId} />;
        
        case ExerciseMode.StagedDecompositionSubtraction:
            return <StagedDecompositionGame topic={topic} gradeId={gradeId} operation="subtraction" />;
        
        case ExerciseMode.StagedDecompositionAddition:
            return <StagedDecompositionGame topic={topic} gradeId={gradeId} operation="addition" />;

        case ExerciseMode.Standard:
        default:
            return <StandardExercise topic={topic} gradeId={gradeId} />;
    }
};

export default ExercisePage;