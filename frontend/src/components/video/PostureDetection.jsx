import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, PersonStanding, ArrowUp, ArrowDown } from 'lucide-react';
import './PostureDetection.css';

const PostureDetection = ({ 
    faceDetected = false,
    facePosition = null, // { x, y, width, height } relative to video
    videoRef,
    isActive = true,
    onPostureChange 
}) => {
    const [postureStatus, setPostureStatus] = useState('unknown');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(100);
    const checkIntervalRef = useRef(null);
    
    useEffect(() => {
        if (!isActive || !faceDetected) {
            setPostureStatus('unknown');
            setFeedback('');
            return;
        }
        
        // Analyze posture based on face position
        checkIntervalRef.current = setInterval(() => {
            analyzePosture();
        }, 500);
        
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [isActive, faceDetected, facePosition]);
    
    const analyzePosture = () => {
        if (!facePosition) {
            // Simulate posture analysis with random variations
            const issues = [];
            let currentScore = 100;
            
            // Random simulation for demo - in real implementation, use face-api.js data
            const rand = Math.random();
            
            if (rand < 0.1) {
                issues.push('too-close');
                currentScore -= 30;
                setFeedback('Move back from the camera');
            } else if (rand < 0.15) {
                issues.push('too-far');
                currentScore -= 25;
                setFeedback('Move closer to the camera');
            } else if (rand < 0.2) {
                issues.push('off-center');
                currentScore -= 20;
                setFeedback('Center yourself in the frame');
            } else if (rand < 0.25) {
                issues.push('tilted');
                currentScore -= 15;
                setFeedback('Keep your head straight');
            } else {
                setFeedback('Great posture!');
            }
            
            setScore(Math.max(0, currentScore));
            setPostureStatus(currentScore >= 80 ? 'good' : currentScore >= 50 ? 'fair' : 'poor');
            onPostureChange?.({ score: currentScore, issues, status: postureStatus });
            return;
        }
        
        // Real analysis based on face position
        const { x, y, width, height } = facePosition;
        const issues = [];
        let currentScore = 100;
        
        // Check if too close (face takes up too much of frame)
        if (width > 0.6 || height > 0.6) {
            issues.push('too-close');
            currentScore -= 30;
            setFeedback('Move back from the camera');
        }
        // Check if too far
        else if (width < 0.15 || height < 0.15) {
            issues.push('too-far');
            currentScore -= 25;
            setFeedback('Move closer to the camera');
        }
        // Check if off-center
        else if (Math.abs(x - 0.5) > 0.2) {
            issues.push('off-center');
            currentScore -= 20;
            setFeedback('Center yourself in the frame');
        }
        // Check if too high or low
        else if (y < 0.2 || y > 0.6) {
            issues.push('vertical-position');
            currentScore -= 15;
            setFeedback(y < 0.2 ? 'Lower the camera' : 'Raise the camera');
        }
        else {
            setFeedback('Great posture!');
        }
        
        setScore(Math.max(0, currentScore));
        setPostureStatus(currentScore >= 80 ? 'good' : currentScore >= 50 ? 'fair' : 'poor');
        onPostureChange?.({ score: currentScore, issues, status: postureStatus });
    };
    
    if (!isActive) return null;
    
    return (
        <div className="posture-detection">
            <div className={`posture-indicator ${postureStatus}`}>
                <div className="posture-icon">
                    {postureStatus === 'good' ? (
                        <Check size={16} />
                    ) : postureStatus === 'poor' ? (
                        <AlertTriangle size={16} />
                    ) : (
                        <PersonStanding size={16} />
                    )}
                </div>
                <div className="posture-info">
                    <span className="posture-label">Posture</span>
                    <span className={`posture-score ${postureStatus}`}>{score}%</span>
                </div>
            </div>
            
            <AnimatePresence>
                {feedback && postureStatus !== 'good' && (
                    <motion.div
                        className="posture-feedback"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <span className="feedback-arrow">
                            {feedback.includes('closer') && <ArrowUp size={14} />}
                            {feedback.includes('back') && <ArrowDown size={14} />}
                        </span>
                        <span>{feedback}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PostureDetection;
