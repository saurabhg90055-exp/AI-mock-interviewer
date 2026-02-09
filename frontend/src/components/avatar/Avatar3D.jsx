import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Html, PresentationControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import './Avatar3D.css';

/**
 * 3D Avatar Model Component - ReadyPlayerMe Style
 * Displays avatar with face zoom and natural lip sync animations
 */
function AvatarModel({ 
  state = 'idle', 
  audioLevel = 0, 
  expression = 'neutral',
  isSpeaking = false,
  gender = 'male'
}) {
  const group = useRef();
  
  // Select model based on gender
  const modelPath = gender === 'female' 
    ? '/models/avatar/interviewer-female.glb' 
    : '/models/avatar/interviewer.glb';
  
  const { scene } = useGLTF(modelPath);
  const mouthOpenRef = useRef(0);
  const lastBlinkTime = useRef(0);
  const smoothedAudioLevel = useRef(0);
  
  // Clone the scene for safe manipulation
  const clonedScene = useMemo(() => {
    console.log('Loading GLB scene:', scene);
    const clone = scene.clone(true);
    
    // Debug: Calculate bounding box to understand model dimensions
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log('Model dimensions:', { 
      size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
      center: { x: center.x.toFixed(2), y: center.y.toFixed(2), z: center.z.toFixed(2) }
    });
    
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.envMapIntensity = 1.0;
        }
      }
    });
    return clone;
  }, [scene]);

  // Find head bone and all morph targets
  const { headBone, neckBone, morphMeshes, availableMorphs } = useMemo(() => {
    let head = null;
    let neck = null;
    const morphs = [];
    const allMorphNames = new Set();
    
    clonedScene.traverse((child) => {
      // Find bones for head movement
      if (child.isBone) {
        const name = child.name.toLowerCase();
        if (name.includes('head') && !head) head = child;
        if (name.includes('neck') && !neck) neck = child;
      }
      
      // Collect all meshes with morph targets (face, teeth, etc.)
      if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
        morphs.push({
          mesh: child,
          dict: child.morphTargetDictionary,
          influences: child.morphTargetInfluences
        });
        // Log available morphs for debugging
        Object.keys(child.morphTargetDictionary).forEach(name => allMorphNames.add(name));
      }
    });
    
    // Debug: Log available morph targets (only once)
    if (allMorphNames.size > 0) {
      console.log('Available morph targets:', Array.from(allMorphNames).sort());
    }
    
    return { headBone: head, neckBone: neck, morphMeshes: morphs, availableMorphs: allMorphNames };
  }, [clonedScene]);

  // Animation loop
  useFrame((frameState, delta) => {
    const time = frameState.clock.elapsedTime;
    
    // Smooth the audio level for natural lip movement
    // When speaking, use actual audioLevel or generate simulated audio for lip sync
    let effectiveAudioLevel = audioLevel;
    if (isSpeaking) {
      // Generate simulated audio variation if no real audio level provided
      const simulatedAudio = 0.4 + Math.sin(time * 8) * 0.2 + Math.sin(time * 13) * 0.15 + Math.sin(time * 21) * 0.1;
      effectiveAudioLevel = Math.max(audioLevel, simulatedAudio);
    }
    
    const targetAudio = isSpeaking ? Math.max(effectiveAudioLevel, 0.35) : 0;
    smoothedAudioLevel.current = THREE.MathUtils.lerp(
      smoothedAudioLevel.current, 
      targetAudio, 
      isSpeaking ? 0.5 : 0.2
    );
    
    // Subtle breathing animation
    if (group.current) {
      group.current.position.y = Math.sin(time * 1.2) * 0.003;
    }
    
    // Head movement based on state
    if (headBone) {
      let targetRotX = 0;
      let targetRotY = 0;
      let targetRotZ = 0;
      
      if (state === 'listening') {
        // Attentive listening - subtle nods
        targetRotX = Math.sin(time * 0.8) * 0.04;
        targetRotY = Math.sin(time * 0.5) * 0.06;
      } else if (state === 'thinking') {
        // Thinking - look slightly up and to the side
        targetRotX = -0.08 + Math.sin(time * 0.3) * 0.02;
        targetRotY = 0.12 + Math.sin(time * 0.4) * 0.03;
      } else if (isSpeaking || state === 'speaking') {
        // Speaking - natural micro-movements synced with audio
        const audioInfluence = smoothedAudioLevel.current * 0.3;
        targetRotX = Math.sin(time * 2.5) * 0.02 * (1 + audioInfluence);
        targetRotY = Math.sin(time * 1.8) * 0.025 + Math.sin(time * 4) * 0.01 * audioInfluence;
        targetRotZ = Math.sin(time * 3) * 0.008 * audioInfluence;
      } else {
        // Idle - very subtle micro movements
        targetRotX = Math.sin(time * 0.4) * 0.015;
        targetRotY = Math.sin(time * 0.25) * 0.02;
      }
      
      // Smooth head rotation
      headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, targetRotX, 0.1);
      headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, targetRotY, 0.1);
      headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, targetRotZ, 0.1);
    }
    
    // ============ LIP SYNC ANIMATION ============
    // Calculate mouth open amount with variation for natural speech
    // Check both isSpeaking prop and state === 'speaking' for robustness
    const shouldAnimate = isSpeaking || state === 'speaking';
    let mouthTarget = 0;
    if (shouldAnimate) {
      // Increased base open and multipliers for more visible mouth movement
      const baseOpen = 0.5 + smoothedAudioLevel.current * 0.6;
      // Add phoneme-like variation for realistic speech
      const variation1 = Math.sin(time * 12) * 0.25;
      const variation2 = Math.sin(time * 20) * 0.15;
      const variation3 = Math.sin(time * 7) * 0.1;
      mouthTarget = Math.max(0.15, Math.min(1, baseOpen + variation1 + variation2 + variation3));
    }
    
    // Smooth mouth movement - slightly faster response
    mouthOpenRef.current = THREE.MathUtils.lerp(mouthOpenRef.current, mouthTarget, 0.4);
    const mouthOpen = mouthOpenRef.current;
    
    // ============ APPLY MORPH TARGETS ============
    morphMeshes.forEach(({ mesh, dict, influences }) => {
      // --- JAW / MOUTH OPEN ---
      // Try various common morph target names for mouth open
      const mouthOpenTargets = [
        'jawOpen', 'mouthOpen', 'viseme_aa', 'viseme_O', 'viseme_U',
        'jawForward', 'mouthFunnel', 'mouthPucker'
      ];
      
      mouthOpenTargets.forEach(target => {
        if (target in dict) {
          // Increased weights for more visible mouth movement
          let weight = mouthOpen;
          if (target === 'jawOpen') {
            weight = mouthOpen * 1.2; // Jaw opens wider
          } else if (target === 'mouthOpen') {
            weight = mouthOpen * 1.0;
          } else if (target === 'viseme_aa') {
            weight = mouthOpen * 1.1; // Wide open for 'aa' sound
          } else if (target === 'viseme_O' || target === 'mouthFunnel') {
            weight = mouthOpen * 0.8 * (1 + Math.sin(time * 18) * 0.3);
          } else if (target === 'viseme_U' || target === 'mouthPucker') {
            weight = mouthOpen * 0.6 * (1 + Math.sin(time * 22) * 0.3);
          }
          influences[dict[target]] = Math.min(1, weight);
        }
      });
      
      // --- SMILE ---
      const smileAmount = expression === 'happy' ? 0.5 : 
                          expression === 'encouraging' ? 0.35 : 
                          expression === 'impressed' ? 0.4 : 0.12;
      
      ['mouthSmile', 'mouthSmileLeft', 'mouthSmileRight'].forEach(target => {
        if (target in dict) {
          influences[dict[target]] = THREE.MathUtils.lerp(
            influences[dict[target]] || 0, 
            smileAmount, 
            0.1
          );
        }
      });
      
      // --- NATURAL BLINKING ---
      const blinkInterval = 3.5 + Math.sin(time * 0.1) * 1; // Variable blink rate
      const timeSinceLastBlink = time - lastBlinkTime.current;
      
      let blinkValue = 0;
      if (timeSinceLastBlink > blinkInterval) {
        lastBlinkTime.current = time;
      } else if (timeSinceLastBlink < 0.12) {
        // Blink animation - quick close and open
        blinkValue = Math.sin(timeSinceLastBlink / 0.12 * Math.PI);
      }
      
      ['eyeBlinkLeft', 'eyeBlinkRight', 'eyesClosed'].forEach(target => {
        if (target in dict) {
          influences[dict[target]] = blinkValue;
        }
      });
      
      // --- EYEBROW EXPRESSIONS ---
      if (state === 'thinking') {
        if ('browInnerUp' in dict) influences[dict['browInnerUp']] = 0.35;
        if ('browOuterUpLeft' in dict) influences[dict['browOuterUpLeft']] = 0.2;
        if ('browOuterUpRight' in dict) influences[dict['browOuterUpRight']] = 0.2;
      } else if (expression === 'happy' || expression === 'impressed') {
        if ('browInnerUp' in dict) influences[dict['browInnerUp']] = 0.15;
      } else {
        // Reset eyebrows
        ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight', 'browDownLeft', 'browDownRight'].forEach(target => {
          if (target in dict) {
            influences[dict[target]] = THREE.MathUtils.lerp(influences[dict[target]] || 0, 0, 0.1);
          }
        });
      }
      
      // --- CHEEK / ADDITIONAL EXPRESSIONS ---
      if (isSpeaking) {
        if ('cheekPuff' in dict) {
          influences[dict['cheekPuff']] = mouthOpen * 0.1 * (1 + Math.sin(time * 10) * 0.5);
        }
        if ('cheekSquintLeft' in dict) influences[dict['cheekSquintLeft']] = smileAmount * 0.3;
        if ('cheekSquintRight' in dict) influences[dict['cheekSquintRight']] = smileAmount * 0.3;
      }
    });
  });

  return (
    <group ref={group} dispose={null}>
      {/* 
        ReadyPlayerMe avatars have head at approximately Y=1.5-1.7 in local coords
        Camera is positioned at Y=1.6 (head height) and Z=0.8 (close to face)
        Model at origin shows face directly to camera
      */}
      <primitive 
        object={clonedScene} 
        scale={1.0}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
}

