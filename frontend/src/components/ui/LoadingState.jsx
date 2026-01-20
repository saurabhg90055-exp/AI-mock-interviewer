import React from 'react';
import { motion } from 'framer-motion';
import './LoadingState.css';

// Spinner variants
export const Spinner = ({ size = 'md', color = '#6366f1' }) => {
    const sizes = {
        sm: 20,
        md: 40,
        lg: 60
    };

    return (
        <motion.div
            className="spinner"
            style={{
                width: sizes[size],
                height: sizes[size],
                borderColor: `${color}20`,
                borderTopColor: color
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    );
};

// Pulse dots
export const PulseDots = ({ color = '#6366f1' }) => {
    return (
        <div className="pulse-dots">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="pulse-dot"
                    style={{ backgroundColor: color }}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                    }}
                />
            ))}
        </div>
    );
};

// Skeleton loader
export const Skeleton = ({ 
    width = '100%', 
    height = 20, 
    borderRadius = 8,
    className = ''
}) => {
    return (
        <motion.div
            className={`skeleton ${className}`}
            style={{ width, height, borderRadius }}
            animate={{
                backgroundPosition: ['200% 0', '-200% 0']
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
            }}
        />
    );
};

// Full page loading
export const PageLoader = ({ message = 'Loading...' }) => {
    return (
        <motion.div
            className="page-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="loader-content"
                animate={{
                    scale: [1, 1.02, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity
                }}
            >
                <div className="loader-icon">
                    <motion.div
                        className="loader-ring"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                        className="loader-ring inner"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                </div>
                <p className="loader-message">{message}</p>
            </motion.div>
        </motion.div>
    );
};

// Inline loading text
export const LoadingText = ({ text = 'Loading', showDots = true }) => {
    return (
        <span className="loading-text">
            {text}
            {showDots && (
                <span className="loading-dots">
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                        >
                            .
                        </motion.span>
                    ))}
                </span>
            )}
        </span>
    );
};

// AI Thinking animation
export const AIThinking = ({ message = 'AI is thinking...' }) => {
    return (
        <motion.div
            className="ai-thinking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <div className="thinking-animation">
                {[0, 1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        className="thinking-bubble"
                        animate={{
                            y: [0, -10, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.15
                        }}
                    />
                ))}
            </div>
            <span className="thinking-message">{message}</span>
        </motion.div>
    );
};

export default {
    Spinner,
    PulseDots,
    Skeleton,
    PageLoader,
    LoadingText,
    AIThinking
};
