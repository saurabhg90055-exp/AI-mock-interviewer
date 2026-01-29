import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Camera, CameraOff, Mic, MicOff, Video, VideoOff, 
    Phone, Settings, Maximize2, Minimize2, Eye, 
    AlertCircle, CheckCircle, TrendingUp, Brain,
    MessageSquare, Clock, Zap
} from 'lucide-react';
import { AIAvatar } from '../avatar';
import { AudioVisualizer } from '../audio';
import { TypingIndicator } from '../ui';
import ExpressionIndicator from './ExpressionIndicator';
import VideoCoachingTips from './VideoCoachingTips';
import './VideoInterview.css';

const VideoInterview = ({
    sessionId,
    onEndInterview,
    onSendAudio,
    conversationHistory,
    isProcessing,
    isSpeaking,
    currentScore,
    averageScore,
    questionCount,
    elapsedTime,
    remainingTime,
    isTimeWarning,
    avatarState,
    settings,
    enableTTS
}) => {
    // Video states
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [stream, setStream] = useState(null);
    
    // Recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    
    // Expression analysis states
    const [expressionData, setExpressionData] = useState({
        confidence: 0,
        eyeContact: 0,
        emotion: 'neutral',
        engagement: 0
    });
    const [expressionHistory, setExpressionHistory] = useState([]);
    
    // UI states
    const [showSettings, setShowSettings] = useState(false);
    const [showTranscript, setShowTranscript] = useState(true);
    
    // Refs
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const containerRef = useRef(null);
    
    // Initialize camera and microphone
    useEffect(() => {
        initializeMedia();
        return () => {
            stopMediaStream();
        };
    }, []);
    
    const initializeMedia = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            
            // Setup audio analyzer for visualization
            setupAudioAnalyzer(mediaStream);
            setCameraError(null);
        } catch (error) {
            console.error('Error accessing media devices:', error);
            setCameraError(error.message);
        }
    };
    
    const setupAudioAnalyzer = (mediaStream) => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(mediaStream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        
        const updateLevel = () => {
            if (analyserRef.current && isMicOn) {
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(average / 255);
            }
            requestAnimationFrame(updateLevel);
        };
        updateLevel();
    };
    
    const stopMediaStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
    
    const toggleCamera = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };
    
    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };
    
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };
    
    // Recording functions
    const startRecording = async () => {
        if (!stream || !isMicOn) return;
        
        try {
            chunksRef.current = [];
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                
                // Capture current expression data with the recording
                const capturedExpression = { ...expressionData };
                
                // Send audio with expression data
                if (onSendAudio) {
                    onSendAudio(audioBlob, capturedExpression);
                }
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(recordingTimerRef.current);
        }
    };
    
    // Expression data handler (called from ExpressionIndicator)
    const handleExpressionUpdate = useCallback((data) => {
        setExpressionData(data);
        setExpressionHistory(prev => [...prev.slice(-100), { ...data, timestamp: Date.now() }]);
    }, []);
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
        <div 
            ref={containerRef}
            className={`video-interview-container ${isFullscreen ? 'fullscreen' : ''}`}
        >
            {/* Header Bar */}
            <div className="video-header">
                <div className="header-left">
                    <div className="session-info">
                        <Brain size={18} className="header-icon" />
                        <span>Video Interview</span>
                        <span className="question-badge">Q{questionCount}</span>
                    </div>
                </div>
                
                <div className="header-center">
                    <div className={`timer ${isTimeWarning ? 'warning' : ''}`}>
                        <Clock size={16} />
                        <span>{formatTime(remainingTime)}</span>
                    </div>
                </div>
                
                <div className="header-right">
                    {averageScore && (
                        <div className="score-indicator">
                            <TrendingUp size={16} />
                            <span>{averageScore.toFixed(1)}/10</span>
                        </div>
                    )}
                    <button 
                        className="icon-btn"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>
            </div>
            
            {/* Main Video Area */}
            <div className="video-main">
                {/* AI Interviewer Side */}
                <div className="interviewer-panel">
                    <div className="avatar-container">
                        <AIAvatar 
                            state={avatarState}
                            audioLevel={isSpeaking ? 0.5 : 0}
                            score={currentScore}
                            size="large"
                            userExpression={expressionData}
                            videoMode={true}
                            showFeedback={!isRecording && !isProcessing && !isSpeaking}
                        />
                    </div>
                    
                    <div className="interviewer-info">
                        <h3>AI Interviewer</h3>
                        <span className={`status ${isSpeaking ? 'speaking' : 'idle'}`}>
                            {isSpeaking ? '🎙️ Speaking' : isProcessing ? '🤔 Thinking' : '👂 Listening'}
                        </span>
                    </div>
                    
                    {/* Current Question Display */}
                    <AnimatePresence>
                        {conversationHistory.length > 0 && (
                            <motion.div 
                                className="current-question"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <MessageSquare size={16} />
                                <p>{conversationHistory[conversationHistory.length - 1]?.role === 'assistant' 
                                    ? conversationHistory[conversationHistory.length - 1]?.content 
                                    : conversationHistory[conversationHistory.length - 2]?.content}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {isProcessing && (
                        <div className="processing-indicator">
                            <TypingIndicator variant="dots" color="primary" text="AI is analyzing..." />
                        </div>
                    )}
                    
                    {/* Real-time coaching tips */}
                    <div className="coaching-tips-container">
                        <VideoCoachingTips
                            expressionData={expressionData}
                            isRecording={isRecording}
                            isActive={!isProcessing && !isSpeaking}
                            compact={true}
                        />
                    </div>
                </div>
                
                {/* User Video Side */}
                <div className="user-panel">
                    <div className="video-wrapper">
                        {cameraError ? (
                            <div className="camera-error">
                                <CameraOff size={48} />
                                <p>Camera access denied</p>
                                <button onClick={initializeMedia} className="retry-btn">
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <>
                                <video 
                                    ref={videoRef}
                                    autoPlay 
                                    playsInline 
                                    muted
                                    className={`user-video ${!isCameraOn ? 'hidden' : ''}`}
                                />
                                {!isCameraOn && (
                                    <div className="camera-off-placeholder">
                                        <CameraOff size={48} />
                                        <span>Camera Off</span>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* Recording Indicator */}
                        <AnimatePresence>
                            {isRecording && (
                                <motion.div 
                                    className="recording-badge"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <span className="rec-dot" />
                                    <span>REC {formatTime(recordingTime)}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {/* Expression Overlay */}
                        {isCameraOn && (
                            <ExpressionIndicator 
                                videoRef={videoRef}
                                isActive={isCameraOn}
                                onExpressionUpdate={handleExpressionUpdate}
                            />
                        )}
                    </div>
                    
                    {/* Expression Stats */}
                    <div className="expression-stats">
                        <div className="stat-item">
                            <Eye size={14} />
                            <span className="stat-label">Eye Contact</span>
                            <div className="stat-bar">
                                <div 
                                    className="stat-fill eye-contact"
                                    style={{ width: `${expressionData.eyeContact}%` }}
                                />
                            </div>
                            <span className="stat-value">{expressionData.eyeContact}%</span>
                        </div>
                        <div className="stat-item">
                            <Zap size={14} />
                            <span className="stat-label">Confidence</span>
                            <div className="stat-bar">
                                <div 
                                    className="stat-fill confidence"
                                    style={{ width: `${expressionData.confidence}%` }}
                                />
                            </div>
                            <span className="stat-value">{expressionData.confidence}%</span>
                        </div>
                        <div className="stat-item emotion">
                            <span className="emotion-emoji">
                                {expressionData.emotion === 'happy' && '😊'}
                                {expressionData.emotion === 'neutral' && '😐'}
                                {expressionData.emotion === 'surprised' && '😮'}
                                {expressionData.emotion === 'thinking' && '🤔'}
                                {expressionData.emotion === 'nervous' && '😰'}
                            </span>
                            <span className="emotion-label">{expressionData.emotion}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Transcript Panel (Collapsible) */}
            <AnimatePresence>
                {showTranscript && (
                    <motion.div 
                        className="transcript-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <div className="transcript-header">
                            <MessageSquare size={16} />
                            <span>Conversation</span>
                            <button 
                                className="collapse-btn"
                                onClick={() => setShowTranscript(false)}
                            >
                                ▼
                            </button>
                        </div>
                        <div className="transcript-content">
                            {conversationHistory.slice(-4).map((msg, idx) => (
                                <div key={idx} className={`transcript-msg ${msg.role}`}>
                                    <span className="msg-role">
                                        {msg.role === 'assistant' ? '🤖' : '👤'}
                                    </span>
                                    <p>{msg.content}</p>
                                    {msg.score && (
                                        <span className="msg-score">{msg.score}/10</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {!showTranscript && (
                <button 
                    className="show-transcript-btn"
                    onClick={() => setShowTranscript(true)}
                >
                    <MessageSquare size={14} />
                    Show Transcript
                </button>
            )}
            
            {/* Control Bar */}
            <div className="video-controls">
                <div className="controls-left">
                    <button 
                        className={`control-btn ${!isMicOn ? 'off' : ''}`}
                        onClick={toggleMic}
                        title={isMicOn ? 'Mute' : 'Unmute'}
                    >
                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>
                    <button 
                        className={`control-btn ${!isCameraOn ? 'off' : ''}`}
                        onClick={toggleCamera}
                        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>
                </div>
                
                <div className="controls-center">
                    {/* Main Record Button */}
                    <motion.button
                        className={`record-btn ${isRecording ? 'recording' : ''}`}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing || isSpeaking || !isMicOn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isRecording ? (
                            <>
                                <span className="pulse-ring" />
                                <span className="btn-icon">⬛</span>
                                <span>Stop Recording</span>
                            </>
                        ) : (
                            <>
                                <Mic size={24} />
                                <span>Push to Talk</span>
                            </>
                        )}
                    </motion.button>
                    
                    {/* Audio Level Indicator */}
                    {isRecording && (
                        <div className="audio-level-bar">
                            <div 
                                className="level-fill"
                                style={{ width: `${audioLevel * 100}%` }}
                            />
                        </div>
                    )}
                </div>
                
                <div className="controls-right">
                    <button 
                        className="control-btn end-call"
                        onClick={onEndInterview}
                        title="End Interview"
                    >
                        <Phone size={20} />
                        <span>End</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoInterview;
