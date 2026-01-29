import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Mic, MicOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import './VideoPreview.css';

const VideoPreview = ({ onReady, onCancel }) => {
    const [cameraStatus, setCameraStatus] = useState('checking'); // 'checking' | 'ready' | 'error'
    const [micStatus, setMicStatus] = useState('checking');
    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [micError, setMicError] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);
    
    const videoRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);
    
    useEffect(() => {
        checkDevices();
        return () => {
            cleanup();
        };
    }, []);
    
    const cleanup = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };
    
    const checkDevices = async () => {
        setCameraStatus('checking');
        setMicStatus('checking');
        
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            
            setStream(mediaStream);
            
            // Check video track
            const videoTrack = mediaStream.getVideoTracks()[0];
            if (videoTrack && videoTrack.readyState === 'live') {
                setCameraStatus('ready');
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } else {
                setCameraStatus('error');
                setCameraError('Camera not available');
            }
            
            // Check audio track
            const audioTrack = mediaStream.getAudioTracks()[0];
            if (audioTrack && audioTrack.readyState === 'live') {
                setMicStatus('ready');
                setupAudioMeter(mediaStream);
            } else {
                setMicStatus('error');
                setMicError('Microphone not available');
            }
            
        } catch (error) {
            console.error('Media access error:', error);
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setCameraStatus('error');
                setMicStatus('error');
                setCameraError('Permission denied. Please allow camera access.');
                setMicError('Permission denied. Please allow microphone access.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setCameraStatus('error');
                setMicStatus('error');
                setCameraError('No camera found');
                setMicError('No microphone found');
            } else {
                setCameraStatus('error');
                setMicStatus('error');
                setCameraError(error.message);
                setMicError(error.message);
            }
        }
    };
    
    const setupAudioMeter = (mediaStream) => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(mediaStream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        
        const updateMeter = () => {
            if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(average / 255);
            }
            animationRef.current = requestAnimationFrame(updateMeter);
        };
        updateMeter();
    };
    
    const handleRetry = () => {
        cleanup();
        setStream(null);
        checkDevices();
    };
    
    const handleProceed = () => {
        if (cameraStatus === 'ready' && micStatus === 'ready' && stream) {
            onReady(stream);
        }
    };
    
    const isReady = cameraStatus === 'ready' && micStatus === 'ready';
    
    return (
        <div className="video-preview-container">
            <div className="preview-card">
                <h2 className="preview-title">📹 Camera & Mic Check</h2>
                <p className="preview-subtitle">Make sure everything works before starting</p>
                
                {/* Video Preview */}
                <div className="preview-video-wrapper">
                    {cameraStatus === 'ready' ? (
                        <video 
                            ref={videoRef}
                            autoPlay 
                            playsInline 
                            muted
                            className="preview-video"
                        />
                    ) : cameraStatus === 'checking' ? (
                        <div className="preview-placeholder">
                            <RefreshCw className="spinning" size={32} />
                            <span>Checking camera...</span>
                        </div>
                    ) : (
                        <div className="preview-placeholder error">
                            <CameraOff size={48} />
                            <span>{cameraError}</span>
                        </div>
                    )}
                </div>
                
                {/* Device Status */}
                <div className="device-status">
                    <div className={`status-item ${cameraStatus}`}>
                        {cameraStatus === 'ready' ? (
                            <CheckCircle className="status-icon success" size={20} />
                        ) : cameraStatus === 'checking' ? (
                            <RefreshCw className="status-icon spinning" size={20} />
                        ) : (
                            <AlertCircle className="status-icon error" size={20} />
                        )}
                        <Camera size={18} />
                        <span>Camera</span>
                        <span className="status-label">
                            {cameraStatus === 'ready' ? 'Ready' : cameraStatus === 'checking' ? 'Checking...' : 'Error'}
                        </span>
                    </div>
                    
                    <div className={`status-item ${micStatus}`}>
                        {micStatus === 'ready' ? (
                            <CheckCircle className="status-icon success" size={20} />
                        ) : micStatus === 'checking' ? (
                            <RefreshCw className="status-icon spinning" size={20} />
                        ) : (
                            <AlertCircle className="status-icon error" size={20} />
                        )}
                        <Mic size={18} />
                        <span>Microphone</span>
                        <span className="status-label">
                            {micStatus === 'ready' ? 'Ready' : micStatus === 'checking' ? 'Checking...' : 'Error'}
                        </span>
                    </div>
                </div>
                
                {/* Audio Level Meter */}
                {micStatus === 'ready' && (
                    <div className="audio-meter">
                        <span className="meter-label">🎤 Speak to test your mic</span>
                        <div className="meter-bar">
                            <motion.div 
                                className="meter-fill"
                                animate={{ width: `${audioLevel * 100}%` }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                    </div>
                )}
                
                {/* Tips */}
                <div className="preview-tips">
                    <h4>💡 Tips for a great video interview:</h4>
                    <ul>
                        <li>Ensure good lighting on your face</li>
                        <li>Position camera at eye level</li>
                        <li>Use a quiet environment</li>
                        <li>Look directly at the camera</li>
                    </ul>
                </div>
                
                {/* Actions */}
                <div className="preview-actions">
                    <button 
                        className="btn-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    
                    <button 
                        className="btn-retry"
                        onClick={handleRetry}
                    >
                        <RefreshCw size={16} />
                        Retry Check
                    </button>
                    
                    <button 
                        className="btn-primary"
                        onClick={handleProceed}
                        disabled={!isReady}
                    >
                        {isReady ? '✅ Start Interview' : 'Waiting for devices...'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPreview;