/**
 * Camera controller to focus on face
 * Fixed position optimized for the avatar model
 */
function CameraController() {
  const { camera } = useThree();
  const initialized = useRef(false);
  
  useFrame(() => {
    if (!initialized.current) {
      // Fixed camera position for face close-up
      camera.position.set(-0.01, 1.68, 0.51);
      camera.lookAt(0, 1.65, 0);
      camera.fov = 45;
      camera.updateProjectionMatrix();
      
      initialized.current = true;
    }
  });
  
  return null;
}

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <Html center>
      <div className="avatar-loading">
        <div className="loading-spinner"></div>
        <p>Loading Avatar...</p>
      </div>
    </Html>
  );
}

/**
 * Status indicator overlay
 */
function StatusOverlay({ state, expression, interviewerName }) {
  const getStatusInfo = () => {
    switch (state) {
      case 'speaking':
        return { icon: '🎙️', text: 'TRANSMITTING', color: '#00d4ff' };
      case 'listening':
        return { icon: '👂', text: 'RECEIVING', color: '#00ff88' };
      case 'thinking':
        return { icon: '💭', text: 'PROCESSING', color: '#ffa500' };
      case 'happy':
        return { icon: '✨', text: 'OPTIMAL', color: '#00ff88' };
      case 'impressed':
        return { icon: '⭐', text: 'EXCELLENT', color: '#a855f7' };
      default:
        return { icon: '◈', text: interviewerName, color: '#667eea' };
    }
  };

  const status = getStatusInfo();

  return (
    <motion.div 
      className={`avatar3d-status status-${state}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={state}
    >
      <span className="status-indicator" style={{ backgroundColor: status.color }} />
      <span className="status-text">{status.icon} {status.text}</span>
    </motion.div>
  );
}

/**
 * Main Avatar3D Component
 */
const Avatar3D = ({ 
  state = 'idle',
  audioLevel = 0,
  score = null,
  size = 'large',
  userExpression = null,
  videoMode = false,
  showFeedback = false,
  interviewerName = 'ARIA',
  isSpeaking = false,
  gender = 'male'
}) => {
  const containerRef = useRef(null);
  const [adaptiveState, setAdaptiveState] = useState(state);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine expression based on state and score
  const getExpression = () => {
    if (adaptiveState === 'happy' || (score && score >= 8)) return 'happy';
    if (adaptiveState === 'thinking') return 'thinking';
    if (adaptiveState === 'listening') return 'listening';
    if (adaptiveState === 'speaking') return 'speaking';
    return 'neutral';
  };

  // Adapt state based on user expression in video mode
  useEffect(() => {
    if (!videoMode || !userExpression) {
      setAdaptiveState(state);
      return;
    }
    
    const { confidence, eyeContact, emotion, engagement } = userExpression;
    
    if (state === 'listening' || state === 'idle') {
      if (confidence < 40) {
        setAdaptiveState('encouraging');
        setFeedbackMessage('You\'re doing great! Keep going.');
      } else if (confidence > 80 && engagement > 70) {
        setAdaptiveState('impressed');
        setFeedbackMessage('Excellent performance!');
      } else if (engagement > 60) {
        setAdaptiveState('nodding');
        setFeedbackMessage('');
      } else {
        setAdaptiveState(state);
        setFeedbackMessage('');
      }
    } else {
      setAdaptiveState(state);
    }
  }, [state, userExpression, videoMode]);

  // Get glow color based on state
  const getGlowColor = () => {
    switch (adaptiveState) {
      case 'speaking': return '#00d4ff';
      case 'listening': return '#00ff88';
      case 'thinking': return '#ffa500';
      case 'happy': case 'impressed': return '#a855f7';
      default: return '#667eea';
    }
  };

  const expression = getExpression();
  const glowColor = getGlowColor();

  return (
    <div className={`avatar3d-wrapper size-${size}`} ref={containerRef}>
      {/* Holographic rings */}
      <div className="holo-rings">
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className={`holo-ring ring-${ring}`}
            animate={{
              rotate: ring % 2 === 0 ? 360 : -360,
              scale: state === 'speaking' ? [1, 1.1, 1] : 1,
            }}
            transition={{
              rotate: { duration: 10 + ring * 5, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: state === 'speaking' ? Infinity : 0 }
            }}
            style={{ borderColor: glowColor }}
          />
        ))}
      </div>

      {/* Glow effect */}
      <motion.div 
        className="avatar3d-glow"
        animate={{
          boxShadow: `0 0 60px 30px ${glowColor}40`,
        }}
        transition={{ duration: 0.5 }}
      />

      {/* 3D Canvas */}
      <div className="avatar3d-canvas-container">
        <Canvas
          camera={{ 
            position: [0, 1.5, 1], // Will be adjusted by CameraController
            fov: 40,
            near: 0.01,
            far: 100
          }}
          shadows
          dpr={[1, 2]}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            setIsLoaded(true);
          }}
        >
          {/* Soft ambient light for overall illumination */}
          <ambientLight intensity={0.7} />
          
          {/* Key light - main face illumination from front-right */}
          <spotLight 
            position={[2, 2, 3]} 
            angle={0.5} 
            penumbra={1} 
            intensity={1.8}
            castShadow
            color="#ffffff"
          />
          
          {/* Fill light - soften shadows from left */}
          <spotLight 
            position={[-2, 1.5, 2]} 
            angle={0.6} 
            penumbra={1} 
            intensity={0.9}
            color="#e8f4ff"
          />
          
          {/* Top light for hair/head definition */}
          <pointLight position={[0, 3, 1]} intensity={0.5} color="#ffffff" />
          
          {/* Rim/Back light for depth separation */}
          <pointLight position={[-1, 1.5, -2]} intensity={0.4} color="#ffeedd" />
          
          {/* Colored accent light based on state - subtle */}
          <pointLight position={[0, 1.6, 1]} intensity={0.25} color={glowColor} />
          
          <Suspense fallback={<LoadingFallback />}>
            <CameraController />
            <AvatarModel 
              state={adaptiveState}
              audioLevel={audioLevel}
              expression={expression}
              isSpeaking={isSpeaking || state === 'speaking'}
              gender={gender}
            />
            <Environment preset="apartment" background={false} />
          </Suspense>
        </Canvas>
      </div>

      {/* Waveform for speaking state */}
      <AnimatePresence>
        {state === 'speaking' && (
          <motion.div 
            className="avatar3d-waveform"
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
                }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                  repeat: Infinity
                }}
                style={{ backgroundColor: glowColor }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thinking indicator */}
      <AnimatePresence>
        {state === 'thinking' && (
          <motion.div 
            className="avatar3d-thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="thinking-dots">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="thinking-dot"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 0.8,
                    delay: dot * 0.2,
                    repeat: Infinity
                  }}
                  style={{ backgroundColor: glowColor }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening pulse */}
      <AnimatePresence>
        {state === 'listening' && (
          <motion.div className="avatar3d-listening">
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
                style={{ borderColor: glowColor }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status display */}
      <StatusOverlay 
        state={adaptiveState} 
        expression={expression}
        interviewerName={interviewerName}
      />

      {/* Video Mode Feedback */}
      <AnimatePresence>
        {videoMode && showFeedback && feedbackMessage && (
          <motion.div 
            className="avatar3d-feedback"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            style={{ borderColor: glowColor }}
          >
            <span className="feedback-icon">⬡</span>
            {feedbackMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio level indicator */}
      {state === 'listening' && audioLevel > 0 && (
        <div className="avatar3d-audio-level">
          <svg viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={glowColor}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.min(audioLevel * 1.5, 1) }}
              transition={{ duration: 0.1 }}
              style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// Preload both male and female models
useGLTF.preload('/models/avatar/interviewer.glb');
useGLTF.preload('/models/avatar/interviewer-female.glb');

export default Avatar3D;
