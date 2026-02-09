import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Target, Plus, Minus, Calendar, TrendingUp, 
    CheckCircle, Award, Flame 
} from 'lucide-react';
import './PracticeGoals.css';

const PracticeGoals = ({ 
    currentGoals = { weekly: 3, monthly: 12 },
    progress = { weekly: 1, monthly: 5 },
    streak = 0,
    onGoalsChange 
}) => {
    const [goals, setGoals] = useState(currentGoals);
    
    const adjustGoal = (type, delta) => {
        const newValue = Math.max(1, Math.min(type === 'weekly' ? 14 : 60, goals[type] + delta));
        const newGoals = { ...goals, [type]: newValue };
        setGoals(newGoals);
        onGoalsChange?.(newGoals);
    };
    
    const weeklyPercent = Math.min(100, Math.round((progress.weekly / goals.weekly) * 100));
    const monthlyPercent = Math.min(100, Math.round((progress.monthly / goals.monthly) * 100));
    
    return (
        <div className="practice-goals">
            <div className="goals-header">
                <Target size={20} />
                <h3>Practice Goals</h3>
            </div>
            
            {/* Streak Display */}
            <div className="streak-display">
                <div className="streak-icon">
                    <Flame size={24} />
                </div>
                <div className="streak-info">
                    <span className="streak-count">{streak}</span>
                    <span className="streak-label">Day Streak</span>
                </div>
                {streak >= 7 && (
                    <div className="streak-badge">
                        <Award size={14} />
                        <span>{streak >= 30 ? 'Legend!' : 'On Fire!'}</span>
                    </div>
                )}
            </div>
            
            {/* Weekly Goal */}
            <div className="goal-section">
                <div className="goal-header">
                    <div className="goal-label">
                        <Calendar size={16} />
                        <span>Weekly Goal</span>
                    </div>
                    <div className="goal-adjuster">
                        <button 
                            className="adjust-btn"
                            onClick={() => adjustGoal('weekly', -1)}
                            disabled={goals.weekly <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="goal-value">{goals.weekly} interviews</span>
                        <button 
                            className="adjust-btn"
                            onClick={() => adjustGoal('weekly', 1)}
                            disabled={goals.weekly >= 14}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
                <div className="goal-progress">
                    <div className="progress-bar">
                        <motion.div 
                            className="progress-fill weekly"
                            initial={{ width: 0 }}
                            animate={{ width: `${weeklyPercent}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                    <div className="progress-stats">
                        <span className="progress-count">
                            {progress.weekly} / {goals.weekly}
                        </span>
                        <span className={`progress-percent ${weeklyPercent >= 100 ? 'complete' : ''}`}>
                            {weeklyPercent >= 100 ? (
                                <>
                                    <CheckCircle size={14} />
                                    Complete!
                                </>
                            ) : (
                                `${weeklyPercent}%`
                            )}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Monthly Goal */}
            <div className="goal-section">
                <div className="goal-header">
                    <div className="goal-label">
                        <TrendingUp size={16} />
                        <span>Monthly Goal</span>
                    </div>
                    <div className="goal-adjuster">
                        <button 
                            className="adjust-btn"
                            onClick={() => adjustGoal('monthly', -1)}
                            disabled={goals.monthly <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="goal-value">{goals.monthly} interviews</span>
                        <button 
                            className="adjust-btn"
                            onClick={() => adjustGoal('monthly', 1)}
                            disabled={goals.monthly >= 60}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
                <div className="goal-progress">
                    <div className="progress-bar">
                        <motion.div 
                            className="progress-fill monthly"
                            initial={{ width: 0 }}
                            animate={{ width: `${monthlyPercent}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                        />
                    </div>
                    <div className="progress-stats">
                        <span className="progress-count">
                            {progress.monthly} / {goals.monthly}
                        </span>
                        <span className={`progress-percent ${monthlyPercent >= 100 ? 'complete' : ''}`}>
                            {monthlyPercent >= 100 ? (
                                <>
                                    <CheckCircle size={14} />
                                    Complete!
                                </>
                            ) : (
                                `${monthlyPercent}%`
                            )}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Motivation Message */}
            <div className="motivation-message">
                {weeklyPercent >= 100 && monthlyPercent >= 100 ? (
                    <p>🎉 Amazing! You've crushed all your goals!</p>
                ) : weeklyPercent >= 50 ? (
                    <p>💪 Great progress! Keep pushing toward your goals!</p>
                ) : (
                    <p>🚀 Start practicing to build momentum!</p>
                )}
            </div>
        </div>
    );
};

export default PracticeGoals;
