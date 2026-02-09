import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, TrendingDown, TrendingUp } from 'lucide-react';
import './FillerCounter.css';

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'well', 'right'];

const FillerCounter = ({ 
    transcript = '',
    isActive = true,
    showBreakdown = true,
    showTrend = true,
    onFillerDetected,
    previousCount = 0 
}) => {
    const [fillerCounts, setFillerCounts] = useState({});
    const [totalCount, setTotalCount] = useState(0);
    const [lastDetected, setLastDetected] = useState(null);
    
    useEffect(() => {
        if (!isActive || !transcript) return;
        
        const lowerTranscript = transcript.toLowerCase();
        const counts = {};
        let total = 0;
        
        FILLER_WORDS.forEach(filler => {
            const regex = new RegExp(`\\b${filler}\\b`, 'gi');
            const matches = lowerTranscript.match(regex);
            const count = matches ? matches.length : 0;
            if (count > 0) {
                counts[filler] = count;
                total += count;
            }
        });
        
        // Detect new fillers
        if (total > totalCount) {
            const newFiller = Object.keys(counts).find(f => 
                counts[f] > (fillerCounts[f] || 0)
            );
            if (newFiller) {
                setLastDetected(newFiller);
                onFillerDetected?.(newFiller, counts[newFiller]);
                setTimeout(() => setLastDetected(null), 2000);
            }
        }
        
        setFillerCounts(counts);
        setTotalCount(total);
    }, [transcript, isActive]);
    
    const getStatus = () => {
        const wordsInTranscript = transcript.split(/\s+/).length;
        const fillerRate = wordsInTranscript > 0 ? (totalCount / wordsInTranscript) * 100 : 0;
        
        if (fillerRate < 2) return { status: 'excellent', label: 'Excellent', color: '#10b981' };
        if (fillerRate < 5) return { status: 'good', label: 'Good', color: '#6366f1' };
        if (fillerRate < 10) return { status: 'fair', label: 'Fair', color: '#fbbf24' };
        return { status: 'needs-work', label: 'Needs Work', color: '#ef4444' };
    };
    
    const status = getStatus();
    const trend = totalCount - previousCount;
    
    if (!isActive) return null;
    
    return (
        <div className={`filler-counter ${status.status}`}>
            <div className="filler-header">
                <div className="header-left">
                    <AlertTriangle size={16} />
                    <span>Filler Words</span>
                </div>
                <div className="header-right">
                    <span className="total-count" style={{ color: status.color }}>
                        {totalCount}
                    </span>
                    {showTrend && previousCount > 0 && trend !== 0 && (
                        <span className={`trend ${trend > 0 ? 'up' : 'down'}`}>
                            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(trend)}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="status-badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                {status.label}
            </div>
            
            {showBreakdown && Object.keys(fillerCounts).length > 0 && (
                <div className="filler-breakdown">
                    {Object.entries(fillerCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([word, count]) => (
                            <div key={word} className="filler-item">
                                <span className="filler-word">"{word}"</span>
                                <span className="filler-count">×{count}</span>
                            </div>
                        ))
                    }
                </div>
            )}
            
            <AnimatePresence>
                {lastDetected && (
                    <motion.div
                        className="filler-popup"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    >
                        <Info size={14} />
                        <span>Detected: "{lastDetected}"</span>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {totalCount > 5 && (
                <div className="filler-tip">
                    <Info size={12} />
                    <span>Try pausing instead of using filler words</span>
                </div>
            )}
        </div>
    );
};

export default FillerCounter;
