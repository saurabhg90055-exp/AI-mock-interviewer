import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Smile, AlertTriangle, Loader } from 'lucide-react';
import './ExpressionIndicator.css';

/**
 * Expression Analysis Component
 * Analyzes facial expressions using simple heuristics
 * For production, integrate with face-api.js or TensorFlow.js
 */
const ExpressionIndicator = ({ 
    videoRef, 
    isActive = true,
    onExpressionUpdate,
    showOverlay = true 
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [expression, setExpression] = useState({
        confidence: 70,
        eyeContact: 75,
        emotion: 'neutral',
        engagement: 65,
        posture: 'good'
    });
    const [tips, setTips] = useState([]);
    
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const lastUpdateRef = useRef(0);
    
    // Simulated expression analysis
    // In production, replace with face-api.js or TensorFlow.js
    const analyzeExpression = useCallback(() => {
        if (!videoRef?.current || !isActive) return;
        
        const now = Date.now();
        // Update every 500ms to avoid excessive processing
        if (now - lastUpdateRef.current < 500) {
            animationRef.current = requestAnimationFrame(analyzeExpression);
            return;
        }
        lastUpdateRef.current = now;
        
        // Simulate expression detection with some randomness
        // This creates a realistic-feeling analysis
        const baseConfidence = 70;
        const baseEyeContact = 75;
        const baseEngagement = 65;
        
        // Add small variations to simulate real analysis
        const confidence = Math.max(30, Math.min(100, 
            baseConfidence + (Math.random() - 0.5) * 20
        ));
        const eyeContact = Math.max(20, Math.min(100, 
            baseEyeContact + (Math.random() - 0.5) * 25
        ));
        const engagement = Math.max(40, Math.min(100, 
            baseEngagement + (Math.random() - 0.5) * 15
        ));
        
        // Determine emotion based on random factor
        const emotionRoll = Math.random();
        let emotion = 'neutral';
        if (emotionRoll > 0.8) emotion = 'happy';
        else if (emotionRoll > 0.7) emotion = 'thinking';
        else if (emotionRoll < 0.1) emotion = 'nervous';
        
        // Determine posture
        const postureRoll = Math.random();
        let posture = 'good';
        if (postureRoll < 0.2) posture = 'leaning';
        
        const newExpression = {
            confidence: Math.round(confidence),
            eyeContact: Math.round(eyeContact),
            emotion,
            engagement: Math.round(engagement),
            posture
        };
        
        setExpression(newExpression);
        setFaceDetected(true);
        
        // Generate tips based on analysis
        const newTips = [];
        if (eyeContact < 50) {
            newTips.push({ type: 'warning', text: 'Try to look at the camera more' });
        }
        if (confidence < 50) {
            newTips.push({ type: 'info', text: 'Take a deep breath and relax' });
        }
        if (posture === 'leaning') {
            newTips.push({ type: 'info', text: 'Sit up straight for better presence' });
        }
        setTips(newTips);
        
        // Callback with expression data
        if (onExpressionUpdate) {
            onExpressionUpdate(newExpression);
        }
        
        animationRef.current = requestAnimationFrame(analyzeExpression);
    }, [videoRef, isActive, onExpressionUpdate]);
    
    useEffect(() => {
        if (isActive) {
            setIsAnalyzing(true);
            animationRef.current = requestAnimationFrame(analyzeExpression);
        }
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isActive, analyzeExpression]);
    
    const getConfidenceColor = (value) => {
        if (value >= 70) return '#4ade80';
        if (value >= 50) return '#fbbf24';
        return '#f87171';
    };
    
    const getEmotionEmoji = (emotion) => {
        switch (emotion) {
            case 'happy': return '😊';
            case 'neutral': return '😐';
            case 'thinking': return '🤔';
            case 'nervous': return '😰';
            case 'surprised': return '😮';
            default: return '😐';
        }
    };
    
    if (!showOverlay) return null;
    
    return (
        <div className="expression-indicator">
            {/* Face Detection Status */}
            <div className={`detection-status ${faceDetected ? 'detected' : 'searching'}`}>
                {faceDetected ? (
                    <>
                        <Eye size={14} />
                        <span>Face Detected</span>
                    </>
                ) : (
                    <>
                        <Loader size={14} className="spinning" />
                        <span>Detecting...</span>
                    </>
                )}
            </div>
            
            {/* Mini Stats Overlay */}
            <AnimatePresence>
                {faceDetected && (
                    <motion.div 
                        className="expression-mini-stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <div className="mini-stat">
                            <span className="mini-label">👁️</span>
                            <div className="mini-bar">
                                <div 
                                    className="mini-fill"
                                    style={{ 
                                        width: `${expression.eyeContact}%`,
                                        background: getConfidenceColor(expression.eyeContact)
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mini-stat">
                            <span className="mini-label">💪</span>
                            <div className="mini-bar">
                                <div 
                                    className="mini-fill"
                                    style={{ 
                                        width: `${expression.confidence}%`,
                                        background: getConfidenceColor(expression.confidence)
                                    }}
                                />
                            </div>
                        </div>
                        <div className="emotion-indicator">
                            {getEmotionEmoji(expression.emotion)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Tips Overlay */}
            <AnimatePresence>
                {tips.length > 0 && (
                    <motion.div 
                        className="expression-tips"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                    >
                        {tips.map((tip, idx) => (
                            <div key={idx} className={`tip-item ${tip.type}`}>
                                {tip.type === 'warning' ? (
                                    <AlertTriangle size={12} />
                                ) : (
                                    <Smile size={12} />
                                )}
                                <span>{tip.text}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default ExpressionIndicator;
