import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Award, Star, Target, Zap, Trophy, MessageSquare,
    Clock, TrendingUp, Flame, Lock, Check, Info
} from 'lucide-react';
import './ProfileBadges.css';

const ProfileBadges = ({ 
    badges = [],
    onBadgeClick 
}) => {
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [filter, setFilter] = useState('all');
    
    const iconMap = {
        star: Star,
        target: Target,
        zap: Zap,
        trophy: Trophy,
        message: MessageSquare,
        clock: Clock,
        trending: TrendingUp,
        flame: Flame,
        default: Award
    };
    
    const defaultBadges = [
        { id: 'b1', name: 'First Steps', description: 'Complete your first interview', icon: 'star', rarity: 'common', earned: true, earnedDate: '2024-01-15' },
        { id: 'b2', name: 'Streak Starter', description: 'Maintain a 3-day practice streak', icon: 'flame', rarity: 'common', earned: true, earnedDate: '2024-01-18' },
        { id: 'b3', name: 'Quick Thinker', description: 'Answer 10 questions under time limit', icon: 'clock', rarity: 'rare', earned: true, earnedDate: '2024-02-01' },
        { id: 'b4', name: 'STAR Master', description: 'Perfect STAR method in 5 answers', icon: 'target', rarity: 'rare', earned: false, progress: { current: 3, total: 5 } },
        { id: 'b5', name: 'Improvement Champion', description: 'Improve score by 3 points in a topic', icon: 'trending', rarity: 'epic', earned: false, progress: { current: 1.5, total: 3 } },
        { id: 'b6', name: 'Interview Legend', description: 'Complete 100 practice interviews', icon: 'trophy', rarity: 'legendary', earned: false, progress: { current: 45, total: 100 } }
    ];
    
    const displayBadges = badges.length > 0 ? badges : defaultBadges;
    
    const filteredBadges = displayBadges.filter(badge => {
        if (filter === 'earned') return badge.earned;
        if (filter === 'locked') return !badge.earned;
        return true;
    });
    
    const rarityColors = {
        common: '#6b7280',
        rare: '#3b82f6',
        epic: '#8b5cf6',
        legendary: '#f59e0b'
    };
    
    const earnedCount = displayBadges.filter(b => b.earned).length;
    
    return (
        <div className="profile-badges">
            <div className="badges-header">
                <div className="header-left">
                    <Award size={20} />
                    <h3>Badges</h3>
                    <span className="badge-count">{earnedCount}/{displayBadges.length}</span>
                </div>
                
                <div className="filter-tabs">
                    {['all', 'earned', 'locked'].map(f => (
                        <button
                            key={f}
                            className={`filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="badges-grid">
                {filteredBadges.map((badge, index) => {
                    const Icon = iconMap[badge.icon] || iconMap.default;
                    const color = rarityColors[badge.rarity];
                    
                    return (
                        <motion.div
                            key={badge.id}
                            className={`badge-card ${badge.earned ? 'earned' : 'locked'} ${badge.rarity}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedBadge(badge)}
                        >
                            <div 
                                className="badge-icon"
                                style={{ 
                                    background: badge.earned 
                                        ? `linear-gradient(135deg, ${color}, ${color}aa)`
                                        : 'rgba(255, 255, 255, 0.05)'
                                }}
                            >
                                {badge.earned ? (
                                    <Icon size={24} />
                                ) : (
                                    <Lock size={18} />
                                )}
                            </div>
                            
                            <span className="badge-name">{badge.name}</span>
                            
                            {!badge.earned && badge.progress && (
                                <div className="badge-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ 
                                                width: `${(badge.progress.current / badge.progress.total) * 100}%`,
                                                background: color
                                            }}
                                        />
                                    </div>
                                    <span>{badge.progress.current}/{badge.progress.total}</span>
                                </div>
                            )}
                            
                            {badge.earned && (
                                <div className="earned-indicator">
                                    <Check size={12} />
                                </div>
                            )}
                            
                            <span 
                                className="rarity-dot"
                                style={{ background: color }}
                            />
                        </motion.div>
                    );
                })}
            </div>
            
            {/* Badge Detail Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <motion.div
                        className="badge-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedBadge(null)}
                    >
                        <motion.div
                            className="badge-modal"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {(() => {
                                const Icon = iconMap[selectedBadge.icon] || iconMap.default;
                                const color = rarityColors[selectedBadge.rarity];
                                
                                return (
                                    <>
                                        <div 
                                            className="modal-badge-icon"
                                            style={{ 
                                                background: selectedBadge.earned 
                                                    ? `linear-gradient(135deg, ${color}, ${color}cc)`
                                                    : 'rgba(255, 255, 255, 0.1)'
                                            }}
                                        >
                                            {selectedBadge.earned ? <Icon size={40} /> : <Lock size={28} />}
                                        </div>
                                        
                                        <h4>{selectedBadge.name}</h4>
                                        <p>{selectedBadge.description}</p>
                                        
                                        <span 
                                            className="modal-rarity"
                                            style={{ color }}
                                        >
                                            {selectedBadge.rarity}
                                        </span>
                                        
                                        {selectedBadge.earned && selectedBadge.earnedDate && (
                                            <span className="earned-date">
                                                Earned {new Date(selectedBadge.earnedDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        
                                        {!selectedBadge.earned && selectedBadge.progress && (
                                            <div className="modal-progress">
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill"
                                                        style={{ 
                                                            width: `${(selectedBadge.progress.current / selectedBadge.progress.total) * 100}%`,
                                                            background: color
                                                        }}
                                                    />
                                                </div>
                                                <span>{selectedBadge.progress.current} / {selectedBadge.progress.total}</span>
                                            </div>
                                        )}
                                        
                                        <button 
                                            className="close-modal-btn"
                                            onClick={() => setSelectedBadge(null)}
                                        >
                                            Close
                                        </button>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileBadges;
