import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, AlertTriangle, Check, Lightbulb } from 'lucide-react';
import './LightingIndicator.css';

const LightingIndicator = ({ 
    videoRef,
    isActive = true,
    showRecommendations = true,
    compact = false,
    onLightingChange 
}) => {
    const [lightingLevel, setLightingLevel] = useState(50);
    const [lightingQuality, setLightingQuality] = useState('good');
    const [recommendation, setRecommendation] = useState('');
    const canvasRef = useRef(null);
    const analyzerRef = useRef(null);
    
    useEffect(() => {
        if (!isActive || !videoRef?.current) return;
        
        // Start analyzing lighting
        analyzerRef.current = setInterval(() => {
            analyzeLighting();
        }, 1000);
        
        return () => {
            if (analyzerRef.current) {
                clearInterval(analyzerRef.current);
            }
        };
    }, [isActive, videoRef]);
    
    const analyzeLighting = () => {
        if (!videoRef?.current) return;
        
        const video = videoRef.current;
        if (!video.videoWidth || !video.videoHeight) return;
        
        // Create canvas to analyze video frame
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = 100; // Downsample for performance
        canvas.height = 75;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Calculate average brightness
            let totalBrightness = 0;
            const pixelCount = data.length / 4;
            
            for (let i = 0; i < data.length; i += 4) {
                // Luminance formula
                const brightness = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
                totalBrightness += brightness;
            }
            
            const avgBrightness = totalBrightness / pixelCount;
            const normalizedLevel = Math.round((avgBrightness / 255) * 100);
            
            setLightingLevel(normalizedLevel);
            
            // Determine quality
            let quality = 'good';
            let rec = '';
            
            if (normalizedLevel < 25) {
                quality = 'poor';
                rec = 'Too dark - add more light or face a window';
            } else if (normalizedLevel < 40) {
                quality = 'fair';
                rec = 'Slightly dark - consider adding a desk lamp';
            } else if (normalizedLevel > 85) {
                quality = 'fair';
                rec = 'Too bright - reduce backlighting or close blinds';
            } else if (normalizedLevel > 75) {
                quality = 'good';
                rec = 'Good lighting';
            } else {
                quality = 'excellent';
                rec = 'Excellent lighting!';
            }
            
            setLightingQuality(quality);
            setRecommendation(rec);
            onLightingChange?.({ level: normalizedLevel, quality, recommendation: rec });
            
        } catch (e) {
            // Canvas security error or other issue
            console.warn('Unable to analyze lighting:', e);
        }
    };
    
    if (!isActive) return null;
    
    const getIcon = () => {
        if (lightingLevel < 30) return <Moon size={compact ? 14 : 16} />;
        if (lightingLevel > 80) return <Sun size={compact ? 14 : 16} />;
        return <Lightbulb size={compact ? 14 : 16} />;
    };
    
    if (compact) {
        return (
            <div className={`lighting-indicator compact ${lightingQuality}`}>
                <div className="lighting-icon">
                    {getIcon()}
                </div>
                <div className="lighting-bar">
                    <motion.div 
                        className="lighting-fill"
                        animate={{ width: `${lightingLevel}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>
        );
    }
    
    return (
        <div className={`lighting-indicator ${lightingQuality}`}>
            <div className="lighting-header">
                <div className="lighting-icon">
                    {getIcon()}
                </div>
                <div className="lighting-info">
                    <span className="lighting-label">Lighting</span>
                    <span className={`lighting-quality ${lightingQuality}`}>
                        {lightingQuality === 'excellent' && <Check size={12} />}
                        {lightingQuality === 'poor' && <AlertTriangle size={12} />}
                        {lightingQuality.charAt(0).toUpperCase() + lightingQuality.slice(1)}
                    </span>
                </div>
                <span className="lighting-percent">{lightingLevel}%</span>
            </div>
            
            <div className="lighting-bar full">
                <motion.div 
                    className="lighting-fill"
                    animate={{ width: `${lightingLevel}%` }}
                    transition={{ duration: 0.3 }}
                />
                <div className="lighting-zones">
                    <span className="zone dark" />
                    <span className="zone optimal" />
                    <span className="zone bright" />
                </div>
            </div>
            
            {showRecommendations && recommendation && lightingQuality !== 'excellent' && (
                <p className="lighting-recommendation">{recommendation}</p>
            )}
        </div>
    );
};

export default LightingIndicator;
