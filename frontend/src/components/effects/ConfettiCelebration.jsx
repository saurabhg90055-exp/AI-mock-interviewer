import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ConfettiCelebration.css';

const colors = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#10b981', // Green
    '#fbbf24', // Yellow
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#06b6d4', // Cyan
];

const Particle = ({ index, originX, originY }) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    const angle = (Math.PI * 2 * index) / 50 + Math.random() * 0.5;
    const velocity = Math.random() * 300 + 200;
    const endX = Math.cos(angle) * velocity;
    const endY = Math.sin(angle) * velocity - 200; // Add upward bias
    const rotation = Math.random() * 720 - 360;
    const duration = Math.random() * 1 + 1.5;

    return (
        <motion.div
            className="confetti-particle"
            initial={{
                x: originX,
                y: originY,
                scale: 0,
                opacity: 1,
                rotate: 0
            }}
            animate={{
                x: originX + endX,
                y: originY + endY + 400, // Fall down
                scale: [0, 1, 1, 0.5],
                opacity: [1, 1, 1, 0],
                rotate: rotation
            }}
            transition={{
                duration: duration,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
        />
    );
};

const Star = ({ index, originX, originY }) => {
    const angle = (Math.PI * 2 * index) / 20;
    const velocity = Math.random() * 150 + 100;
    const endX = Math.cos(angle) * velocity;
    const endY = Math.sin(angle) * velocity - 100;

    return (
        <motion.div
            className="confetti-star"
            initial={{
                x: originX,
                y: originY,
                scale: 0,
                opacity: 1
            }}
            animate={{
                x: originX + endX,
                y: originY + endY,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                rotate: [0, 180]
            }}
            transition={{
                duration: 1.5,
                ease: 'easeOut'
            }}
        >
            ⭐
        </motion.div>
    );
};

const ConfettiCelebration = ({ 
    trigger = false, 
    originX = null, 
    originY = null,
    particleCount = 50,
    duration = 3000,
    onComplete
}) => {
    const [isActive, setIsActive] = useState(false);
    const [particles, setParticles] = useState([]);
    const [centerX, setCenterX] = useState(0);
    const [centerY, setCenterY] = useState(0);

    useEffect(() => {
        if (trigger && !isActive) {
            // Calculate center position
            const x = originX !== null ? originX : window.innerWidth / 2;
            const y = originY !== null ? originY : window.innerHeight / 2;
            setCenterX(x);
            setCenterY(y);

            // Generate particles
            const newParticles = Array.from({ length: particleCount }, (_, i) => ({
                id: i,
                type: i < 20 ? 'star' : 'particle'
            }));
            setParticles(newParticles);
            setIsActive(true);

            // Clean up after duration
            const timer = setTimeout(() => {
                setIsActive(false);
                setParticles([]);
                if (onComplete) onComplete();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [trigger, originX, originY, particleCount, duration, onComplete, isActive]);

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    className="confetti-container"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {particles.map((particle) => (
                        particle.type === 'star' ? (
                            <Star 
                                key={`star-${particle.id}`} 
                                index={particle.id} 
                                originX={centerX}
                                originY={centerY}
                            />
                        ) : (
                            <Particle 
                                key={`particle-${particle.id}`} 
                                index={particle.id}
                                originX={centerX}
                                originY={centerY}
                            />
                        )
                    ))}
                    
                    {/* Center flash effect */}
                    <motion.div
                        className="center-flash"
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ left: centerX, top: centerY }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Hook for easy usage
export const useConfetti = () => {
    const [triggerConfetti, setTriggerConfetti] = useState(false);
    const [origin, setOrigin] = useState({ x: null, y: null });

    const celebrate = (x = null, y = null) => {
        setOrigin({ x, y });
        setTriggerConfetti(true);
    };

    const reset = () => {
        setTriggerConfetti(false);
    };

    return {
        trigger: triggerConfetti,
        originX: origin.x,
        originY: origin.y,
        celebrate,
        reset
    };
};

export default ConfettiCelebration;
