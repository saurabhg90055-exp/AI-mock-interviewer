import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Square, 
  Play, 
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import './RecordButton.css';

/**
 * Animated Recording Button Component
 * Features pulse animations, state transitions, and audio level indicator
 */
const RecordButton = ({
  isRecording = false,
  isProcessing = false,
  isDisabled = false,
  audioLevel = 0,
  onStart,
  onStop,
  size = 'large', // 'small' | 'medium' | 'large'
  showLevel = true,
  label = true
}) => {
  const handleClick = () => {
    if (isDisabled || isProcessing) return;
    
    if (isRecording) {
      onStop?.();
    } else {
      onStart?.();
    }
  };

  // Size configurations
  const sizes = {
    small: { button: 50, icon: 20, ring: 60 },
    medium: { button: 70, icon: 28, ring: 85 },
    large: { button: 90, icon: 36, ring: 110 }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`record-button-wrapper size-${size}`}>
      {/* Outer pulse rings when recording */}
      <AnimatePresence>
        {isRecording && (
          <>
            <motion.div
              className="pulse-ring ring-1"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.4, 1.8],
                opacity: [0.6, 0.3, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ 
                width: sizeConfig.ring, 
                height: sizeConfig.ring,
                borderColor: '#f56565'
              }}
            />
            <motion.div
              className="pulse-ring ring-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.6, 2.2],
                opacity: [0.4, 0.2, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              style={{ 
                width: sizeConfig.ring, 
                height: sizeConfig.ring,
                borderColor: '#f56565'
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Audio level ring */}
      {showLevel && isRecording && (
        <svg 
          className="level-ring" 
          viewBox="0 0 100 100"
          style={{ width: sizeConfig.ring + 20, height: sizeConfig.ring + 20 }}
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(245, 101, 101, 0.2)"
            strokeWidth="4"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f56565"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.min(audioLevel * 1.5, 1) }}
            transition={{ duration: 0.1 }}
            style={{
              transformOrigin: 'center',
              transform: 'rotate(-90deg)'
            }}
          />
        </svg>
      )}

      {/* Main button */}
      <motion.button
        className={`record-button ${isRecording ? 'recording' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={handleClick}
        disabled={isDisabled || isProcessing}
        style={{ 
          width: sizeConfig.button, 
          height: sizeConfig.button 
        }}
        whileHover={{ scale: isDisabled ? 1 : 1.05 }}
        whileTap={{ scale: isDisabled ? 1 : 0.95 }}
        animate={{
          backgroundColor: isRecording ? '#f56565' : '#48bb78',
          boxShadow: isRecording 
            ? `0 0 30px rgba(245, 101, 101, 0.5)`
            : `0 0 20px rgba(72, 187, 120, 0.3)`
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Inner glow when recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              className="inner-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          className="button-icon"
          animate={{ 
            scale: isRecording ? [1, 1.1, 1] : 1 
          }}
          transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
        >
          {isProcessing ? (
            <motion.div
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : isRecording ? (
            <Square size={sizeConfig.icon} fill="white" />
          ) : (
            <Mic size={sizeConfig.icon} />
          )}
        </motion.div>

        {/* Recording indicator dot */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              className="rec-indicator"
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                opacity: [1, 0.5, 1]
              }}
              exit={{ scale: 0 }}
              transition={{ 
                scale: { duration: 0.2 },
                opacity: { duration: 0.8, repeat: Infinity }
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Label */}
      {label && (
        <motion.span 
          className="button-label"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          key={isRecording ? 'stop' : 'start'}
        >
          {isProcessing ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
        </motion.span>
      )}
    </div>
  );
};

export default RecordButton;
