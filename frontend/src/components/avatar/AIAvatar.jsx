import { useRef, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIAvatar.css';

/**
 * AI Interviewer Avatar Component
 * Animated avatar that responds to different states: idle, speaking, listening, thinking
 * Enhanced for video mode with expression-aware responses
 */
const AIAvatar = ({ 
  state = 'idle', // 'idle' | 'speaking' | 'listening' | 'thinking' | 'happy' | 'concerned' | 'encouraging' | 'impressed'
  audioLevel = 0,
  score = null,
  size = 'large', // 'small' | 'medium' | 'large'
  userExpression = null, // For video mode: { confidence, eyeContact, emotion, engagement }
  videoMode = false,
  showFeedback = false
}) => {
  const containerRef = useRef(null);
  const [adaptiveState, setAdaptiveState] = useState(state);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // Adapt avatar state based on user expression in video mode
  useEffect(() => {
    if (!videoMode || !userExpression) {
      setAdaptiveState(state);
      return;
    }
    
    const { confidence, eyeContact, emotion, engagement } = userExpression;
    
    // If AI is not speaking/thinking, adapt to user's state
    if (state === 'listening' || state === 'idle') {
      if (confidence < 40) {
        setAdaptiveState('encouraging');
        setFeedbackMessage('You\'re doing great! Take your time.');
      } else if (confidence > 80 && engagement > 70) {
        setAdaptiveState('impressed');
        setFeedbackMessage('Excellent energy!');
      } else if (emotion === 'nervous') {
        setAdaptiveState('encouraging');
        setFeedbackMessage('Relax, you\'ve got this!');
      } else if (eyeContact < 30) {
        setFeedbackMessage('Try to maintain eye contact');
        setAdaptiveState('listening');
      } else {
        setAdaptiveState(state);
        setFeedbackMessage('');
      }
    } else {
      setAdaptiveState(state);
    }
  }, [state, userExpression, videoMode]);
  
  // Generate wave bars for speaking animation
  const waveBars = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: i * 0.05,
      height: 20 + Math.random() * 30
    })), []
  );

  // Determine avatar expression based on state and score
  const getExpression = () => {
    if (adaptiveState === 'encouraging') return 'encouraging';
    if (adaptiveState === 'impressed') return 'impressed';
    if (adaptiveState === 'happy' || (score && score >= 8)) return 'happy';
    if (adaptiveState === 'concerned' || (score && score < 5)) return 'concerned';
    if (adaptiveState === 'thinking') return 'thinking';
    if (adaptiveState === 'listening') return 'listening';
    if (adaptiveState === 'speaking') return 'speaking';
    return 'idle';
  };

  const expression = getExpression();

  // Eye animation variants
  const eyeVariants = {
    idle: {
      scaleY: 1,
      transition: { duration: 0.3 }
    },
    blink: {
      scaleY: [1, 0.1, 1],
      transition: { duration: 0.2 }
    },
    happy: {
      scaleY: 0.6,
      borderRadius: '50%',
      transition: { duration: 0.3 }
    },
    concerned: {
      scaleY: 1,
      y: 2,
      transition: { duration: 0.3 }
    },
    listening: {
      scaleY: 1.1,
      scaleX: 1.1,
      transition: { duration: 0.3 }
    },
    encouraging: {
      scaleY: 0.8,
      scaleX: 1.1,
      transition: { duration: 0.3 }
    },
    impressed: {
      scaleY: 1.2,
      scaleX: 1.1,
      transition: { duration: 0.3 }
    }
  };

  // Mouth animation based on state
  const getMouthVariant = () => {
    switch (expression) {
      case 'speaking':
        return {
          height: [8, 20, 12, 18, 8],
          width: [30, 25, 35, 28, 30],
          borderRadius: ['40%', '50%', '45%', '50%', '40%'],
          transition: { duration: 0.3, repeat: Infinity }
        };
      case 'happy':
        return {
          height: 12,
          width: 35,
          borderRadius: '0 0 50% 50%',
          transition: { duration: 0.3 }
        };
      case 'encouraging':
        return {
          height: 10,
          width: 32,
          borderRadius: '0 0 50% 50%',
          transition: { duration: 0.3 }
        };
      case 'impressed':
        return {
          height: 15,
          width: 25,
          borderRadius: '50%',
          transition: { duration: 0.3 }
        };
      case 'concerned':
        return {
          height: 6,
          width: 25,
          borderRadius: '50% 50% 0 0',
          y: 5,
          transition: { duration: 0.3 }
        };
      case 'thinking':
        return {
          height: 8,
          width: 20,
          x: 10,
          borderRadius: '50%',
          transition: { duration: 0.3 }
        };
      case 'listening':
        return {
          height: 10,
          width: 15,
          borderRadius: '50%',
          transition: { duration: 0.3 }
        };
      default:
        return {
          height: 8,
          width: 30,
          borderRadius: '40%',
          transition: { duration: 0.3 }
        };
    }
  };

  // Floating animation for the whole avatar
  const floatAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Pulse animation for listening state
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Glow effect based on state
  const getGlowColor = () => {
    switch (expression) {
      case 'speaking': return 'rgba(102, 126, 234, 0.6)';
      case 'listening': return 'rgba(72, 187, 120, 0.6)';
      case 'thinking': return 'rgba(237, 137, 54, 0.6)';
      case 'happy': return 'rgba(72, 187, 120, 0.8)';
      case 'concerned': return 'rgba(245, 101, 101, 0.5)';
      case 'encouraging': return 'rgba(56, 178, 172, 0.7)';
      case 'impressed': return 'rgba(159, 122, 234, 0.8)';
      default: return 'rgba(102, 126, 234, 0.3)';
    }
  };

  return (
    <div className={`ai-avatar-wrapper size-${size}`} ref={containerRef}>
      {/* Background glow effect */}
      <motion.div 
        className="avatar-glow"
        animate={{
          boxShadow: `0 0 60px 30px ${getGlowColor()}`,
          scale: state === 'speaking' ? [1, 1.1, 1] : 1
        }}
        transition={{ duration: 0.5, repeat: state === 'speaking' ? Infinity : 0 }}
      />
      
      {/* Main avatar container */}
      <motion.div 
        className={`ai-avatar-container ${expression}`}
        animate={state === 'idle' ? floatAnimation : state === 'listening' ? pulseAnimation : {}}
      >
        {/* Avatar head/face */}
        <div className="avatar-head">
          {/* Animated background rings */}
          <div className="avatar-rings">
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className={`ring ring-${ring}`}
                animate={{
                  scale: state === 'speaking' ? [1, 1.2, 1] : 1,
                  opacity: state === 'speaking' ? [0.3, 0.1, 0.3] : 0.15
                }}
                transition={{
                  duration: 1.5,
                  delay: ring * 0.2,
                  repeat: Infinity
                }}
              />
            ))}
          </div>

          {/* Face container */}
          <div className="avatar-face">
            {/* Eyes */}
            <div className="eyes-container">
              <motion.div 
                className="eye left-eye"
                variants={eyeVariants}
                animate={expression === 'happy' ? 'happy' : expression === 'concerned' ? 'concerned' : expression === 'listening' ? 'listening' : 'idle'}
              >
                <motion.div 
                  className="pupil"
                  animate={{
                    x: expression === 'thinking' ? [0, 3, -3, 0] : 0,
                    y: expression === 'listening' ? -2 : 0
                  }}
                  transition={{ duration: 2, repeat: expression === 'thinking' ? Infinity : 0 }}
                />
                <div className="eye-shine" />
              </motion.div>
              
              <motion.div 
                className="eye right-eye"
                variants={eyeVariants}
                animate={expression === 'happy' ? 'happy' : expression === 'concerned' ? 'concerned' : expression === 'listening' ? 'listening' : 'idle'}
              >
                <motion.div 
                  className="pupil"
                  animate={{
                    x: expression === 'thinking' ? [0, 3, -3, 0] : 0,
                    y: expression === 'listening' ? -2 : 0
                  }}
                  transition={{ duration: 2, repeat: expression === 'thinking' ? Infinity : 0 }}
                />
                <div className="eye-shine" />
              </motion.div>
            </div>

            {/* Eyebrows */}
            <div className="eyebrows-container">
              <motion.div 
                className="eyebrow left-eyebrow"
                animate={{
                  rotate: expression === 'concerned' ? -10 : expression === 'happy' ? 5 : 0,
                  y: expression === 'listening' ? -3 : 0
                }}
              />
              <motion.div 
                className="eyebrow right-eyebrow"
                animate={{
                  rotate: expression === 'concerned' ? 10 : expression === 'happy' ? -5 : 0,
                  y: expression === 'listening' ? -3 : 0
                }}
              />
            </div>

            {/* Mouth */}
            <motion.div 
              className="mouth"
              animate={getMouthVariant()}
            />

            {/* Speaking indicator waves */}
            <AnimatePresence>
              {state === 'speaking' && (
                <motion.div 
                  className="speaking-waves"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {waveBars.map((bar) => (
                    <motion.div
                      key={bar.id}
                      className="wave-bar"
                      animate={{
                        height: [4, bar.height * (0.5 + audioLevel), 4],
                        backgroundColor: ['#667eea', '#764ba2', '#667eea']
                      }}
                      transition={{
                        duration: 0.4,
                        delay: bar.delay,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Thinking dots */}
            <AnimatePresence>
              {state === 'thinking' && (
                <motion.div 
                  className="thinking-dots"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      className="thinking-dot"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{
                        duration: 0.6,
                        delay: dot * 0.15,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Listening indicator */}
            <AnimatePresence>
              {state === 'listening' && (
                <motion.div 
                  className="listening-indicator"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div 
                    className="listening-circle"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.8, 0.3, 0.8]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="listening-icon">👂</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status label */}
        <motion.div 
          className={`avatar-status status-${expression}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          key={expression}
        >
          {expression === 'speaking' && '🔊 Speaking...'}
          {expression === 'listening' && '👂 Listening...'}
          {expression === 'thinking' && '🤔 Thinking...'}
          {expression === 'happy' && '😊 Great answer!'}
          {expression === 'concerned' && '💭 Let\'s improve'}
          {expression === 'encouraging' && '💪 You\'ve got this!'}
          {expression === 'impressed' && '🌟 Impressive!'}
          {expression === 'idle' && '🤖 AI Interviewer'}
        </motion.div>

        {/* Video Mode Feedback Message */}
        <AnimatePresence>
          {videoMode && showFeedback && feedbackMessage && (
            <motion.div 
              className="video-feedback-message"
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
            >
              {feedbackMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Audio level indicator (when listening) */}
      {state === 'listening' && audioLevel > 0 && (
        <div className="audio-level-ring">
          <svg viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#audioGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.min(audioLevel * 1.5, 1) }}
              transition={{ duration: 0.1 }}
            />
            <defs>
              <linearGradient id="audioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#48bb78" />
                <stop offset="100%" stopColor="#38a169" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
};

export default AIAvatar;
