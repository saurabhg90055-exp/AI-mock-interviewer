import { motion } from 'framer-motion';
import './ScoreDisplay.css';

/**
 * Animated Score Display Component
 * Shows score with circular progress and animations
 */
const ScoreDisplay = ({
  score,
  maxScore = 10,
  size = 'medium', // 'small' | 'medium' | 'large'
  showLabel = true,
  animated = true,
  trend = null, // 'up' | 'down' | 'stable'
  label = 'Score'
}) => {
  // Calculate percentage and color
  const percentage = (score / maxScore) * 100;
  
  const getColor = () => {
    if (percentage >= 70) return { primary: '#48bb78', secondary: '#38a169' };
    if (percentage >= 50) return { primary: '#ecc94b', secondary: '#d69e2e' };
    return { primary: '#f56565', secondary: '#c53030' };
  };

  const colors = getColor();
  
  // Size configurations
  const sizes = {
    small: { size: 60, stroke: 4, fontSize: '1.2rem', labelSize: '0.65rem' },
    medium: { size: 100, stroke: 6, fontSize: '2rem', labelSize: '0.75rem' },
    large: { size: 150, stroke: 8, fontSize: '3rem', labelSize: '0.9rem' }
  };

  const config = sizes[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  // Emoji based on score
  const getEmoji = () => {
    if (percentage >= 80) return '🌟';
    if (percentage >= 60) return '👍';
    if (percentage >= 40) return '💪';
    return '📈';
  };

  // Trend indicator
  const getTrendIcon = () => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return null;
  };

  return (
    <div className={`score-display size-${size}`}>
      <div className="score-circle-container" style={{ width: config.size, height: config.size }}>
        <svg viewBox={`0 0 ${config.size} ${config.size}`}>
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={config.stroke}
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={`url(#scoreGradient-${size})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animated ? offset : circumference }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center'
            }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`scoreGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="100%" stopColor={colors.secondary} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score value */}
        <div className="score-value-container">
          <motion.span 
            className="score-value"
            style={{ fontSize: config.fontSize, color: colors.primary }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {animated ? (
              <CountUp value={score} duration={1.5} />
            ) : (
              score
            )}
          </motion.span>
          <span className="score-max" style={{ fontSize: config.labelSize }}>
            /{maxScore}
          </span>
        </div>
        
        {/* Emoji indicator */}
        <motion.div 
          className="score-emoji"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 1.2, type: 'spring' }}
        >
          {getEmoji()}
        </motion.div>
      </div>
      
      {/* Label and trend */}
      {showLabel && (
        <div className="score-label-container">
          <span className="score-label" style={{ fontSize: config.labelSize }}>
            {label}
          </span>
          {trend && (
            <motion.span 
              className={`score-trend trend-${trend}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
            >
              {getTrendIcon()}
            </motion.span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Animated count-up component
 */
const CountUp = ({ value, duration = 1 }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ value: 0 }}
        animate={{ value }}
        transition={{ duration, ease: 'easeOut' }}
      >
        {({ value: animatedValue }) => Math.round(animatedValue * 10) / 10}
      </motion.span>
    </motion.span>
  );
};

/**
 * Score Badge - Compact inline score display
 */
export const ScoreBadge = ({ score, maxScore = 10, size = 'small' }) => {
  const percentage = (score / maxScore) * 100;
  
  const getColorClass = () => {
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'ok';
    return 'poor';
  };

  return (
    <motion.span 
      className={`score-badge badge-${getColorClass()} badge-size-${size}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      ⭐ {score}/{maxScore}
    </motion.span>
  );
};

export default ScoreDisplay;
