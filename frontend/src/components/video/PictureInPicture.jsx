import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Maximize2, Minimize2, Move, X, Eye, EyeOff,
    CornerDownRight, CornerDownLeft, CornerUpRight, CornerUpLeft
} from 'lucide-react';
import './PictureInPicture.css';

/**
 * Picture-in-Picture Self-View Component
 * Draggable, resizable self-view for video interviews
 */
const PictureInPicture = ({ 
    videoRef,
    isVisible = true,
    onToggle,
    faceDetected = false,
    eyeContact = 0,
    showEyeGuide = true
}) => {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [size, setSize] = useState('medium'); // 'small' | 'medium' | 'large'
    const [corner, setCorner] = useState('bottom-right'); // position preset
    const [isDragging, setIsDragging] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const pipRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Size configurations
    const sizes = {
        small: { width: 160, height: 120 },
        medium: { width: 240, height: 180 },
        large: { width: 320, height: 240 }
    };

    // Corner positions
    const cornerPositions = {
        'top-left': { top: 20, left: 20 },
        'top-right': { top: 20, right: 20 },
        'bottom-left': { bottom: 20, left: 20 },
        'bottom-right': { bottom: 20, right: 20 }
    };

    // Handle drag start
    const handleDragStart = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const rect = pipRef.current?.getBoundingClientRect();
        if (rect) {
            dragStartRef.current = {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }
    }, []);

    // Handle drag move
    const handleDragMove = useCallback((e) => {
        if (!isDragging) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        setPosition({
            x: clientX - dragStartRef.current.x,
            y: clientY - dragStartRef.current.y
        });
        setCorner(null); // Switch to free positioning
    }, [isDragging]);

    // Handle drag end
    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add/remove event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('touchend', handleDragEnd);
        }
        
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    // Cycle through sizes
    const cycleSize = () => {
        const sizeOrder = ['small', 'medium', 'large'];
        const currentIndex = sizeOrder.indexOf(size);
        setSize(sizeOrder[(currentIndex + 1) % sizeOrder.length]);
    };

    // Get style based on corner or free position
    const getPositionStyle = () => {
        if (corner) {
            return {
                ...cornerPositions[corner],
                ...sizes[size]
            };
        }
        return {
            left: position.x,
            top: position.y,
            ...sizes[size]
        };
    };

    if (!isVisible) return null;

    return (
        <motion.div
            ref={pipRef}
            className={`pip-container ${size} ${isDragging ? 'dragging' : ''}`}
            style={getPositionStyle()}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Video Mirror */}
            <div className="pip-video-wrapper">
                <video
                    ref={(el) => {
                        if (el && videoRef?.current?.srcObject) {
                            el.srcObject = videoRef.current.srcObject;
                        }
                    }}
                    autoPlay
                    muted
                    playsInline
                    className="pip-video"
                />
                
                {/* Eye Contact Guide Overlay */}
                {showEyeGuide && (
                    <div className="eye-guide-overlay">
                        <div className={`eye-guide-target ${eyeContact >= 70 ? 'good' : eyeContact >= 50 ? 'medium' : 'low'}`}>
                            <div className="eye-guide-ring" />
                            <div className="eye-guide-center" />
                        </div>
                        <span className="eye-guide-label">
                            {eyeContact >= 70 ? '👁️ Great!' : eyeContact >= 50 ? '👀 Look here' : '⚠️ Look at camera'}
                        </span>
                    </div>
                )}
                
                {/* Face Detection Indicator */}
                <div className={`face-detection-indicator ${faceDetected ? 'detected' : ''}`}>
                    {faceDetected ? <Eye size={14} /> : <EyeOff size={14} />}
                </div>
            </div>

            {/* Controls Overlay */}
            <AnimatePresence>
                {showControls && (
                    <motion.div 
                        className="pip-controls"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Drag Handle */}
                        <div 
                            className="pip-drag-handle"
                            onMouseDown={handleDragStart}
                            onTouchStart={handleDragStart}
                        >
                            <Move size={14} />
                        </div>
                        
                        {/* Size Toggle */}
                        <button className="pip-btn" onClick={cycleSize} title="Change size">
                            {size === 'small' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>

                        {/* Corner Presets */}
                        <div className="pip-corner-buttons">
                            <button 
                                className={`corner-btn ${corner === 'top-left' ? 'active' : ''}`}
                                onClick={() => setCorner('top-left')}
                            >
                                <CornerUpLeft size={12} />
                            </button>
                            <button 
                                className={`corner-btn ${corner === 'top-right' ? 'active' : ''}`}
                                onClick={() => setCorner('top-right')}
                            >
                                <CornerUpRight size={12} />
                            </button>
                            <button 
                                className={`corner-btn ${corner === 'bottom-left' ? 'active' : ''}`}
                                onClick={() => setCorner('bottom-left')}
                            >
                                <CornerDownLeft size={12} />
                            </button>
                            <button 
                                className={`corner-btn ${corner === 'bottom-right' ? 'active' : ''}`}
                                onClick={() => setCorner('bottom-right')}
                            >
                                <CornerDownRight size={12} />
                            </button>
                        </div>
                        
                        {/* Close Button */}
                        <button className="pip-btn pip-close" onClick={onToggle} title="Hide self-view">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Eye Contact Meter */}
            <div className="pip-eye-meter">
                <div 
                    className="pip-eye-meter-fill" 
                    style={{ 
                        width: `${eyeContact}%`,
                        backgroundColor: eyeContact >= 70 ? '#22c55e' : eyeContact >= 50 ? '#eab308' : '#ef4444'
                    }} 
                />
            </div>
        </motion.div>
    );
};

export default PictureInPicture;
