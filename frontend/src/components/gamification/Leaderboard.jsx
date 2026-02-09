import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Trophy, Medal, Crown, ChevronUp, ChevronDown,
    User, Minus, TrendingUp 
} from 'lucide-react';
import './Leaderboard.css';

const Leaderboard = ({ 
    entries = [], // [{ rank, name, avatar, xp, level, change, isCurrentUser }]
    currentUserId,
    timeframe = 'weekly',
    onTimeframeChange 
}) => {
    const [showMore, setShowMore] = useState(false);
    
    const timeframes = [
        { id: 'daily', label: 'Today' },
        { id: 'weekly', label: 'This Week' },
        { id: 'monthly', label: 'This Month' },
        { id: 'allTime', label: 'All Time' }
    ];
    
    const defaultEntries = [
        { rank: 1, name: 'Sarah K.', xp: 2450, level: 12, change: 0, isCurrentUser: false },
        { rank: 2, name: 'Mike R.', xp: 2320, level: 11, change: 1, isCurrentUser: false },
        { rank: 3, name: 'Alex M.', xp: 2180, level: 11, change: -1, isCurrentUser: false },
        { rank: 4, name: 'You', xp: 1950, level: 10, change: 2, isCurrentUser: true },
        { rank: 5, name: 'Jordan L.', xp: 1840, level: 9, change: 0, isCurrentUser: false },
        { rank: 6, name: 'Chris P.', xp: 1720, level: 9, change: 1, isCurrentUser: false },
        { rank: 7, name: 'Taylor S.', xp: 1650, level: 8, change: -2, isCurrentUser: false }
    ];
    
    const displayEntries = entries.length > 0 ? entries : defaultEntries;
    const visibleEntries = showMore ? displayEntries : displayEntries.slice(0, 5);
    
    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Crown size={18} className="rank-icon gold" />;
            case 2: return <Medal size={18} className="rank-icon silver" />;
            case 3: return <Medal size={18} className="rank-icon bronze" />;
            default: return <span className="rank-number">{rank}</span>;
        }
    };
    
    const getChangeIndicator = (change) => {
        if (change > 0) return <ChevronUp size={14} className="change up" />;
        if (change < 0) return <ChevronDown size={14} className="change down" />;
        return <Minus size={14} className="change same" />;
    };
    
    return (
        <div className="leaderboard">
            <div className="leaderboard-header">
                <div className="header-left">
                    <Trophy size={20} />
                    <h3>Leaderboard</h3>
                </div>
                
                <div className="timeframe-toggle">
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
            
            {/* Top 3 Podium */}
            <div className="podium">
                {displayEntries.slice(0, 3).map((entry, index) => {
                    const positions = [1, 0, 2]; // Order: 2nd, 1st, 3rd
                    const pos = positions[index];
                    const podiumEntry = displayEntries[pos];
                    
                    return (
                        <motion.div
                            key={podiumEntry.rank}
                            className={`podium-spot rank-${podiumEntry.rank} ${podiumEntry.isCurrentUser ? 'is-user' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="podium-avatar">
                                <User size={24} />
                            </div>
                            <span className="podium-name">{podiumEntry.name}</span>
                            <span className="podium-xp">{podiumEntry.xp.toLocaleString()} XP</span>
                            <div className={`podium-stand rank-${podiumEntry.rank}`}>
                                {getRankIcon(podiumEntry.rank)}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            
            {/* Rankings List */}
            <div className="rankings-list">
                {visibleEntries.slice(3).map((entry, index) => (
                    <motion.div
                        key={entry.rank}
                        className={`rank-entry ${entry.isCurrentUser ? 'is-user' : ''}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                    >
                        <div className="rank-position">
                            {getRankIcon(entry.rank)}
                        </div>
                        
                        <div className="rank-avatar">
                            <User size={16} />
                        </div>
                        
                        <div className="rank-info">
                            <span className="rank-name">{entry.name}</span>
                            <span className="rank-level">Level {entry.level}</span>
                        </div>
                        
                        <span className="rank-xp">{entry.xp.toLocaleString()} XP</span>
                        
                        <div className="rank-change">
                            {getChangeIndicator(entry.change)}
                        </div>
                    </motion.div>
                ))}
            </div>
            
            {displayEntries.length > 5 && (
                <button 
                    className="show-more-btn"
                    onClick={() => setShowMore(!showMore)}
                >
                    {showMore ? 'Show Less' : `Show More (${displayEntries.length - 5} more)`}
                </button>
            )}
            
            {/* User's position if not visible */}
            {!visibleEntries.some(e => e.isCurrentUser) && displayEntries.some(e => e.isCurrentUser) && (
                <div className="user-position-hint">
                    <TrendingUp size={14} />
                    <span>You're ranked #{displayEntries.find(e => e.isCurrentUser)?.rank}</span>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
