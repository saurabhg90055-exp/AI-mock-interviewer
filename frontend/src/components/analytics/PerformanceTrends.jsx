import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, Flag, Target } from 'lucide-react';
import './PerformanceTrends.css';

const PerformanceTrends = ({ 
    data = [], // [{ date, score, topic, milestone? }]
    timeframe = '30d',
    onTimeframeChange,
    showMilestones = true 
}) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);
    
    const timeframes = [
        { id: '7d', label: '7 Days' },
        { id: '30d', label: '30 Days' },
        { id: '90d', label: '90 Days' },
        { id: 'all', label: 'All Time' }
    ];
    
    const chartData = useMemo(() => {
        if (data.length === 0) return { points: [], milestones: [], stats: null };
        
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const maxScore = 10;
        const minScore = 0;
        
        const points = sortedData.map((item, index) => ({
            ...item,
            x: (index / (sortedData.length - 1 || 1)) * 100,
            y: 100 - ((item.score - minScore) / (maxScore - minScore)) * 100
        }));
        
        const milestones = sortedData
            .filter(item => item.milestone)
            .map((item, _, arr) => {
                const index = sortedData.indexOf(item);
                return {
                    ...item,
                    x: (index / (sortedData.length - 1 || 1)) * 100,
                    y: 100 - ((item.score - minScore) / (maxScore - minScore)) * 100
                };
            });
        
        // Calculate stats
        const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
        const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
        
        const avgFirst = firstHalf.reduce((acc, d) => acc + d.score, 0) / (firstHalf.length || 1);
        const avgSecond = secondHalf.reduce((acc, d) => acc + d.score, 0) / (secondHalf.length || 1);
        const improvement = avgSecond - avgFirst;
        
        const currentAvg = sortedData.slice(-5).reduce((acc, d) => acc + d.score, 0) / 
            Math.min(5, sortedData.length);
        
        const bestScore = Math.max(...sortedData.map(d => d.score));
        
        return {
            points,
            milestones,
            stats: {
                improvement: improvement.toFixed(1),
                currentAvg: currentAvg.toFixed(1),
                bestScore: bestScore.toFixed(1),
                totalInterviews: sortedData.length
            }
        };
    }, [data]);
    
    const generatePath = () => {
        if (chartData.points.length < 2) return '';
        
        return chartData.points
            .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
            .join(' ');
    };
    
    const generateAreaPath = () => {
        if (chartData.points.length < 2) return '';
        
        const linePath = generatePath();
        const lastPoint = chartData.points[chartData.points.length - 1];
        const firstPoint = chartData.points[0];
        
        return `${linePath} L ${lastPoint.x} 100 L ${firstPoint.x} 100 Z`;
    };
    
    return (
        <div className="performance-trends">
            <div className="trends-header">
                <div className="header-title">
                    <TrendingUp size={20} />
                    <h3>Performance Trends</h3>
                </div>
                
                <div className="timeframe-selector">
                    {timeframes.map(tf => (
                        <button
                            key={tf.id}
                            className={`tf-btn ${timeframe === tf.id ? 'active' : ''}`}
                            onClick={() => onTimeframeChange?.(tf.id)}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {chartData.stats && (
                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-value">
                            {chartData.stats.improvement > 0 ? '+' : ''}{chartData.stats.improvement}
                        </span>
                        <span className="stat-label">Improvement</span>
                        {chartData.stats.improvement > 0 ? (
                            <TrendingUp size={16} className="trend-icon up" />
                        ) : (
                            <TrendingDown size={16} className="trend-icon down" />
                        )}
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{chartData.stats.currentAvg}</span>
                        <span className="stat-label">Current Avg</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{chartData.stats.bestScore}</span>
                        <span className="stat-label">Best Score</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{chartData.stats.totalInterviews}</span>
                        <span className="stat-label">Interviews</span>
                    </div>
                </div>
            )}
            
            <div className="chart-container">
                {data.length === 0 ? (
                    <div className="empty-chart">
                        <Calendar size={32} />
                        <p>No interview data yet</p>
                        <span>Complete interviews to see your trends</span>
                    </div>
                ) : (
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart-svg">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(y => (
                            <line
                                key={y}
                                x1="0" y1={y} x2="100" y2={y}
                                className="grid-line"
                            />
                        ))}
                        
                        {/* Area fill */}
                        <path
                            d={generateAreaPath()}
                            className="chart-area"
                        />
                        
                        {/* Line */}
                        <path
                            d={generatePath()}
                            className="chart-line"
                            fill="none"
                        />
                        
                        {/* Points */}
                        {chartData.points.map((point, i) => (
                            <g
                                key={i}
                                className="chart-point"
                                onMouseEnter={() => setHoveredPoint(point)}
                                onMouseLeave={() => setHoveredPoint(null)}
                            >
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="1.5"
                                    className="point-dot"
                                />
                            </g>
                        ))}
                        
                        {/* Milestones */}
                        {showMilestones && chartData.milestones.map((ms, i) => (
                            <g key={i} className="milestone-marker">
                                <line
                                    x1={ms.x} y1="0"
                                    x2={ms.x} y2="100"
                                    className="milestone-line"
                                />
                                <circle
                                    cx={ms.x}
                                    cy={ms.y}
                                    r="2.5"
                                    className="milestone-dot"
                                />
                            </g>
                        ))}
                    </svg>
                )}
                
                {/* Y-axis labels */}
                <div className="y-axis">
                    <span>10</span>
                    <span>5</span>
                    <span>0</span>
                </div>
                
                {/* Hover tooltip */}
                {hoveredPoint && (
                    <motion.div
                        className="chart-tooltip"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            left: `${hoveredPoint.x}%`,
                            top: `${hoveredPoint.y}%`
                        }}
                    >
                        <span className="tooltip-score">{hoveredPoint.score}/10</span>
                        <span className="tooltip-topic">{hoveredPoint.topic}</span>
                        <span className="tooltip-date">
                            {new Date(hoveredPoint.date).toLocaleDateString()}
                        </span>
                        {hoveredPoint.milestone && (
                            <span className="tooltip-milestone">
                                <Flag size={10} /> {hoveredPoint.milestone}
                            </span>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PerformanceTrends;
