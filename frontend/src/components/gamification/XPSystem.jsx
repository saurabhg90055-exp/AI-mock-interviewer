import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Trophy, Award, Flame, Target, TrendingUp } from 'lucide-react';
import './XPSystem.css';

// XP calculations
export const calculateXP = (score, difficulty, questionCount, streakBonus = 0) => {
    const baseXP = score * 10;
    const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2
    }[difficulty] || 1;
    
    const questionBonus = questionCount * 5;
    const streakXP = streakBonus * 10;
    
    return Math.round(baseXP * difficultyMultiplier + questionBonus + streakXP);
};

// Level calculation
export const calculateLevel = (totalXP) => {
    // Each level requires increasingly more XP
    // Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP, etc.
    let level = 1;
    let xpRequired = 100;
    let remainingXP = totalXP;
    
    while (remainingXP >= xpRequired) {
        remainingXP -= xpRequired;
        level++;
        xpRequired = level * 100;
    }
    
    return {
        level,
        currentXP: remainingXP,
        xpToNextLevel: xpRequired,
        progress: (remainingXP / xpRequired) * 100
    };
};

// Level Progress Bar Component
export const LevelProgressBar = ({ totalXP, showDetails = true }) => {
    const levelInfo = calculateLevel(totalXP);
    
    return (
        <div className="level-progress-container">
            <div className="level-header">
                <div className="level-badge">
                    <Star className="level-icon" />
                    <span className="level-number">Level {levelInfo.level}</span>
                </div>
                {showDetails && (
                    <span className="xp-text">
                        {levelInfo.currentXP} / {levelInfo.xpToNextLevel} XP
                    </span>
                )}
            </div>
            <div className="level-progress-track">
                <motion.div
                    className="level-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
};

// XP Gain Animation Component
export const XPGainPopup = ({ xpGained, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="xp-gain-popup"
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0, y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Zap className="xp-icon" />
            <span className="xp-amount">+{xpGained} XP</span>
        </motion.div>
    );
};

// Achievement Badge Component
export const AchievementBadge = ({ achievement, unlocked = false, showTooltip = true }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className={`achievement-badge ${unlocked ? 'unlocked' : 'locked'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.1 }}
        >
            <div className="badge-icon">
                {achievement.icon || <Award />}
            </div>
            {showTooltip && isHovered && (
                <motion.div
                    className="badge-tooltip"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                    {achievement.xpReward && (
                        <span className="badge-xp">+{achievement.xpReward} XP</span>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

// Streak Counter Component
export const StreakCounter = ({ streak, isActive = true }) => {
    return (
        <motion.div
            className={`streak-counter ${isActive ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
        >
            <Flame className={`streak-icon ${streak > 0 ? 'burning' : ''}`} />
            <div className="streak-info">
                <span className="streak-number">{streak}</span>
                <span className="streak-label">Day Streak</span>
            </div>
            {streak >= 7 && (
                <div className="streak-bonus">
                    <Zap size={12} />
                    <span>+{streak * 10}% XP Bonus</span>
                </div>
            )}
        </motion.div>
    );
};

// Achievement Unlock Animation
export const AchievementUnlock = ({ achievement, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            className="achievement-unlock-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="achievement-unlock-card"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 200 }}
            >
                <div className="unlock-header">
                    <Trophy className="trophy-icon" />
                    <span>Achievement Unlocked!</span>
                </div>
                <div className="unlock-badge">
                    {achievement.icon || <Award />}
                </div>
                <h3 className="unlock-title">{achievement.name}</h3>
                <p className="unlock-description">{achievement.description}</p>
                {achievement.xpReward && (
                    <div className="unlock-reward">
                        <Zap />
                        <span>+{achievement.xpReward} XP</span>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

// Stats Dashboard Widget
export const StatsWidget = ({ stats }) => {
    return (
        <div className="stats-widget">
            <div className="stat-row">
                <Target className="stat-icon" />
                <div className="stat-content">
                    <span className="stat-value">{stats.totalInterviews || 0}</span>
                    <span className="stat-label">Total Interviews</span>
                </div>
            </div>
            <div className="stat-row">
                <TrendingUp className="stat-icon" />
                <div className="stat-content">
                    <span className="stat-value">{stats.averageScore?.toFixed(1) || 0}%</span>
                    <span className="stat-label">Average Score</span>
                </div>
            </div>
            <div className="stat-row">
                <Star className="stat-icon gold" />
                <div className="stat-content">
                    <span className="stat-value">{stats.perfectScores || 0}</span>
                    <span className="stat-label">Perfect Scores</span>
                </div>
            </div>
        </div>
    );
};

// Achievements List
export const ACHIEVEMENTS = [
    {
        id: 'first_interview',
        name: 'First Steps',
        description: 'Complete your first interview',
        icon: <Target />,
        xpReward: 50,
        condition: (stats) => stats.totalInterviews >= 1
    },
    {
        id: 'five_interviews',
        name: 'Getting Started',
        description: 'Complete 5 interviews',
        icon: <Zap />,
        xpReward: 100,
        condition: (stats) => stats.totalInterviews >= 5
    },
    {
        id: 'perfect_score',
        name: 'Perfection',
        description: 'Get a perfect score on any interview',
        icon: <Star />,
        xpReward: 200,
        condition: (stats) => stats.perfectScores >= 1
    },
    {
        id: 'week_streak',
        name: 'Dedicated Learner',
        description: 'Maintain a 7-day streak',
        icon: <Flame />,
        xpReward: 150,
        condition: (stats) => stats.streak >= 7
    },
    {
        id: 'hard_mode',
        name: 'Challenge Accepted',
        description: 'Complete a hard difficulty interview',
        icon: <Trophy />,
        xpReward: 100,
        condition: (stats) => stats.hardCompleted >= 1
    },
    {
        id: 'all_topics',
        name: 'Well Rounded',
        description: 'Practice all interview topics',
        icon: <Award />,
        xpReward: 300,
        condition: (stats) => stats.topicsCompleted >= 6
    },
    {
        id: 'level_10',
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: <Star />,
        xpReward: 500,
        condition: (stats) => calculateLevel(stats.totalXP).level >= 10
    },
    {
        id: 'interview_master',
        name: 'Interview Master',
        description: 'Complete 50 interviews',
        icon: <Trophy />,
        xpReward: 1000,
        condition: (stats) => stats.totalInterviews >= 50
    }
];

// Main XP System Hook
export const useXPSystem = () => {
    const [totalXP, setTotalXP] = useState(() => {
        const saved = localStorage.getItem('userXP');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('userStats');
        return saved ? JSON.parse(saved) : {
            totalInterviews: 0,
            averageScore: 0,
            perfectScores: 0,
            streak: 0,
            hardCompleted: 0,
            topicsCompleted: 0,
            lastInterviewDate: null
        };
    });

    const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
        const saved = localStorage.getItem('unlockedAchievements');
        return saved ? JSON.parse(saved) : [];
    });

    const [pendingXP, setPendingXP] = useState(null);
    const [newAchievement, setNewAchievement] = useState(null);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('userXP', totalXP.toString());
    }, [totalXP]);

    useEffect(() => {
        localStorage.setItem('userStats', JSON.stringify(stats));
    }, [stats]);

    useEffect(() => {
        localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    }, [unlockedAchievements]);

    const addXP = (xp) => {
        setTotalXP(prev => prev + xp);
        setPendingXP(xp);
    };

    const updateStats = (newStats) => {
        setStats(prev => ({ ...prev, ...newStats }));
    };

    const checkAchievements = () => {
        const newlyUnlocked = ACHIEVEMENTS.filter(
            achievement => 
                !unlockedAchievements.includes(achievement.id) &&
                achievement.condition(stats)
        );

        if (newlyUnlocked.length > 0) {
            const achievement = newlyUnlocked[0];
            setUnlockedAchievements(prev => [...prev, achievement.id]);
            setNewAchievement(achievement);
            addXP(achievement.xpReward);
        }
    };

    const recordInterview = (score, difficulty, questionCount) => {
        const streakBonus = stats.streak;
        const xpGained = calculateXP(score, difficulty, questionCount, streakBonus);
        
        // Update streak
        const today = new Date().toDateString();
        const lastDate = stats.lastInterviewDate ? new Date(stats.lastInterviewDate).toDateString() : null;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        let newStreak = stats.streak;
        if (lastDate === yesterday) {
            newStreak = stats.streak + 1;
        } else if (lastDate !== today) {
            newStreak = 1;
        }

        // Update stats
        const newTotalInterviews = stats.totalInterviews + 1;
        const newAverageScore = ((stats.averageScore * stats.totalInterviews) + score) / newTotalInterviews;
        
        updateStats({
            totalInterviews: newTotalInterviews,
            averageScore: newAverageScore,
            perfectScores: score >= 95 ? stats.perfectScores + 1 : stats.perfectScores,
            hardCompleted: difficulty === 'hard' ? stats.hardCompleted + 1 : stats.hardCompleted,
            streak: newStreak,
            lastInterviewDate: new Date().toISOString()
        });

        addXP(xpGained);
        
        // Check achievements after state update
        setTimeout(checkAchievements, 500);

        return xpGained;
    };

    return {
        totalXP,
        stats,
        levelInfo: calculateLevel(totalXP),
        unlockedAchievements,
        pendingXP,
        newAchievement,
        addXP,
        updateStats,
        recordInterview,
        clearPendingXP: () => setPendingXP(null),
        clearNewAchievement: () => setNewAchievement(null),
        checkAchievements
    };
};

export default useXPSystem;
