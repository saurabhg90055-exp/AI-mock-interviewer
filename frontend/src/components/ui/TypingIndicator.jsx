import { motion, AnimatePresence } from 'framer-motion';
import './TypingIndicator.css';

/**
 * Typing/Thinking Indicator Component
 * Shows animated dots when AI is processing
 */
const TypingIndicator = ({ 
  isVisible = true,
  variant = 'dots', // 'dots' | 'pulse' | 'wave' | 'bounce'
  text = '',
  color = 'primary' // 'primary' | 'success' | 'warning'
}) => {
  const colors = {
    primary: '#667eea',
    success: '#48bb78',
    warning: '#ed8936'
  };

  const renderDots = () => (
    <div className="typing-dots">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="typing-dot"
          style={{ backgroundColor: colors[color] }}
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.15,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className="typing-pulse">
      <motion.div
        className="pulse-circle"
        style={{ backgroundColor: colors[color] }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.8, 0.3, 0.8]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
      />
      <motion.div
        className="pulse-inner"
        style={{ backgroundColor: colors[color] }}
      />
    </div>
  );

  const renderWave = () => (
    <div className="typing-wave">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="wave-bar"
          style={{ backgroundColor: colors[color] }}
          animate={{
            height: ['4px', '16px', '4px']
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );

  const renderBounce = () => (
    <div className="typing-bounce">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="bounce-dot"
          style={{ backgroundColor: colors[color] }}
          animate={{
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.2,
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );

  const variants = {
    dots: renderDots,
    pulse: renderPulse,
    wave: renderWave,
    bounce: renderBounce
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="typing-indicator"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          {variants[variant]?.()}
          {text && <span className="typing-text">{text}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TypingIndicator;
