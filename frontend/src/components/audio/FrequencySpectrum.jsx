import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart2 } from 'lucide-react';
import './FrequencySpectrum.css';

const FrequencySpectrum = ({ 
    audioContext,
    analyser,
    isActive = true,
    barCount = 32,
    colorScheme = 'gradient', // 'gradient', 'single', 'rainbow'
    size = 'medium',
    showLabel = true 
}) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const [peakFrequency, setPeakFrequency] = useState(0);
    
    useEffect(() => {
        if (!isActive || !analyser || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const draw = () => {
            analyser.getByteFrequencyData(dataArray);
            
            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / barCount) - 2;
            const step = Math.floor(dataArray.length / barCount);
            
            ctx.clearRect(0, 0, width, height);
            
            let maxVal = 0;
            let maxIndex = 0;
            
            for (let i = 0; i < barCount; i++) {
                const value = dataArray[i * step];
                const barHeight = (value / 255) * height;
                const x = i * (barWidth + 2);
                const y = height - barHeight;
                
                if (value > maxVal) {
                    maxVal = value;
                    maxIndex = i;
                }
                
                // Color based on scheme
                let color;
                if (colorScheme === 'rainbow') {
                    const hue = (i / barCount) * 360;
                    color = `hsl(${hue}, 70%, 60%)`;
                } else if (colorScheme === 'single') {
                    color = '#6366f1';
                } else {
                    // Gradient from blue to purple based on frequency
                    const ratio = i / barCount;
                    color = `hsl(${250 - ratio * 30}, 70%, ${50 + (value / 255) * 20}%)`;
                }
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, barHeight, 2);
                ctx.fill();
                
                // Add glow effect for high values
                if (value > 150) {
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
            
            // Calculate approximate frequency
            const nyquist = audioContext?.sampleRate / 2 || 22050;
            const peakHz = Math.round((maxIndex / barCount) * nyquist);
            setPeakFrequency(peakHz);
            
            animationRef.current = requestAnimationFrame(draw);
        };
        
        draw();
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isActive, analyser, audioContext, barCount, colorScheme]);
    
    const getCanvasSize = () => {
        switch (size) {
            case 'small': return { width: 150, height: 40 };
            case 'large': return { width: 400, height: 100 };
            default: return { width: 250, height: 60 };
        }
    };
    
    const { width, height } = getCanvasSize();
    
    if (!isActive) return null;
    
    return (
        <div className={`frequency-spectrum ${size}`}>
            {showLabel && (
                <div className="spectrum-header">
                    <Activity size={14} />
                    <span>Frequency</span>
                    {peakFrequency > 0 && (
                        <span className="peak-freq">{peakFrequency} Hz</span>
                    )}
                </div>
            )}
            <div className="spectrum-container">
                <canvas 
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="spectrum-canvas"
                />
            </div>
        </div>
    );
};

export default FrequencySpectrum;
