import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, Smile, TrendingUp, User, Activity, 
    ChevronDown, ChevronUp, Target, Zap, Heart,
    AlertCircle, CheckCircle, Info
} from 'lucide-react';
import './ExpressionPanel.css';

/**
 * Enhanced Expression Analysis Panel
 * Shows real-time confidence, eye contact, and emotion metrics
 */
const ExpressionPanel = ({ 
    expressionData = {},
    faceDetected = false,
    isModelLoaded = false,
    isExpanded = true,
    onToggle
}) => {
    const {
        confidence = 0,
        eyeContact = 0,
        emotion = 'neutral',
        engagement = 0,
        emotions = {}
    } = expressionData;

    const [isMinimized, setIsMinimized] = useState(!isExpanded);

    // Get color based on value
    const getColor = (value) => {
        if (value >= 70) return '#22c55e'; // green
        if (value >= 50) return '#eab308'; // yellow
        return '#ef4444'; // red
    };

    // Get emotion icon
    const getEmotionIcon = (emotion) => {
        const icons = {
            happy: '😊',
            neutral: '😐',
            thinking: '🤔',
            nervous: '😰',
            surprised: '😮',
            sad: '😢',
            angry: '😠',
        };
        return icons[emotion] || '😐';
    };

    // Get feedback message
    const getFeedback = useMemo(() => {
        const messages = [];
        
        if (confidence >= 70) {
            messages.push({ type: 'success', text: 'Great confidence!', icon: <CheckCircle size={14} /> });
        } else if (confidence < 50) {
            messages.push({ type: 'warning', text: 'Try to appear more confident', icon: <AlertCircle size={14} /> });
        }
        
        if (eyeContact >= 70) {
            messages.push({ type: 'success', text: 'Excellent eye contact', icon: <Eye size={14} /> });
        } else if (eyeContact < 50) {
            messages.push({ type: 'warning', text: 'Look at the camera more', icon: <Target size={14} /> });
        }
        
        if (engagement >= 70) {
            messages.push({ type: 'success', text: 'Highly engaged!', icon: <Zap size={14} /> });
        }
        
        return messages.slice(0, 2);
    }, [confidence, eyeContact, engagement]);

    // Calculate overall score
    const overallScore = useMemo(() => {
        return Math.round((confidence * 0.4 + eyeContact * 0.35 + engagement * 0.25));
    }, [confidence, eyeContact, engagement]);

    return (
        <motion.div 
            className={`expression-panel ${isMinimized ? 'minimized' : ''}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="expression-panel-header" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="panel-title">
                    <Activity size={16} />
                    <span>Expression Analysis</span>
                </div>
                <div className="panel-toggle">
                    {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
            </div>

            <AnimatePresence>
                {!isMinimized && (
                    <motion.div 
                        className="expression-panel-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Face Detection Status */}
                        <div className={`detection-status ${faceDetected ? 'detected' : 'not-detected'}`}>
                            <User size={14} />
                            <span>{faceDetected ? 'Face Detected' : 'No Face Detected'}</span>
                            <div className={`status-dot ${faceDetected ? 'active' : ''}`} />
                        </div>

                        {/* Overall Score */}
                        <div className="overall-score">
                            <div className="score-circle" style={{ '--score-color': getColor(overallScore) }}>
                                <svg viewBox="0 0 100 100">
                                    <circle 
                                        className="score-bg" 
                                        cx="50" cy="50" r="45" 
                                    />
                                    <motion.circle 
                                        className="score-progress"
                                        cx="50" cy="50" r="45"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: overallScore / 100 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ stroke: getColor(overallScore) }}
                                    />
                                </svg>
                                <div className="score-value">
                                    <span className="score-number">{overallScore}</span>
                                    <span className="score-label">Overall</span>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="metrics-grid">
                            {/* Confidence */}
                            <div className="metric-item">
                                <div className="metric-header">
                                    <Heart size={14} />
                                    <span>Confidence</span>
                                    <span className="metric-value">{confidence}%</span>
                                </div>
                                <div className="metric-bar">
                                    <motion.div 
                                        className="metric-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${confidence}%` }}
                                        style={{ backgroundColor: getColor(confidence) }}
                                    />
                                </div>
                            </div>

                            {/* Eye Contact */}
                            <div className="metric-item">
                                <div className="metric-header">
                                    <Eye size={14} />
                                    <span>Eye Contact</span>
                                    <span className="metric-value">{eyeContact}%</span>
                                </div>
                                <div className="metric-bar">
                                    <motion.div 
                                        className="metric-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${eyeContact}%` }}
                                        style={{ backgroundColor: getColor(eyeContact) }}
                                    />
                                </div>
                            </div>

                            {/* Engagement */}
                            <div className="metric-item">
                                <div className="metric-header">
                                    <Zap size={14} />
                                    <span>Engagement</span>
                                    <span className="metric-value">{engagement}%</span>
                                </div>
                                <div className="metric-bar">
                                    <motion.div 
                                        className="metric-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${engagement}%` }}
                                        style={{ backgroundColor: getColor(engagement) }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Current Emotion */}
                        <div className="emotion-display">
                            <span className="emotion-icon">{getEmotionIcon(emotion)}</span>
                            <span className="emotion-label">{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>
                        </div>

                        {/* Feedback Messages */}
                        {getFeedback.length > 0 && (
                            <div className="feedback-messages">
                                {getFeedback.map((msg, idx) => (
                                    <div key={idx} className={`feedback-item ${msg.type}`}>
                                        {msg.icon}
                                        <span>{msg.text}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ExpressionPanel;
