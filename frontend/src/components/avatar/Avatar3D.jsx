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
  
  // Select model based on gender with cache-busting
  const modelPath = gender === 'female' 
    ? '/models/avatar/interviewer-female.glb?v=2' 
    : '/models/avatar/interviewer-male.glb?v=2';
  
  console.log('[AvatarModel] Rendering with gender:', gender, 'modelPath:', modelPath);
  
  const { scene } = useGLTF(modelPath);
  
  // Debug: Log when scene changes
  useEffect(() => {
    console.log('[AvatarModel] Scene loaded/changed:', { 
      gender, 
      modelPath, 
      sceneUuid: scene?.uuid,
      sceneName: scene?.name,
      childrenCount: scene?.children?.length 
    });
  }, [scene, gender, modelPath]);
  
  const mouthOpenRef = useRef(0);
  const lastBlinkTime = useRef(0);
  const smoothedAudioLevel = useRef(0);
  
  // Lip sync state refs
  const currentVisemeRef = useRef(0);
  const visemeBlendRef = useRef({});
  const lastVisemeChange = useRef(0);
  
  /**
   * VISEME DEFINITIONS - Standard ARKit/ReadyPlayerMe visemes
   * Each viseme has morph target weights for realistic mouth shapes
   */
  const VISEMES = {
    sil: { // Silence - mouth closed
      jawOpen: 0, mouthOpen: 0, viseme_sil: 1,
      mouthPucker: 0, mouthFunnel: 0
    },
    PP: { // P, B, M - lips pressed
      jawOpen: 0, mouthOpen: 0, viseme_PP: 1,
      mouthPucker: 0.6, mouthFunnel: 0, mouthPress: 0.8
    },
    FF: { // F, V - lower lip to teeth
      jawOpen: 0.15, mouthOpen: 0.1, viseme_FF: 1,
      mouthFunnel: 0.4, mouthLowerDownLeft: 0.3, mouthLowerDownRight: 0.3
    },
    TH: { // TH sounds - tongue to teeth
      jawOpen: 0.2, mouthOpen: 0.15, viseme_TH: 1,
      mouthFunnel: 0.2
    },
    DD: { // D, T, N - tongue to ridge
      jawOpen: 0.25, mouthOpen: 0.2, viseme_DD: 1,
      mouthStretchLeft: 0.2, mouthStretchRight: 0.2
    },
    kk: { // K, G - back of tongue
      jawOpen: 0.3, mouthOpen: 0.25, viseme_kk: 1,
      mouthStretchLeft: 0.15, mouthStretchRight: 0.15
    },
    CH: { // CH, J, SH - fricatives
      jawOpen: 0.25, mouthOpen: 0.2, viseme_CH: 1,
      mouthFunnel: 0.5, mouthPucker: 0.3
    },
    SS: { // S, Z - sibilants
      jawOpen: 0.2, mouthOpen: 0.15, viseme_SS: 1,
      mouthStretchLeft: 0.25, mouthStretchRight: 0.25
    },
    nn: { // N - nasal
      jawOpen: 0.2, mouthOpen: 0.1, viseme_nn: 1,
      mouthClose: 0.4
    },
    RR: { // R - retroflex
      jawOpen: 0.25, mouthOpen: 0.2, viseme_RR: 1,
      mouthFunnel: 0.3, mouthPucker: 0.2
    },
    aa: { // A as in "father" - wide open
      jawOpen: 0.7, mouthOpen: 0.65, viseme_aa: 1,
      mouthStretchLeft: 0.3, mouthStretchRight: 0.3
    },
    E: { // E as in "bed" - mid open
      jawOpen: 0.45, mouthOpen: 0.4, viseme_E: 1,
      mouthStretchLeft: 0.4, mouthStretchRight: 0.4, mouthSmile: 0.2
    },
    I: { // I as in "bee" - smile shape
      jawOpen: 0.3, mouthOpen: 0.25, viseme_I: 1,
      mouthSmileLeft: 0.5, mouthSmileRight: 0.5, mouthStretchLeft: 0.3, mouthStretchRight: 0.3
    },
    O: { // O as in "go" - rounded
      jawOpen: 0.45, mouthOpen: 0.4, viseme_O: 1,
      mouthFunnel: 0.6, mouthPucker: 0.4
    },
    U: { // U as in "you" - pursed
      jawOpen: 0.3, mouthOpen: 0.25, viseme_U: 1,
      mouthPucker: 0.7, mouthFunnel: 0.5
    }
  };
  
  // Viseme sequence for natural speech patterns
  const SPEECH_PATTERNS = [
    ['sil', 'aa', 'E', 'sil'],
    ['PP', 'aa', 'DD', 'E', 'sil'],
    ['SS', 'E', 'nn', 'DD', 'aa'],
    ['kk', 'O', 'nn', 'FF', 'E'],
    ['TH', 'E', 'aa', 'RR', 'E'],
    ['CH', 'aa', 'nn', 'SS', 'sil'],
    ['I', 'nn', 'DD', 'E', 'E', 'DD'],
    ['O', 'kk', 'aa', 'SS', 'E']
  ];
  
  const speechPatternRef = useRef(0);
  const patternIndexRef = useRef(0);
  
  // Clone the scene for safe manipulation - depend on scene, gender, and modelPath
  const clonedScene = useMemo(() => {
    console.log('[AvatarModel] Creating clonedScene for gender:', gender, 'modelPath:', modelPath);
    console.log('[AvatarModel] Scene object:', scene, 'Scene uuid:', scene?.uuid);
    const clone = scene.clone(true);
    
    // Debug: Calculate bounding box to understand model dimensions
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log('[AvatarModel] Model dimensions:', { 
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
  }, [scene, gender, modelPath]);

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
    
    // ============ ADVANCED LIP SYNC WITH VISEMES ============
    const shouldAnimate = isSpeaking || state === 'speaking';
    
    // Determine current viseme based on audio and timing
    if (shouldAnimate) {
      const visemeSpeed = 8 + smoothedAudioLevel.current * 6; // Faster when louder
      const timeSinceChange = time - lastVisemeChange.current;
      
      // Change viseme based on audio rhythm
      if (timeSinceChange > (1 / visemeSpeed)) {
        lastVisemeChange.current = time;
        
        // Get current speech pattern
        const pattern = SPEECH_PATTERNS[speechPatternRef.current % SPEECH_PATTERNS.length];
        patternIndexRef.current = (patternIndexRef.current + 1) % pattern.length;
        
        // Move to next pattern when we complete current one
        if (patternIndexRef.current === 0) {
          speechPatternRef.current = (speechPatternRef.current + 1) % SPEECH_PATTERNS.length;
        }
        
        currentVisemeRef.current = pattern[patternIndexRef.current];
      }
    } else {
      currentVisemeRef.current = 'sil';
      patternIndexRef.current = 0;
    }
    
    // Get target viseme weights
    const targetViseme = VISEMES[currentVisemeRef.current] || VISEMES.sil;
    const intensity = shouldAnimate ? (0.6 + smoothedAudioLevel.current * 0.5) : 0;
    
    // Smooth blend between visemes (co-articulation)
    Object.keys(VISEMES.sil).forEach(key => {
      const target = (targetViseme[key] || 0) * intensity;
      visemeBlendRef.current[key] = THREE.MathUtils.lerp(
        visemeBlendRef.current[key] || 0,
        target,
        0.35 // Blending speed for smooth transitions
      );
    });
    
    // ============ APPLY MORPH TARGETS ============
    morphMeshes.forEach(({ mesh, dict, influences }) => {
      // --- APPLY VISEME MORPH TARGETS ---
      // Map our viseme system to actual morph target names in the model
      const morphMapping = {
        jawOpen: ['jawOpen', 'mouthOpen'],
        mouthOpen: ['mouthOpen'],
        mouthPucker: ['mouthPucker', 'viseme_U'],
        mouthFunnel: ['mouthFunnel', 'viseme_O'],
        mouthStretchLeft: ['mouthStretchLeft', 'mouthStretch'],
        mouthStretchRight: ['mouthStretchRight', 'mouthStretch'],
        mouthSmileLeft: ['mouthSmileLeft', 'mouthSmile'],
        mouthSmileRight: ['mouthSmileRight', 'mouthSmile'],
        mouthSmile: ['mouthSmile'],
        mouthPress: ['mouthPressLeft', 'mouthPressRight', 'mouthClose'],
        mouthLowerDownLeft: ['mouthLowerDownLeft'],
        mouthLowerDownRight: ['mouthLowerDownRight'],
        mouthClose: ['mouthClose'],
        viseme_sil: ['viseme_sil'],
        viseme_PP: ['viseme_PP'],
        viseme_FF: ['viseme_FF'],
        viseme_TH: ['viseme_TH'],
        viseme_DD: ['viseme_DD'],
        viseme_kk: ['viseme_kk'],
        viseme_CH: ['viseme_CH'],
        viseme_SS: ['viseme_SS'],
        viseme_nn: ['viseme_nn'],
        viseme_RR: ['viseme_RR'],
        viseme_aa: ['viseme_aa'],
        viseme_E: ['viseme_E'],
        viseme_I: ['viseme_I'],
        viseme_O: ['viseme_O'],
        viseme_U: ['viseme_U']
      };
      
      // Apply blended viseme weights
      Object.entries(visemeBlendRef.current).forEach(([key, weight]) => {
        const targets = morphMapping[key] || [key];
        targets.forEach(target => {
          if (target in dict) {
            influences[dict[target]] = Math.min(1, weight);
          }
        });
      });
      
      // --- SMILE (additive to visemes) ---
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
      {/* Model at origin - camera positioned to view face */}
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
 * Gender-specific camera positions for optimal framing
 */
function CameraController({ gender }) {
  const { camera } = useThree();
  const initialized = useRef(false);
  
  useEffect(() => {
    // Reset when gender changes
    initialized.current = false;
  }, [gender]);
  
  useFrame(() => {
    if (!initialized.current) {
      if (gender === 'female') {
        // Female avatar camera position
        camera.position.set(-0.016, 1.587, 0.688);
        camera.lookAt(0.005, 1.532, -0.052);
        camera.fov = 40;
      } else {
        // Male avatar camera position
        camera.position.set(0.010, 1.722, 0.710);
        camera.lookAt(-0.003, 1.622, -0.168);
        camera.fov = 35;
      }
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

  // Debug log for gender prop
  console.log('[Avatar3D] Received gender prop:', gender);

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

      {/* 3D Canvas - key forces full remount on gender change */}
      <div className="avatar3d-canvas-container">
        <Canvas
          key={`canvas-${gender}`}
          camera={{ 
            position: [0, 1.65, 0.7], // Initial position, adjusted by CameraController
            fov: 35,
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
            position={[1, 2.5, 2]} 
            angle={0.5} 
            penumbra={1} 
            intensity={1.8}
            castShadow
            color="#ffffff"
          />
          
          {/* Fill light - soften shadows from left */}
          <spotLight 
            position={[-1, 2, 1.5]} 
            angle={0.6} 
            penumbra={1} 
            intensity={0.9}
            color="#e8f4ff"
          />
          
          {/* Top light for hair/head definition */}
          <pointLight position={[0, 2.5, 0.5]} intensity={0.5} color="#ffffff" />
          
          {/* Rim/Back light for depth separation */}
          <pointLight position={[-0.5, 1.8, -1]} intensity={0.4} color="#ffeedd" />
          
          {/* Colored accent light based on state - subtle */}
          <pointLight position={[0, 1.7, 0.5]} intensity={0.25} color={glowColor} />
          
          <Suspense fallback={<LoadingFallback />}>
            <CameraController gender={gender} />
            <AvatarModel 
              key={gender}
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
useGLTF.preload('/models/avatar/interviewer-male.glb?v=2');
useGLTF.preload('/models/avatar/interviewer-female.glb?v=2');

/**
 * Mini Avatar Preview - Compact version for selection UI
 */
export const AvatarPreview = ({ gender = 'male', isSelected = false }) => {
  const modelPath = gender === 'female' 
    ? '/models/avatar/interviewer-female.glb?v=2' 
    : '/models/avatar/interviewer-male.glb?v=2';

  return (
    <div className={`avatar-preview-container ${isSelected ? 'selected' : ''} ${gender}`}>
      <Canvas
        key={`preview-${gender}`}
        camera={{ position: [0, 1.6, 1.2], fov: 35 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[1, 2, 2]} intensity={1} />
        <spotLight position={[-1, 1.5, 1]} angle={0.5} intensity={0.8} />
        <Suspense fallback={null}>
          <PreviewModel key={gender} modelPath={modelPath} gender={gender} />
          <Environment preset="apartment" background={false} />
        </Suspense>
      </Canvas>
      <div className={`preview-glow ${gender}`} />
    </div>
  );
};

/**
 * Simple preview model without animations
 */
function PreviewModel({ modelPath, gender }) {
  const { scene } = useGLTF(modelPath);
  const group = useRef();
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
      }
    });
    return clone;
  }, [scene, gender]);

  // Gentle idle animation
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]} scale={1}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default Avatar3D;
