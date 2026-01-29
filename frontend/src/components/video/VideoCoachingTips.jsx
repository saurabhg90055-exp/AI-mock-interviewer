import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Eye, Mic, Zap, Heart, AlertTriangle, 
    CheckCircle, Lightbulb, TrendingUp, Target
} from 'lucide-react';
import './VideoCoachingTips.css';

/**
 * Real-time coaching tips component for video interviews
 * Analyzes user expression data and provides contextual feedback
 */
const VideoCoachingTips = ({
    expressionData,
    isRecording,
    isActive = true,
    compact = false
}) => {
    const [currentTip, setCurrentTip] = useState(null);
    const [tipHistory, setTipHistory] = useState([]);
    const [lastTipTime, setLastTipTime] = useState(0);
    
    // Coaching tip definitions based on expression metrics
    const coachingTips = {
        lowEyeContact: {
            icon: Eye,
            message: "Try to look at the camera to maintain eye contact",
            type: "warning",
            threshold: { metric: 'eyeContact', condition: 'below', value: 35 }
        },
        goodEyeContact: {
            icon: CheckCircle,
            message: "Great eye contact! Keep it up!",
            type: "success",
            threshold: { metric: 'eyeContact', condition: 'above', value: 80 }
        },
        lowConfidence: {
            icon: Heart,
            message: "Take a breath - you're doing well!",
            type: "encouragement",
            threshold: { metric: 'confidence', condition: 'below', value: 40 }
        },
        highConfidence: {
            icon: Zap,
            message: "Excellent energy and confidence!",
            type: "success",
            threshold: { metric: 'confidence', condition: 'above', value: 85 }
        },
        lowEngagement: {
            icon: Target,
            message: "Try to show more enthusiasm",
            type: "warning",
            threshold: { metric: 'engagement', condition: 'below', value: 40 }
        },
        highEngagement: {
            icon: TrendingUp,
            message: "Your engagement is impressive!",
            type: "success",
            threshold: { metric: 'engagement', condition: 'above', value: 85 }
        },
        nervousEmotion: {
            icon: Lightbulb,
            message: "Slow down and breathe - nerves are normal",
            type: "encouragement",
            threshold: { metric: 'emotion', condition: 'equals', value: 'nervous' }
        },
        thinkingEmotion: {
            icon: Lightbulb,
            message: "Good! Taking time to think shows thoroughness",
            type: "info",
            threshold: { metric: 'emotion', condition: 'equals', value: 'thinking' }
        }
    };
    
    // Determine which tip to show based on expression data
    useEffect(() => {
        if (!isActive || !expressionData) return;
        
        const now = Date.now();
        // Only show new tips every 5 seconds minimum
        if (now - lastTipTime < 5000) return;
        
        // Prioritize tips (warnings first, then encouragement, then success)
        const applicableTips = [];
        
        Object.entries(coachingTips).forEach(([key, tip]) => {
            const { metric, condition, value } = tip.threshold;
            let isApplicable = false;
            
            if (condition === 'below' && expressionData[metric] < value) {
                isApplicable = true;
            } else if (condition === 'above' && expressionData[metric] > value) {
                isApplicable = true;
            } else if (condition === 'equals' && expressionData[metric] === value) {
                isApplicable = true;
            }
            
            if (isApplicable) {
                applicableTips.push({ key, ...tip });
            }
        });
        
        // Sort by priority: warning > encouragement > success > info
        const priorityOrder = { warning: 0, encouragement: 1, success: 2, info: 3 };
        applicableTips.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);
        
        // Pick the highest priority tip that wasn't shown recently
        const newTip = applicableTips.find(tip => 
            !tipHistory.slice(-3).includes(tip.key)
        );
        
        if (newTip) {
            setCurrentTip(newTip);
            setLastTipTime(now);
            setTipHistory(prev => [...prev.slice(-10), newTip.key]);
            
            // Auto-hide after 4 seconds
            setTimeout(() => {
                setCurrentTip(null);
            }, 4000);
        }
    }, [expressionData, isActive, lastTipTime, tipHistory]);
    
    // Clear tip when recording starts
    useEffect(() => {
        if (isRecording) {
            setCurrentTip(null);
        }
    }, [isRecording]);
    
    const getTipStyles = (type) => {
        switch (type) {
            case 'warning':
                return 'tip-warning';
            case 'success':
                return 'tip-success';
            case 'encouragement':
                return 'tip-encouragement';
            case 'info':
            default:
                return 'tip-info';
        }
    };
    
    if (!isActive) return null;
    
    return (
        <AnimatePresence>
            {currentTip && (
                <motion.div
                    className={`video-coaching-tip ${getTipStyles(currentTip.type)} ${compact ? 'compact' : ''}`}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <currentTip.icon className="tip-icon" size={compact ? 16 : 20} />
                    <span className="tip-message">{currentTip.message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoCoachingTips;
