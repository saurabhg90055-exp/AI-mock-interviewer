import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, CheckCircle, XCircle, ArrowRight, 
    RotateCcw, Zap, Gauge, Target 
} from 'lucide-react';
import './SkillAssessment.css';

const ASSESSMENT_QUESTIONS = {
    technical: [
        {
            id: 1,
            question: "What is the time complexity of binary search?",
            options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            correct: 1,
            difficulty: 'easy'
        },
        {
            id: 2,
            question: "Which design pattern uses a single instance?",
            options: ["Factory", "Observer", "Singleton", "Strategy"],
            correct: 2,
            difficulty: 'medium'
        },
        {
            id: 3,
            question: "What does ACID stand for in databases?",
            options: [
                "Atomicity, Consistency, Isolation, Durability",
                "Access, Control, Integration, Data",
                "Automatic, Concurrent, Independent, Distributed",
                "Algorithm, Cache, Index, Database"
            ],
            correct: 0,
            difficulty: 'medium'
        }
    ],
    behavioral: [
        {
            id: 1,
            question: "What does STAR stand for in the STAR method?",
            options: [
                "Situation, Task, Action, Result",
                "Strategy, Tactics, Analysis, Review",
                "Story, Theme, Action, Resolution",
                "Skill, Training, Assessment, Rating"
            ],
            correct: 0,
            difficulty: 'easy'
        },
        {
            id: 2,
            question: "Which is the best approach when asked about a failure?",
            options: [
                "Blame external factors",
                "Say you've never failed",
                "Share the failure and lessons learned",
                "Change the subject"
            ],
            correct: 2,
            difficulty: 'easy'
        },
        {
            id: 3,
            question: "When describing leadership, you should focus on:",
            options: [
                "Your title and authority",
                "Influence and outcomes achieved",
                "Number of reports",
                "Years of experience"
            ],
            correct: 1,
            difficulty: 'medium'
        }
    ],
    general: [
        {
            id: 1,
            question: "What's the best way to research a company before an interview?",
            options: [
                "Only check their website",
                "Website, news, Glassdoor, LinkedIn",
                "Ask friends",
                "Don't research, be spontaneous"
            ],
            correct: 1,
            difficulty: 'easy'
        },
        {
            id: 2,
            question: "How should you handle a question you don't know?",
            options: [
                "Make up an answer",
                "Ask clarifying questions and think out loud",
                "Say 'I don't know' immediately",
                "Change the topic"
            ],
            correct: 1,
            difficulty: 'easy'
        },
        {
            id: 3,
            question: "What's a good question to ask the interviewer?",
            options: [
                "What's the salary?",
                "How does the team approach challenges?",
                "Can I work from home?",
                "How soon can I get promoted?"
            ],
            correct: 1,
            difficulty: 'medium'
        }
    ]
};

const SkillAssessment = ({ 
    topic = 'general',
    onComplete,
    onSkip 
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    
    const questions = ASSESSMENT_QUESTIONS[topic] || ASSESSMENT_QUESTIONS.general;
    const currentQuestion = questions[currentIndex];
    
    const handleSelect = (optionIndex) => {
        if (showResult) return;
        setSelectedOption(optionIndex);
    };
    
    const handleSubmit = () => {
        if (selectedOption === null) return;
        
        const isCorrect = selectedOption === currentQuestion.correct;
        setAnswers([...answers, { 
            questionId: currentQuestion.id, 
            selected: selectedOption, 
            correct: isCorrect,
            difficulty: currentQuestion.difficulty
        }]);
        setShowResult(true);
    };
    
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setShowResult(false);
        } else {
            // Assessment complete
            const correctCount = [...answers, { correct: selectedOption === currentQuestion.correct }]
                .filter(a => a.correct).length;
            const score = Math.round((correctCount / questions.length) * 100);
            
            let recommendedDifficulty = 'medium';
            if (score >= 80) recommendedDifficulty = 'hard';
            else if (score < 50) recommendedDifficulty = 'easy';
            
            setIsComplete(true);
            onComplete?.({
                score,
                correctCount,
                totalQuestions: questions.length,
                recommendedDifficulty,
                answers: [...answers, { 
                    questionId: currentQuestion.id, 
                    selected: selectedOption, 
                    correct: selectedOption === currentQuestion.correct 
                }]
            });
        }
    };
    
    const handleRestart = () => {
        setCurrentIndex(0);
        setAnswers([]);
        setSelectedOption(null);
        setShowResult(false);
        setIsComplete(false);
    };
    
    if (isComplete) {
        const correctCount = answers.filter(a => a.correct).length + 
            (selectedOption === currentQuestion?.correct ? 1 : 0);
        const score = Math.round((correctCount / questions.length) * 100);
        
        return (
            <motion.div 
                className="assessment-complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="complete-icon">
                    {score >= 70 ? (
                        <Zap size={48} />
                    ) : (
                        <Target size={48} />
                    )}
                </div>
                <h3>Assessment Complete!</h3>
                <div className="score-display">
                    <span className="score-value">{score}%</span>
                    <span className="score-label">{correctCount}/{questions.length} correct</span>
                </div>
                <div className="recommendation">
                    <Gauge size={18} />
                    <span>Recommended difficulty: <strong>
                        {score >= 80 ? 'Hard' : score < 50 ? 'Easy' : 'Medium'}
                    </strong></span>
                </div>
                <button className="restart-btn" onClick={handleRestart}>
                    <RotateCcw size={16} />
                    Retake Assessment
                </button>
            </motion.div>
        );
    }
    
    return (
        <div className="skill-assessment">
            <div className="assessment-header">
                <div className="header-left">
                    <Brain size={20} />
                    <span>Skill Assessment</span>
                </div>
                <div className="header-right">
                    <span className="progress-text">
                        {currentIndex + 1} / {questions.length}
                    </span>
                    <button className="skip-btn" onClick={onSkip}>
                        Skip
                    </button>
                </div>
            </div>
            
            <div className="progress-bar">
                <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    className="question-card"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <span className={`difficulty-badge ${currentQuestion.difficulty}`}>
                        {currentQuestion.difficulty}
                    </span>
                    <h4 className="question-text">{currentQuestion.question}</h4>
                    
                    <div className="options-list">
                        {currentQuestion.options.map((option, index) => {
                            let optionClass = 'option';
                            if (showResult) {
                                if (index === currentQuestion.correct) {
                                    optionClass += ' correct';
                                } else if (index === selectedOption && selectedOption !== currentQuestion.correct) {
                                    optionClass += ' incorrect';
                                }
                            } else if (index === selectedOption) {
                                optionClass += ' selected';
                            }
                            
                            return (
                                <motion.button
                                    key={index}
                                    className={optionClass}
                                    onClick={() => handleSelect(index)}
                                    whileHover={!showResult ? { scale: 1.01 } : {}}
                                    whileTap={!showResult ? { scale: 0.99 } : {}}
                                >
                                    <span className="option-letter">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="option-text">{option}</span>
                                    {showResult && index === currentQuestion.correct && (
                                        <CheckCircle size={18} className="result-icon" />
                                    )}
                                    {showResult && index === selectedOption && selectedOption !== currentQuestion.correct && (
                                        <XCircle size={18} className="result-icon" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
            
            <div className="assessment-actions">
                {!showResult ? (
                    <motion.button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Check Answer
                    </motion.button>
                ) : (
                    <motion.button
                        className="next-btn"
                        onClick={handleNext}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {currentIndex < questions.length - 1 ? (
                            <>
                                Next Question
                                <ArrowRight size={18} />
                            </>
                        ) : (
                            'See Results'
                        )}
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default SkillAssessment;
