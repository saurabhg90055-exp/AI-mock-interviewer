import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Scale } from 'lucide-react';
import './SpeakingBalance.css';

const SpeakingBalance = ({ 
    userTime = 0, // seconds
    interviewerTime = 0, // seconds
    targetRatio = 0.7, // ideal: 70% user
    showRecommendation = true,
    compact = false 
}) => {
    const totalTime = userTime + interviewerTime;
    const userPercent = totalTime > 0 ? Math.round((userTime / totalTime) * 100) : 50;
    const interviewerPercent = 100 - userPercent;
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs}s`;
    };
    
    const getBalanceStatus = () => {
        const idealMin = targetRatio * 100 - 10;
        const idealMax = targetRatio * 100 + 10;
        
        if (userPercent >= idealMin && userPercent <= idealMax) {
            return { status: 'good', message: 'Good speaking balance!' };
        } else if (userPercent < idealMin) {
            return { status: 'low', message: 'Try to elaborate more on your answers' };
        } else {
            return { status: 'high', message: 'Consider being more concise' };
        }
    };
    
    const balance = getBalanceStatus();
    
    if (compact) {
        return (
            <div className="speaking-balance compact">
                <div className="balance-bar-compact">
                    <motion.div 
                        className="user-fill"
                        animate={{ width: `${userPercent}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <span className="balance-ratio">{userPercent}%</span>
            </div>
        );
    }
    
    return (
        <div className={`speaking-balance ${balance.status}`}>
            <div className="balance-header">
                <Scale size={16} />
                <span>Speaking Balance</span>
            </div>
            
            <div className="balance-visual">
                <div className="speaker user">
                    <User size={16} />
                    <span className="speaker-label">You</span>
                    <span className="speaker-time">{formatTime(userTime)}</span>
                </div>
                
                <div className="balance-bar">
                    <motion.div 
                        className="user-fill"
                        animate={{ width: `${userPercent}%` }}
                        transition={{ duration: 0.3 }}
                    />
                    <motion.div 
                        className="interviewer-fill"
                        animate={{ width: `${interviewerPercent}%` }}
                        transition={{ duration: 0.3 }}
                    />
                    <div 
                        className="target-line"
                        style={{ left: `${targetRatio * 100}%` }}
                        title={`Target: ${targetRatio * 100}%`}
                    />
                </div>
                
                <div className="speaker interviewer">
                    <Bot size={16} />
                    <span className="speaker-label">AI</span>
                    <span className="speaker-time">{formatTime(interviewerTime)}</span>
                </div>
            </div>
            
            <div className="balance-stats">
                <span className={`stat user ${userPercent > 50 ? 'leading' : ''}`}>
                    {userPercent}%
                </span>
                <span className="stat-divider">:</span>
                <span className={`stat interviewer ${interviewerPercent > 50 ? 'leading' : ''}`}>
                    {interviewerPercent}%
                </span>
            </div>
            
            {showRecommendation && totalTime > 10 && (
                <div className={`balance-recommendation ${balance.status}`}>
                    {balance.message}
                </div>
            )}
        </div>
    );
};

export default SpeakingBalance;
