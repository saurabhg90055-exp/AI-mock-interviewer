import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for expression analysis during video interviews
 * Tracks confidence, eye contact, emotions, and engagement over time
 */
const useExpressionAnalysis = (videoRef, isActive = false) => {
    // Current expression state
    const [currentExpression, setCurrentExpression] = useState({
        confidence: 0,
        eyeContact: 0,
        emotion: 'neutral',
        engagement: 0,
        posture: 'unknown'
    });
    
    // Historical expression data
    const [expressionHistory, setExpressionHistory] = useState([]);
    
    // Aggregate statistics
    const [aggregateStats, setAggregateStats] = useState({
        averageConfidence: 0,
        averageEyeContact: 0,
        averageEngagement: 0,
        dominantEmotion: 'neutral',
        emotionDistribution: {},
        confidenceTrend: 'stable',
        totalSamples: 0
    });
    
    // Analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    
    // Refs for cleanup
    const animationFrameRef = useRef(null);
    const lastAnalysisTime = useRef(0);
    const analysisInterval = 500; // ms between analyses
    
    // Calculate aggregate statistics from history
    const calculateAggregateStats = useCallback((history) => {
        if (history.length === 0) {
            return aggregateStats;
        }
        
        const totalSamples = history.length;
        
        // Calculate averages
        const avgConfidence = history.reduce((sum, h) => sum + h.confidence, 0) / totalSamples;
        const avgEyeContact = history.reduce((sum, h) => sum + h.eyeContact, 0) / totalSamples;
        const avgEngagement = history.reduce((sum, h) => sum + h.engagement, 0) / totalSamples;
        
        // Calculate emotion distribution
        const emotionCounts = history.reduce((acc, h) => {
            acc[h.emotion] = (acc[h.emotion] || 0) + 1;
            return acc;
        }, {});
        
        const emotionDistribution = {};
        for (const [emotion, count] of Object.entries(emotionCounts)) {
            emotionDistribution[emotion] = Math.round((count / totalSamples) * 100);
        }
        
        // Find dominant emotion
        const dominantEmotion = Object.entries(emotionCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
        
        // Calculate confidence trend (comparing first half to second half)
        let confidenceTrend = 'stable';
        if (history.length >= 10) {
            const midpoint = Math.floor(history.length / 2);
            const firstHalfAvg = history.slice(0, midpoint).reduce((sum, h) => sum + h.confidence, 0) / midpoint;
            const secondHalfAvg = history.slice(midpoint).reduce((sum, h) => sum + h.confidence, 0) / (history.length - midpoint);
            
            if (secondHalfAvg > firstHalfAvg + 10) {
                confidenceTrend = 'improving';
            } else if (secondHalfAvg < firstHalfAvg - 10) {
                confidenceTrend = 'declining';
            }
        }
        
        return {
            averageConfidence: Math.round(avgConfidence),
            averageEyeContact: Math.round(avgEyeContact),
            averageEngagement: Math.round(avgEngagement),
            dominantEmotion,
            emotionDistribution,
            confidenceTrend,
            totalSamples
        };
    }, []);
    
    // Simulate expression analysis (replace with actual ML model in production)
    const analyzeFrame = useCallback(() => {
        if (!videoRef?.current || !isActive) {
            return;
        }
        
        const now = Date.now();
        if (now - lastAnalysisTime.current < analysisInterval) {
            animationFrameRef.current = requestAnimationFrame(analyzeFrame);
            return;
        }
        lastAnalysisTime.current = now;
        
        // Simulated analysis with realistic variations
        // In production, this would use face-api.js or TensorFlow.js
        const baseValues = {
            confidence: 65 + Math.random() * 30,
            eyeContact: 60 + Math.random() * 35,
            engagement: 60 + Math.random() * 30
        };
        
        // Add some persistence (values don't jump too much)
        const smoothedConfidence = currentExpression.confidence > 0 
            ? currentExpression.confidence * 0.7 + baseValues.confidence * 0.3
            : baseValues.confidence;
        const smoothedEyeContact = currentExpression.eyeContact > 0 
            ? currentExpression.eyeContact * 0.7 + baseValues.eyeContact * 0.3
            : baseValues.eyeContact;
        const smoothedEngagement = currentExpression.engagement > 0 
            ? currentExpression.engagement * 0.7 + baseValues.engagement * 0.3
            : baseValues.engagement;
        
        // Determine emotion
        const emotions = ['neutral', 'happy', 'thinking', 'nervous', 'surprised'];
        const weights = [0.5, 0.2, 0.15, 0.1, 0.05];
        let random = Math.random();
        let emotion = 'neutral';
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                emotion = emotions[i];
                break;
            }
        }
        
        // Determine posture
        const posture = Math.random() > 0.15 ? 'good' : 'leaning';
        
        const newExpression = {
            confidence: Math.round(smoothedConfidence),
            eyeContact: Math.round(smoothedEyeContact),
            emotion,
            engagement: Math.round(smoothedEngagement),
            posture,
            timestamp: now
        };
        
        setCurrentExpression(newExpression);
        setFaceDetected(true);
        
        // Add to history (keep last 200 samples)
        setExpressionHistory(prev => {
            const updated = [...prev, newExpression].slice(-200);
            const newStats = calculateAggregateStats(updated);
            setAggregateStats(newStats);
            return updated;
        });
        
        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    }, [videoRef, isActive, currentExpression, calculateAggregateStats]);
    
    // Start/stop analysis based on isActive
    useEffect(() => {
        if (isActive) {
            setIsAnalyzing(true);
            animationFrameRef.current = requestAnimationFrame(analyzeFrame);
        } else {
            setIsAnalyzing(false);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }
        
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isActive, analyzeFrame]);
    
    // Reset analysis
    const resetAnalysis = useCallback(() => {
        setCurrentExpression({
            confidence: 0,
            eyeContact: 0,
            emotion: 'neutral',
            engagement: 0,
            posture: 'unknown'
        });
        setExpressionHistory([]);
        setAggregateStats({
            averageConfidence: 0,
            averageEyeContact: 0,
            averageEngagement: 0,
            dominantEmotion: 'neutral',
            emotionDistribution: {},
            confidenceTrend: 'stable',
            totalSamples: 0
        });
        setFaceDetected(false);
    }, []);
    
    // Get expression summary for API calls
    const getExpressionSummary = useCallback(() => {
        return {
            current: currentExpression,
            aggregate: aggregateStats,
            history: expressionHistory.slice(-20), // Last 20 samples
            faceDetected
        };
    }, [currentExpression, aggregateStats, expressionHistory, faceDetected]);
    
    // Generate coaching tips based on expression data
    const getCoachingTips = useCallback(() => {
        const tips = [];
        
        if (aggregateStats.averageEyeContact < 50) {
            tips.push({
                type: 'warning',
                category: 'eye-contact',
                message: 'Try to maintain more eye contact with the camera',
                icon: '👁️'
            });
        }
        
        if (aggregateStats.averageConfidence < 50) {
            tips.push({
                type: 'info',
                category: 'confidence',
                message: 'Take deep breaths and speak more slowly to project confidence',
                icon: '💪'
            });
        }
        
        if (aggregateStats.emotionDistribution.nervous > 30) {
            tips.push({
                type: 'info',
                category: 'relaxation',
                message: 'You seem a bit nervous. Remember, this is practice!',
                icon: '😌'
            });
        }
        
        if (aggregateStats.confidenceTrend === 'improving') {
            tips.push({
                type: 'success',
                category: 'progress',
                message: 'Great job! Your confidence is improving as we go',
                icon: '📈'
            });
        }
        
        if (aggregateStats.averageEngagement > 70) {
            tips.push({
                type: 'success',
                category: 'engagement',
                message: 'Excellent engagement! Keep it up',
                icon: '⭐'
            });
        }
        
        return tips;
    }, [aggregateStats]);
    
    return {
        // Current state
        currentExpression,
        isAnalyzing,
        faceDetected,
        
        // Historical data
        expressionHistory,
        aggregateStats,
        
        // Functions
        resetAnalysis,
        getExpressionSummary,
        getCoachingTips
    };
};

export default useExpressionAnalysis;
