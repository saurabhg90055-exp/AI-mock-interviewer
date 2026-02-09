import React from 'react';
import { motion } from 'framer-motion';
import { 
    Award, Star, Target, Zap, Trophy, 
    MessageSquare, Clock, TrendingUp, Flame 
} from 'lucide-react';
import './AchievementUnlock.css';

const AchievementUnlock = ({ 
    achievement,
    isVisible = false,
    onClose,
    onShare 
}) => {
    if (!isVisible || !achievement) return null;
    
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
    
    const Icon = iconMap[achievement.icon] || iconMap.default;
    
    const rarityColors = {
        common: { bg: '#6b7280', glow: 'rgba(107, 114, 128, 0.5)' },
        rare: { bg: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
        epic: { bg: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
        legendary: { bg: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' }
    };
    
    const colors = rarityColors[achievement.rarity] || rarityColors.common;
    
    return (
        <motion.div
            className="achievement-unlock-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="achievement-unlock-modal"
                initial={{ scale: 0.5, y: 100 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ 
                    type: 'spring',
                    damping: 15,
                    stiffness: 200
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Glow effect */}
                <div 
                    className="achievement-glow"
                    style={{ boxShadow: `0 0 100px 30px ${colors.glow}` }}
                />
                
                {/* Particles */}
                <div className="particles">
                    {[...Array(12)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="particle"
                            initial={{ 
                                opacity: 0,
                                scale: 0,
                                x: 0,
                                y: 0
                            }}
                            animate={{ 
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                x: Math.cos(i * 30 * Math.PI / 180) * (80 + Math.random() * 40),
                                y: Math.sin(i * 30 * Math.PI / 180) * (80 + Math.random() * 40)
                            }}
                            transition={{ 
                                delay: 0.2 + i * 0.05,
                                duration: 0.8
                            }}
                            style={{ background: colors.bg }}
                        />
                    ))}
                </div>
                
                {/* Badge */}
                <motion.div
                    className="achievement-badge"
                    style={{ background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}cc)` }}
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <Icon size={48} />
                </motion.div>
                
                <motion.h2
                    className="unlock-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    Achievement Unlocked!
                </motion.h2>
                
                <motion.h3
                    className="achievement-name"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {achievement.name}
                </motion.h3>
                
                <motion.p
                    className="achievement-description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    {achievement.description}
                </motion.p>
                
                <motion.div
                    className="achievement-reward"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <span className="reward-xp">+{achievement.xp} XP</span>
                    <span 
                        className="rarity-badge"
                        style={{ backgroundColor: `${colors.bg}30`, color: colors.bg }}
                    >
                        {achievement.rarity}
                    </span>
                </motion.div>
                
                <motion.div
                    className="achievement-actions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <button className="share-btn" onClick={onShare}>
                        Share
                    </button>
                    <button className="dismiss-btn" onClick={onClose}>
                        Awesome!
                    </button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default AchievementUnlock;
