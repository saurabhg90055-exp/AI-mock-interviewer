import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Mic } from 'lucide-react';
import './SilenceAlert.css';

const SilenceAlert = ({ 
    audioLevel = 0,
    threshold = 0.05,
    silenceDuration = 5, // seconds before alert
    isActive = true,
    isRecording = false,
    onSilenceDetected,
    onSpeechResumed 
}) => {
    const [silenceTime, setSilenceTime] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [wasEverSpeaking, setWasEverSpeaking] = useState(false);
    const lastSpeechRef = useRef(Date.now());
    
    useEffect(() => {
        if (!isActive || !isRecording) {
            setSilenceTime(0);
            setShowAlert(false);
            return;
        }
        
        const interval = setInterval(() => {
            if (audioLevel > threshold) {
                // Speaking
                lastSpeechRef.current = Date.now();
                setSilenceTime(0);
                setWasEverSpeaking(true);
                if (showAlert) {
                    setShowAlert(false);
                    onSpeechResumed?.();
                }
            } else if (wasEverSpeaking) {
                // Silent
                const silentFor = (Date.now() - lastSpeechRef.current) / 1000;
                setSilenceTime(silentFor);
                
                if (silentFor >= silenceDuration && !showAlert) {
                    setShowAlert(true);
                    onSilenceDetected?.();
                }
            }
        }, 500);
        
        return () => clearInterval(interval);
    }, [isActive, isRecording, audioLevel, threshold, silenceDuration, showAlert, wasEverSpeaking, onSilenceDetected, onSpeechResumed]);
    
    if (!isActive || !isRecording) return null;
    
    return (
        <AnimatePresence>
            {showAlert && (
                <motion.div
                    className="silence-alert"
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                >
                    <div className="alert-icon">
                        <AlertCircle size={20} />
                        <span className="pulse-ring" />
                    </div>
                    <div className="alert-content">
                        <span className="alert-title">Silence Detected</span>
                        <span className="alert-time">
                            {Math.round(silenceTime)}s without speaking
                        </span>
                    </div>
                    <div className="alert-tip">
                        <Mic size={14} />
                        <span>Continue speaking or end your response</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SilenceAlert;
