import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Grid, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './TopicHeatmap.css';

const TopicHeatmap = ({ 
    data = [], // [{ topic, score, interviews, trend }]
    onTopicClick 
}) => {
    const [hoveredTopic, setHoveredTopic] = useState(null);
    
    const processedData = useMemo(() => {
        const defaultTopics = [
            'General', 'Technical', 'Behavioral', 'System Design', 
            'Case Study', 'Leadership', 'Communication', 'Problem Solving'
        ];
        
        if (data.length === 0) {
            return defaultTopics.map(topic => ({
                topic,
                score: null,
                interviews: 0,
                trend: 0
            }));
        }
        
        return data.map(item => ({
            ...item,
            heatLevel: item.score ? Math.ceil(item.score / 2) : 0 // 1-5 levels
        }));
    }, [data]);
    
    const getHeatColor = (score) => {
        if (score === null) return 'no-data';
        if (score >= 8) return 'excellent';
        if (score >= 6) return 'good';
        if (score >= 4) return 'fair';
        if (score >= 2) return 'needs-work';
        return 'poor';
    };
    
    const getTrendIcon = (trend) => {
        if (trend > 0.5) return <TrendingUp size={14} className="trend up" />;
        if (trend < -0.5) return <TrendingDown size={14} className="trend down" />;
        return <Minus size={14} className="trend stable" />;
    };
    
    return (
        <div className="topic-heatmap">
            <div className="heatmap-header">
                <Grid size={20} />
                <h3>Topic Performance</h3>
            </div>
            
            <div className="heatmap-grid">
                {processedData.map((item, index) => (
                    <motion.div
                        key={item.topic}
                        className={`heat-cell ${getHeatColor(item.score)}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onMouseEnter={() => setHoveredTopic(item)}
                        onMouseLeave={() => setHoveredTopic(null)}
                        onClick={() => onTopicClick?.(item.topic)}
                    >
                        <span className="cell-topic">{item.topic}</span>
                        {item.score !== null && (
                            <>
                                <span className="cell-score">{item.score.toFixed(1)}</span>
                                {getTrendIcon(item.trend)}
                            </>
                        )}
                        {item.score === null && (
                            <span className="cell-empty">No data</span>
                        )}
                    </motion.div>
                ))}
            </div>
            
            <div className="heatmap-legend">
                <span className="legend-label">Weak</span>
                <div className="legend-scale">
                    <span className="scale-item poor" />
                    <span className="scale-item needs-work" />
                    <span className="scale-item fair" />
                    <span className="scale-item good" />
                    <span className="scale-item excellent" />
                </div>
                <span className="legend-label">Strong</span>
            </div>
            
            {hoveredTopic && hoveredTopic.interviews > 0 && (
                <motion.div
                    className="heatmap-tooltip"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h4>{hoveredTopic.topic}</h4>
                    <div className="tooltip-stats">
                        <span>Score: <strong>{hoveredTopic.score?.toFixed(1)}/10</strong></span>
                        <span>Interviews: <strong>{hoveredTopic.interviews}</strong></span>
                        <span>Trend: 
                            <strong className={hoveredTopic.trend > 0 ? 'positive' : hoveredTopic.trend < 0 ? 'negative' : ''}>
                                {hoveredTopic.trend > 0 ? '+' : ''}{hoveredTopic.trend?.toFixed(1)}
                            </strong>
                        </span>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default TopicHeatmap;
