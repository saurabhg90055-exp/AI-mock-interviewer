import { useRef, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIAvatar.css';

/**
 * AI Interviewer Avatar Component - Futuristic AI Design
 * Features a sleek, robotic AI assistant appearance
 * Responds to different states: idle, speaking, listening, thinking
 * Modern sci-fi inspired design with holographic effects
 */
const AIAvatar = ({ 
  state = 'idle', // 'idle' | 'speaking' | 'listening' | 'thinking' | 'happy' | 'concerned' | 'encouraging' | 'impressed' | 'nodding' | 'curious'
  audioLevel = 0,
  score = null,
  size = 'large', // 'small' | 'medium' | 'large'
  userExpression = null, // For video mode: { confidence, eyeContact, emotion, engagement }
  videoMode = false,
  showFeedback = false,
  interviewerName = 'ARIA' // AI Responsive Interview Assistant
}) => {
  const containerRef = useRef(null);
  const [adaptiveState, setAdaptiveState] = useState(state);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [pulsePhase, setPulsePhase] = useState(0);
  const [dataStreamActive, setDataStreamActive] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(1);
  
  // Core energy pulse animation
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(pulseInterval);
  }, []);
  
  // Data stream effect when processing
  useEffect(() => {
    if (state === 'thinking' || state === 'speaking') {
      setDataStreamActive(true);
    } else {
      const timeout = setTimeout(() => setDataStreamActive(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [state]);
  
  // Energy fluctuation for life-like effect
  useEffect(() => {
    const energyInterval = setInterval(() => {
      setEnergyLevel(0.85 + Math.random() * 0.3);
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(energyInterval);
  }, []);
  
  // Adapt avatar state based on user expression in video mode
  useEffect(() => {
    if (!videoMode || !userExpression) {
      setAdaptiveState(state);
      return;
    }
    
    const { confidence, eyeContact, emotion, engagement } = userExpression;
    
    if (state === 'listening' || state === 'idle') {
      if (confidence < 40) {
        setAdaptiveState('encouraging');
        setFeedbackMessage('Analysis: Increase confidence. You\'re performing well.');
      } else if (confidence > 80 && engagement > 70) {
        setAdaptiveState('impressed');
        setFeedbackMessage('Excellent metrics detected!');
      } else if (emotion === 'nervous') {
        setAdaptiveState('encouraging');
        setFeedbackMessage('Calibrating support mode...');
      } else if (eyeContact < 30) {
        setFeedbackMessage('Eye contact optimization suggested');
        setAdaptiveState('curious');
      } else if (engagement > 60) {
        setAdaptiveState('nodding');
        setFeedbackMessage('');
      } else {
        setAdaptiveState('confident');
        setFeedbackMessage('');
      }
    } else {
      setAdaptiveState(state);
    }
  }, [state, userExpression, videoMode]);
  
  // Generate data stream particles
  const dataParticles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: i * 0.1,
      duration: 1 + Math.random() * 2,
      x: -50 + Math.random() * 100,
      size: 2 + Math.random() * 4
    })), []
  );

  // Generate circuit paths
  const circuitPaths = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: i * 45,
      length: 30 + Math.random() * 20
    })), []
  );

  // Determine avatar expression based on state and score
  const getExpression = () => {
    if (adaptiveState === 'encouraging') return 'encouraging';
    if (adaptiveState === 'impressed') return 'impressed';
    if (adaptiveState === 'nodding') return 'nodding';
    if (adaptiveState === 'curious') return 'curious';
    if (adaptiveState === 'happy' || (score && score >= 8)) return 'happy';
    if (adaptiveState === 'concerned' || adaptiveState === 'thoughtful' || (score && score < 5)) return 'thoughtful';
    if (adaptiveState === 'thinking') return 'thinking';
    if (adaptiveState === 'listening') return 'listening';
    if (adaptiveState === 'speaking') return 'speaking';
    return 'confident';
  };

  const expression = getExpression();

  // Get core color based on state
  const getCoreColor = () => {
    switch (expression) {
      case 'speaking': return '#00d4ff';
      case 'listening': return '#00ff88';
      case 'thinking': return '#ffa500';
      case 'happy': return '#00ff88';
      case 'encouraging': return '#00ffcc';
      case 'impressed': return '#a855f7';
      case 'curious': return '#ffcc00';
      case 'thoughtful': return '#60a5fa';
      default: return '#667eea';
    }
  };

  // Get secondary accent color
  const getAccentColor = () => {
    switch (expression) {
      case 'speaking': return '#0099cc';
      case 'listening': return '#00cc66';
      case 'thinking': return '#cc8800';
      case 'happy': return '#00cc66';
      case 'encouraging': return '#00ccaa';
      case 'impressed': return '#8b5cf6';
      case 'curious': return '#ccaa00';
      case 'thoughtful': return '#3b82f6';
      default: return '#4f46e5';
    }
  };

  const coreColor = getCoreColor();
  const accentColor = getAccentColor();

  return (
    <div className={`ai-avatar-wrapper size-${size}`} ref={containerRef}>
      {/* Outer holographic rings */}
      <div className="holographic-rings">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className={`holo-ring ring-${ring}`}
            animate={{
              rotate: ring % 2 === 0 ? 360 : -360,
              scale: state === 'speaking' ? [1, 1.1, 1] : energyLevel,
              opacity: state === 'speaking' ? [0.6, 0.3, 0.6] : 0.4
            }}
            transition={{
              rotate: { duration: 10 + ring * 5, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: state === 'speaking' ? Infinity : 0 },
              opacity: { duration: 1.5, repeat: state === 'speaking' ? Infinity : 0 }
            }}
            style={{ borderColor: coreColor }}
          />
        ))}
      </div>

      {/* Background glow effect */}
      <motion.div 
        className="avatar-glow"
        animate={{
          boxShadow: `0 0 80px 40px ${coreColor}40`,
          scale: energyLevel
        }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Data stream particles */}
      <AnimatePresence>
        {dataStreamActive && (
          <div className="data-stream">
            {dataParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="data-particle"
                initial={{ y: 100, x: particle.x, opacity: 0 }}
                animate={{ 
                  y: -100, 
                  opacity: [0, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity
                }}
                style={{ 
                  width: particle.size, 
                  height: particle.size,
                  backgroundColor: coreColor 
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main AI Core */}
      <motion.div 
        className={`ai-core-container ${expression}`}
        animate={{
          scale: state === 'listening' ? [1, 1.02, 1] : energyLevel
        }}
        transition={{
          duration: 1.5,
          repeat: state === 'listening' ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Hexagonal frame */}
        <div className="hex-frame">
          <svg viewBox="0 0 100 100" className="hex-svg">
            <defs>
              <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={coreColor} stopOpacity="0.8"/>
                <stop offset="50%" stopColor={accentColor} stopOpacity="0.4"/>
                <stop offset="100%" stopColor={coreColor} stopOpacity="0.8"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <motion.polygon 
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              fill="none"
              stroke="url(#hexGradient)"
              strokeWidth="2"
              filter="url(#glow)"
              animate={{
                strokeDasharray: state === 'speaking' ? ['0 300', '300 0'] : '300 0',
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                strokeDasharray: { duration: 2, repeat: Infinity },
                opacity: { duration: 2, repeat: Infinity }
              }}
            />
          </svg>
        </div>

        {/* Inner core orb */}
        <motion.div 
          className="ai-orb"
          animate={{
            scale: state === 'speaking' ? [1, 1.1, 1] : energyLevel,
            boxShadow: `0 0 ${state === 'speaking' ? 60 : 40}px ${coreColor}80, inset 0 0 30px ${coreColor}40`
          }}
          transition={{
            scale: { duration: 0.5, repeat: state === 'speaking' ? Infinity : 0 },
            boxShadow: { duration: 0.3 }
          }}
          style={{ 
            background: `radial-gradient(circle at 30% 30%, ${coreColor}60, ${accentColor}40, #1a1a2e)`
          }}
        >
          {/* Core eye/sensor */}
          <div className="sensor-array">
            {/* Main sensor */}
            <motion.div 
              className="main-sensor"
              animate={{
                scale: expression === 'listening' ? [1, 1.2, 1] : 1,
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
              style={{ backgroundColor: coreColor }}
            />
            
            {/* Scanning line */}
            <motion.div 
              className="scan-line"
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundColor: coreColor }}
            />

            {/* Circuit patterns */}
            <div className="circuit-pattern">
              {circuitPaths.map((path) => (
                <motion.div
                  key={path.id}
                  className="circuit-line"
                  style={{
                    transform: `rotate(${path.angle}deg)`,
                    width: path.length
                  }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scaleX: state === 'thinking' ? [1, 1.2, 1] : 1
                  }}
                  transition={{
                    duration: 1 + path.id * 0.2,
                    repeat: Infinity,
                    delay: path.id * 0.1
                  }}
                />
              ))}
            </div>
          </div>

          {/* Expression indicator lights */}
          <div className="expression-lights">
            <motion.div 
              className="light left-light"
              animate={{
                backgroundColor: expression === 'happy' || expression === 'impressed' ? '#00ff88' : coreColor,
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className="light center-light"
              animate={{
                backgroundColor: coreColor,
                scale: state === 'speaking' ? [1, 1.4, 1] : [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <motion.div 
              className="light right-light"
              animate={{
                backgroundColor: expression === 'happy' || expression === 'impressed' ? '#00ff88' : coreColor,
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Waveform display for speaking */}
        <AnimatePresence>
          {state === 'speaking' && (
            <motion.div 
              className="waveform-display"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="wave-bar"
                  animate={{
                    height: [4, 20 + audioLevel * 30 + Math.random() * 15, 4],
                    backgroundColor: [coreColor, accentColor, coreColor]
                  }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.05,
                    repeat: Infinity
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking process indicator */}
        <AnimatePresence>
          {state === 'thinking' && (
            <motion.div 
              className="thinking-process"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="process-ring">
                <motion.svg viewBox="0 0 100 100">
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={coreColor}
                    strokeWidth="2"
                    strokeDasharray="20 10"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: '50px 50px' }}
                  />
                </motion.svg>
              </div>
              <div className="process-dots">
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    className="process-dot"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 0.8,
                      delay: dot * 0.2,
                      repeat: Infinity
                    }}
                    style={{ backgroundColor: coreColor }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listening pulse rings */}
        <AnimatePresence>
          {state === 'listening' && (
            <motion.div 
              className="listening-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="pulse-ring"
                  animate={{
                    scale: [1, 2, 2.5],
                    opacity: [0.6, 0.2, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: ring * 0.4,
                    repeat: Infinity
                  }}
                  style={{ borderColor: coreColor }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status display */}
      <motion.div 
        className={`ai-status status-${expression}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        key={expression}
      >
        <span className="status-indicator" style={{ backgroundColor: coreColor }} />
        <span className="status-text">
          {expression === 'speaking' && '◈ TRANSMITTING'}
          {expression === 'listening' && '◈ RECEIVING'}
          {expression === 'thinking' && '◈ PROCESSING'}
          {expression === 'happy' && '◈ OPTIMAL'}
          {expression === 'thoughtful' && '◈ ANALYZING'}
          {expression === 'encouraging' && '◈ SUPPORT MODE'}
          {expression === 'impressed' && '◈ EXCELLENT'}
          {expression === 'nodding' && '◈ ACKNOWLEDGED'}
          {expression === 'curious' && '◈ QUERY MODE'}
          {expression === 'confident' && `◈ ${interviewerName}`}
        </span>
      </motion.div>

      {/* Video Mode Feedback */}
      <AnimatePresence>
        {videoMode && showFeedback && feedbackMessage && (
          <motion.div 
            className="ai-feedback-message"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            style={{ borderColor: coreColor }}
          >
            <span className="feedback-icon">⬡</span>
            {feedbackMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio level visualization */}
      {state === 'listening' && audioLevel > 0 && (
        <div className="audio-level-display">
          <svg viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={coreColor}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.min(audioLevel * 1.5, 1) }}
              transition={{ duration: 0.1 }}
              style={{ filter: `drop-shadow(0 0 4px ${coreColor})` }}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default AIAvatar;
