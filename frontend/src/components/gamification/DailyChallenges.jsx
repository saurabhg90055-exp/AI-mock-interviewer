import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Clock, CheckCircle, Trophy, 
    Lock, ChevronRight, Target 
} from 'lucide-react';
import './DailyChallenges.css';

const DailyChallenges = ({ 
    challenges = [],
    completedIds = [],
    onChallengeStart,
    onChallengeComplete 
}) => {
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    
    const defaultChallenges = [
        {
            id: 'dc1',
            title: 'Quick Fire Round',
            description: 'Answer 5 questions in under 3 minutes each',
            xp: 50,
            difficulty: 'easy',
            timeLimit: '15 min',
            type: 'speed'
        },
        {
            id: 'dc2',
            title: 'STAR Master',
            description: 'Use the STAR method perfectly in 3 behavioral questions',
            xp: 75,
            difficulty: 'medium',
            timeLimit: '20 min',
            type: 'technique'
        },
        {
            id: 'dc3',
            title: 'Deep Dive',
            description: 'Score 8+ on a technical system design question',
            xp: 100,
            difficulty: 'hard',
            timeLimit: '30 min',
            type: 'mastery'
        }
    ];
    
    const displayChallenges = challenges.length > 0 ? challenges : defaultChallenges;
    
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return '#10b981';
            case 'medium': return '#fbbf24';
            case 'hard': return '#ef4444';
            default: return '#6366f1';
        }
    };
    
    const getTimeRemaining = () => {
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const diff = endOfDay - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${mins}m`;
    };
    
    return (
        <div className="daily-challenges">
            <div className="challenges-header">
                <div className="header-left">
                    <Zap size={20} />
                    <h3>Daily Challenges</h3>
                </div>
                <div className="time-remaining">
                    <Clock size={14} />
                    <span>Resets in {getTimeRemaining()}</span>
                </div>
            </div>
            
            <div className="challenges-progress">
                <div className="progress-text">
                    <span>{completedIds.length} / {displayChallenges.length} completed</span>
                    <span className="xp-potential">
                        +{displayChallenges.reduce((acc, c) => acc + (completedIds.includes(c.id) ? 0 : c.xp), 0)} XP potential
                    </span>
                </div>
                <div className="progress-bar">
                    <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedIds.length / displayChallenges.length) * 100}%` }}
                    />
                </div>
            </div>
            
            <div className="challenges-list">
                {displayChallenges.map((challenge, index) => {
                    const isCompleted = completedIds.includes(challenge.id);
                    const isSelected = selectedChallenge?.id === challenge.id;
                    
                    return (
                        <motion.div
                            key={challenge.id}
                            className={`challenge-card ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => !isCompleted && setSelectedChallenge(isSelected ? null : challenge)}
                        >
                            <div className="challenge-icon">
                                {isCompleted ? (
                                    <CheckCircle size={24} />
                                ) : (
                                    <Target size={24} />
                                )}
                            </div>
                            
                            <div className="challenge-info">
                                <div className="challenge-top">
                                    <h4 className="challenge-title">{challenge.title}</h4>
                                    <span 
                                        className="difficulty-badge"
                                        style={{ 
                                            backgroundColor: `${getDifficultyColor(challenge.difficulty)}20`,
                                            color: getDifficultyColor(challenge.difficulty)
                                        }}
                                    >
                                        {challenge.difficulty}
                                    </span>
                                </div>
                                <p className="challenge-desc">{challenge.description}</p>
                                
                                <div className="challenge-meta">
                                    <span className="time-badge">
                                        <Clock size={12} />
                                        {challenge.timeLimit}
                                    </span>
                                    <span className="xp-badge">
                                        <Trophy size={12} />
                                        +{challenge.xp} XP
                                    </span>
                                </div>
                            </div>
                            
                            <div className="challenge-action">
                                {isCompleted ? (
                                    <span className="completed-badge">Done!</span>
                                ) : (
                                    <ChevronRight size={20} />
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            <AnimatePresence>
                {selectedChallenge && (
                    <motion.div
                        className="challenge-start-panel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <p>Ready to start <strong>{selectedChallenge.title}</strong>?</p>
                        <button
                            className="start-btn"
                            onClick={() => {
                                onChallengeStart?.(selectedChallenge);
                                setSelectedChallenge(null);
                            }}
                        >
                            <Zap size={16} />
                            Start Challenge
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DailyChallenges;
