import React from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, Target, Clock, Award, CheckCircle, XCircle, 
    ChevronRight, RotateCcw, Download, Share2, Sparkles 
} from 'lucide-react';
import './InterviewSummary.css';

const InterviewSummary = ({
    score,
    totalQuestions,
    correctAnswers,
    duration,
    difficulty,
    topic,
    feedback,
    xpGained,
    onRestart,
    onViewDetails,
    questionsHistory
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const getScoreGrade = (score) => {
        if (score >= 90) return { grade: 'A+', color: '#10b981', message: 'Outstanding!' };
        if (score >= 80) return { grade: 'A', color: '#22c55e', message: 'Excellent!' };
        if (score >= 70) return { grade: 'B', color: '#84cc16', message: 'Great Job!' };
        if (score >= 60) return { grade: 'C', color: '#eab308', message: 'Good Effort!' };
        if (score >= 50) return { grade: 'D', color: '#f97316', message: 'Keep Practicing!' };
        return { grade: 'F', color: '#ef4444', message: 'Room for Improvement' };
    };

    const scoreInfo = getScoreGrade(score);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <motion.div
            className="interview-summary"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div className="summary-header" variants={itemVariants}>
                <Sparkles className="header-icon" />
                <h1>Interview Complete!</h1>
                <p>{scoreInfo.message}</p>
            </motion.div>

            {/* Score Circle */}
            <motion.div 
                className="score-circle-container"
                variants={itemVariants}
            >
                <div className="score-circle" style={{ '--score-color': scoreInfo.color }}>
                    <svg viewBox="0 0 100 100">
                        <circle
                            className="score-bg"
                            cx="50"
                            cy="50"
                            r="45"
                            strokeWidth="8"
                            fill="none"
                        />
                        <motion.circle
                            className="score-progress"
                            cx="50"
                            cy="50"
                            r="45"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - score / 100)}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - score / 100) }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            style={{ stroke: scoreInfo.color }}
                        />
                    </svg>
                    <div className="score-content">
                        <span className="score-value">{score}</span>
                        <span className="score-label">Score</span>
                    </div>
                </div>
                <div className="score-grade" style={{ backgroundColor: `${scoreInfo.color}20`, color: scoreInfo.color }}>
                    Grade: {scoreInfo.grade}
                </div>
            </motion.div>

            {/* XP Earned */}
            {xpGained && (
                <motion.div className="xp-earned-card" variants={itemVariants}>
                    <Award className="xp-icon" />
                    <span className="xp-amount">+{xpGained} XP Earned!</span>
                </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div className="stats-grid" variants={itemVariants}>
                <div className="stat-card">
                    <CheckCircle className="stat-icon success" />
                    <div className="stat-details">
                        <span className="stat-value">{correctAnswers}/{totalQuestions}</span>
                        <span className="stat-label">Correct Answers</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Clock className="stat-icon time" />
                    <div className="stat-details">
                        <span className="stat-value">{formatDuration(duration)}</span>
                        <span className="stat-label">Total Time</span>
                    </div>
                </div>
                <div className="stat-card">
                    <Target className="stat-icon difficulty" />
                    <div className="stat-details">
                        <span className="stat-value">{difficulty}</span>
                        <span className="stat-label">Difficulty</span>
                    </div>
                </div>
                <div className="stat-card">
                    <TrendingUp className="stat-icon topic" />
                    <div className="stat-details">
                        <span className="stat-value">{topic}</span>
                        <span className="stat-label">Topic</span>
                    </div>
                </div>
            </motion.div>

            {/* Feedback Section */}
            {feedback && (
                <motion.div className="feedback-section" variants={itemVariants}>
                    <h3>AI Feedback</h3>
                    <div className="feedback-content">
                        {feedback.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Questions History */}
            {questionsHistory && questionsHistory.length > 0 && (
                <motion.div className="questions-history" variants={itemVariants}>
                    <h3>Question Summary</h3>
                    <div className="history-list">
                        {questionsHistory.slice(0, 5).map((q, index) => (
                            <div key={index} className={`history-item ${q.correct ? 'correct' : 'incorrect'}`}>
                                <span className="history-number">Q{index + 1}</span>
                                <span className="history-question">{q.question?.substring(0, 60)}...</span>
                                {q.correct ? (
                                    <CheckCircle className="history-icon correct" />
                                ) : (
                                    <XCircle className="history-icon incorrect" />
                                )}
                            </div>
                        ))}
                    </div>
                    {questionsHistory.length > 5 && (
                        <button className="view-all-btn" onClick={onViewDetails}>
                            View All Questions <ChevronRight size={16} />
                        </button>
                    )}
                </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div className="summary-actions" variants={itemVariants}>
                <motion.button
                    className="action-btn primary"
                    onClick={onRestart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <RotateCcw size={20} />
                    <span>New Interview</span>
                </motion.button>
                <motion.button
                    className="action-btn secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Download size={20} />
                    <span>Export Report</span>
                </motion.button>
                <motion.button
                    className="action-btn secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Share2 size={20} />
                    <span>Share</span>
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default InterviewSummary;
