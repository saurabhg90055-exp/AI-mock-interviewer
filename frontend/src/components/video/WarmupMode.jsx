import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Timer, Play, Pause, RotateCcw, Mic, 
    CheckCircle, AlertCircle, Volume2 
} from 'lucide-react';
import './WarmupMode.css';

const WARMUP_PROMPTS = [
    "Take a deep breath and relax your shoulders.",
    "Smile and make eye contact with the camera.",
    "Say 'Hello, thank you for having me today.'",
    "Practice sitting up straight with good posture.",
    "Clear your throat and speak clearly.",
    "Take another deep breath. You've got this!"
];

const WarmupMode = ({ 
    duration = 30,
    onComplete,
    onSkip,
    isAudioReady = true 
}) => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(duration);
    const [currentPrompt, setCurrentPrompt] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    React.useEffect(() => {
        let timer;
        if (isActive && !isPaused && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsComplete(true);
                        setIsActive(false);
                        onComplete?.();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            // Change prompt every 5 seconds
            const promptInterval = setInterval(() => {
                setCurrentPrompt(prev => (prev + 1) % WARMUP_PROMPTS.length);
            }, 5000);
            
            return () => {
                clearInterval(timer);
                clearInterval(promptInterval);
            };
        }
        return () => clearInterval(timer);
    }, [isActive, isPaused, timeLeft, onComplete]);
    
    const handleStart = () => {
        setIsActive(true);
        setIsPaused(false);
        setTimeLeft(duration);
        setCurrentPrompt(0);
        setIsComplete(false);
    };
    
    const handlePause = () => {
        setIsPaused(!isPaused);
    };
    
    const handleReset = () => {
        setIsActive(false);
        setTimeLeft(duration);
        setCurrentPrompt(0);
        setIsComplete(false);
    };
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    const progress = ((duration - timeLeft) / duration) * 100;
    
    if (isComplete) {
        return (
            <motion.div 
                className="warmup-mode complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="complete-icon">
                    <CheckCircle size={48} />
                </div>
                <h3>You're Ready!</h3>
                <p>Great warm-up! You should feel more relaxed and confident.</p>
                <button className="start-interview-btn" onClick={onComplete}>
                    Start Interview
                </button>
            </motion.div>
        );
    }
    
    return (
        <div className="warmup-mode">
            <div className="warmup-header">
                <Timer size={20} />
                <h3>Warm-Up Session</h3>
                <button className="skip-btn" onClick={onSkip}>
                    Skip
                </button>
            </div>
            
            {!isActive ? (
                <motion.div 
                    className="warmup-intro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p>Take 30 seconds to prepare yourself before the interview begins.</p>
                    
                    <div className="checklist">
                        <div className={`check-item ${isAudioReady ? 'ready' : ''}`}>
                            {isAudioReady ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <span>Microphone ready</span>
                        </div>
                        <div className="check-item ready">
                            <CheckCircle size={16} />
                            <span>Camera positioned</span>
                        </div>
                        <div className="check-item ready">
                            <CheckCircle size={16} />
                            <span>Good lighting</span>
                        </div>
                    </div>
                    
                    <motion.button
                        className="start-warmup-btn"
                        onClick={handleStart}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Play size={20} />
                        Start Warm-Up
                    </motion.button>
                </motion.div>
            ) : (
                <motion.div 
                    className="warmup-active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* Timer Circle */}
                    <div className="timer-circle">
                        <svg viewBox="0 0 100 100">
                            <circle
                                className="timer-bg"
                                cx="50"
                                cy="50"
                                r="45"
                            />
                            <circle
                                className="timer-progress"
                                cx="50"
                                cy="50"
                                r="45"
                                strokeDasharray={`${progress * 2.83} 283`}
                            />
                        </svg>
                        <span className="timer-text">{formatTime(timeLeft)}</span>
                    </div>
                    
                    {/* Current Prompt */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPrompt}
                            className="warmup-prompt"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Volume2 size={16} />
                            <p>{WARMUP_PROMPTS[currentPrompt]}</p>
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Controls */}
                    <div className="warmup-controls">
                        <button className="control-btn" onClick={handleReset}>
                            <RotateCcw size={18} />
                        </button>
                        <button 
                            className={`control-btn main ${isPaused ? 'paused' : ''}`}
                            onClick={handlePause}
                        >
                            {isPaused ? <Play size={20} /> : <Pause size={20} />}
                        </button>
                        <button className="control-btn" onClick={onSkip}>
                            Skip
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default WarmupMode;
