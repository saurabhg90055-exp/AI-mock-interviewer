import { useState, useRef, useEffect, useCallback } from "react";

const API_URL = "http://127.0.0.1:8000";

const AudioRecorder = () => {
    // Session state
    const [sessionId, setSessionId] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState("general");
    const [selectedCompany, setSelectedCompany] = useState("default");
    const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [enableTTS, setEnableTTS] = useState(true);
    const [topics, setTopics] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [difficulties, setDifficulties] = useState([]);
    const [interviewStarted, setInterviewStarted] = useState(false);
    
    // Resume & Job Description state
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState("");
    const [resumeParsed, setResumeParsed] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [isParsingResume, setIsParsingResume] = useState(false);
    
    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    
    // Timer state
    const [elapsedTime, setElapsedTime] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [isTimeWarning, setIsTimeWarning] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    
    // Audio visualization state
    const [audioLevel, setAudioLevel] = useState(0);
    
    // Conversation state
    const [conversationHistory, setConversationHistory] = useState([]);
    const [questionCount, setQuestionCount] = useState(0);
    const [currentScore, setCurrentScore] = useState(null);
    const [averageScore, setAverageScore] = useState(null);
    const [difficultyTrend, setDifficultyTrend] = useState("stable");
    
    // Summary state
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState(null);
    
    // Setup step state
    const [setupStep, setSetupStep] = useState(1); // 1: basics, 2: resume/JD, 3: confirm
    
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const chatEndRef = useRef(null);
    const ttsAudioRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const recordingTimerRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);

    // Fetch available options on mount
    useEffect(() => {
        fetchTopics();
        fetchCompanies();
        fetchDifficulties();
        
        // Preload speech synthesis voices
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversationHistory]);

    // Interview timer
    useEffect(() => {
        if (interviewStarted && sessionId) {
            timerIntervalRef.current = setInterval(async () => {
                try {
                    const response = await fetch(`${API_URL}/interview/${sessionId}/time`);
                    const data = await response.json();
                    setElapsedTime(data.elapsed_seconds);
                    setRemainingTime(data.remaining_seconds);
                    setIsTimeWarning(data.is_warning);
                    setIsTimeUp(data.is_time_up);
                } catch (error) {
                    console.error("Timer error:", error);
                }
            }, 1000);
            
            return () => clearInterval(timerIntervalRef.current);
        }
    }, [interviewStarted, sessionId]);

    // Recording timer
    useEffect(() => {
        if (isRecording) {
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            return () => clearInterval(recordingTimerRef.current);
        } else {
            clearInterval(recordingTimerRef.current);
        }
    }, [isRecording]);

    const fetchTopics = async () => {
        try {
            const response = await fetch(`${API_URL}/topics`);
            const data = await response.json();
            setTopics(data.topics);
        } catch (error) {
            console.error("Error fetching topics:", error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await fetch(`${API_URL}/companies`);
            const data = await response.json();
            setCompanies(data.companies);
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    };

    const fetchDifficulties = async () => {
        try {
            const response = await fetch(`${API_URL}/difficulties`);
            const data = await response.json();
            setDifficulties(data.difficulties);
        } catch (error) {
            console.error("Error fetching difficulties:", error);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setResumeFile(file);
        setIsParsingResume(true);
        
        const formData = new FormData();
        formData.append("file", file);
        
        try {
            const response = await fetch(`${API_URL}/resume/parse`, {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                setResumeText(data.parsed_info);
                setResumeParsed(data.parsed_info);
            }
        } catch (error) {
            console.error("Resume parse error:", error);
        }
        setIsParsingResume(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const speakText = async (text) => {
        if (!enableTTS) return;
        
        // Use Web Speech API (browser built-in TTS - free & reliable)
        if ('speechSynthesis' in window) {
            setIsSpeaking(true);
            
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Try to get a good English voice
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(v => 
                v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
            ) || voices.find(v => v.lang.includes('en'));
            
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            window.speechSynthesis.speak(utterance);
        }
    };

    const startInterview = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch(`${API_URL}/interview/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    topic: selectedTopic, 
                    difficulty: selectedDifficulty,
                    company_style: selectedCompany,
                    enable_tts: enableTTS,
                    resume_text: resumeText || null,
                    job_description: jobDescription || null,
                    duration_minutes: selectedDuration
                })
            });
            const data = await response.json();
            
            setSessionId(data.session_id);
            setInterviewStarted(true);
            setConversationHistory([{ role: "assistant", content: data.opening_message }]);
            setQuestionCount(1);
            setRemainingTime(selectedDuration * 60);
            
            // Speak the opening message
            if (enableTTS) {
                speakText(data.opening_message);
            }
        } catch (error) {
            console.error("Error starting interview:", error);
        }
        setIsProcessing(false);
    };

    const endInterview = async () => {
        if (!sessionId) return;
        
        setIsProcessing(true);
        try {
            const response = await fetch(`${API_URL}/interview/${sessionId}/end`, {
                method: "POST"
            });
            const data = await response.json();
            
            setSummary(data);
            setShowSummary(true);
            setInterviewStarted(false);
            setSessionId(null);
        } catch (error) {
            console.error("Error ending interview:", error);
        }
        setIsProcessing(false);
    };

    const resetInterview = () => {
        setSessionId(null);
        setInterviewStarted(false);
        setConversationHistory([]);
        setQuestionCount(0);
        setShowSummary(false);
        setSummary(null);
        setAudioURL(null);
        setAudioBlob(null);
        setCurrentScore(null);
        setAverageScore(null);
        setDifficultyTrend("stable");
        setElapsedTime(0);
        setRemainingTime(0);
        setIsTimeWarning(false);
        setIsTimeUp(false);
        setSetupStep(1);
        setResumeFile(null);
        setResumeText("");
        setResumeParsed(null);
        setJobDescription("");
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Set up audio visualization
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;
            
            // Start visualization loop
            const updateLevel = () => {
                if (!isRecording) return;
                const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                analyserRef.current.getByteFrequencyData(dataArray);
                const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(avg / 255);
                requestAnimationFrame(updateLevel);
            };
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                setAudioBlob(blob);
                setAudioLevel(0);
                // Close audio context
                if (audioContextRef.current) {
                    audioContextRef.current.close();
                }
                // Auto-send after recording stops
                analyzeAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            
            // Start visualization after recording starts
            requestAnimationFrame(function updateLevel() {
                if (mediaRecorderRef.current?.state === 'recording' && analyserRef.current) {
                    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                    setAudioLevel(avg / 255);
                    requestAnimationFrame(updateLevel);
                }
            });
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const analyzeAudioBlob = async (blob) => {
        if (!blob || !sessionId) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append("file", blob, "audio.webm");

        try {
            const response = await fetch(`${API_URL}/interview/${sessionId}/analyze`, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            
            if (data.user_text) {
                setConversationHistory(prev => [
                    ...prev,
                    { role: "user", content: data.user_text, score: data.score }
                ]);
            }
            if (data.ai_response) {
                setConversationHistory(prev => [
                    ...prev,
                    { role: "assistant", content: data.ai_response }
                ]);
                
                // Speak AI response
                if (enableTTS) {
                    speakText(data.ai_response);
                }
            }
            if (data.question_number) {
                setQuestionCount(data.question_number);
            }
            if (data.score) {
                setCurrentScore(data.score);
            }
            if (data.average_score) {
                setAverageScore(data.average_score);
            }
            if (data.difficulty_trend) {
                setDifficultyTrend(data.difficulty_trend);
            }
        } catch (error) {
            console.error("Error sending audio:", error);
        }
        setIsProcessing(false);
    };

    // Render summary view
    if (showSummary && summary) {
        return (
            <div className="interview-container">
                <div className="summary-card">
                    <h2>🎉 Interview Complete!</h2>
                    <div className="summary-header">
                        <span className="topic-badge">{summary.topic}</span>
                        <span className="company-badge">{summary.company_style}</span>
                        <span className="difficulty-badge">{summary.difficulty}</span>
                    </div>
                    
                    {summary.scores && summary.scores.average && (
                        <div className="score-summary">
                            <div className="score-circle">
                                <span className="score-value">{summary.scores.average}</span>
                                <span className="score-label">/10</span>
                            </div>
                            <div className="score-details">
                                <p>📊 Questions: {summary.total_questions}</p>
                                <p>📈 Trend: {summary.scores.trend}</p>
                                <p>🎯 Range: {summary.scores.min} - {summary.scores.max}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="summary-content">
                        <h3>📋 Performance Analysis</h3>
                        <pre className="summary-text">{summary.summary}</pre>
                    </div>
                    <button onClick={resetInterview} className="btn btn-primary">
                        🔄 Start New Interview
                    </button>
                </div>
            </div>
        );
    }

    // Render setup view
    if (!interviewStarted) {
        return (
            <div className="interview-container">
                <div className="setup-card">
                    <h2>🎯 Setup Your Interview</h2>
                    
                    {/* Progress Steps */}
                    <div className="setup-progress">
                        <div className={`progress-step ${setupStep >= 1 ? 'active' : ''}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Basics</span>
                        </div>
                        <div className="progress-line"></div>
                        <div className={`progress-step ${setupStep >= 2 ? 'active' : ''}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">Context</span>
                        </div>
                        <div className="progress-line"></div>
                        <div className={`progress-step ${setupStep >= 3 ? 'active' : ''}`}>
                            <span className="step-number">3</span>
                            <span className="step-label">Start</span>
                        </div>
                    </div>

                    <div className="setup-form">
                        {/* Step 1: Basic Settings */}
                        {setupStep === 1 && (
                            <>
                                <div className="form-group">
                                    <label>📚 Interview Topic:</label>
                                    <select 
                                        value={selectedTopic} 
                                        onChange={(e) => setSelectedTopic(e.target.value)}
                                        className="topic-select"
                                    >
                                        {topics.map(topic => (
                                            <option key={topic.id} value={topic.id}>
                                                {topic.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>🏢 Company Style:</label>
                                    <select 
                                        value={selectedCompany} 
                                        onChange={(e) => setSelectedCompany(e.target.value)}
                                        className="topic-select"
                                    >
                                        {companies.map(company => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>📊 Difficulty Level:</label>
                                    <div className="difficulty-buttons">
                                        {difficulties.map(diff => (
                                            <button
                                                key={diff.id}
                                                className={`difficulty-btn ${selectedDifficulty === diff.id ? 'active' : ''}`}
                                                onClick={() => setSelectedDifficulty(diff.id)}
                                            >
                                                {diff.id === 'easy' ? '🟢' : diff.id === 'medium' ? '🟡' : '🔴'} {diff.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>⏱️ Interview Duration:</label>
                                    <div className="duration-buttons">
                                        {[15, 30, 45, 60].map(mins => (
                                            <button
                                                key={mins}
                                                className={`duration-btn ${selectedDuration === mins ? 'active' : ''}`}
                                                onClick={() => setSelectedDuration(mins)}
                                            >
                                                {mins} min
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="form-group toggle-group">
                                    <label>🔊 AI Voice (TTS):</label>
                                    <button 
                                        className={`toggle-btn ${enableTTS ? 'active' : ''}`}
                                        onClick={() => setEnableTTS(!enableTTS)}
                                    >
                                        {enableTTS ? '✅ On' : '❌ Off'}
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={() => setSetupStep(2)} 
                                    className="btn btn-primary btn-large"
                                >
                                    Next: Add Context →
                                </button>
                            </>
                        )}

                        {/* Step 2: Resume & Job Description */}
                        {setupStep === 2 && (
                            <>
                                <div className="form-group">
                                    <label>📄 Upload Resume (Optional):</label>
                                    <p className="form-hint">AI will personalize questions based on your experience</p>
                                    <input 
                                        type="file" 
                                        accept=".txt,.pdf,.doc,.docx"
                                        onChange={handleResumeUpload}
                                        className="file-input"
                                    />
                                    {isParsingResume && (
                                        <div className="parsing-indicator">
                                            <span className="spinner"></span> Parsing resume...
                                        </div>
                                    )}
                                    {resumeParsed && (
                                        <div className="resume-preview">
                                            <span className="success-icon">✅</span>
                                            <span>Resume parsed: {resumeFile?.name}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="form-group">
                                    <label>📋 Job Description (Optional):</label>
                                    <p className="form-hint">Paste job description to focus on relevant skills</p>
                                    <textarea 
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here..."
                                        className="jd-textarea"
                                        rows={5}
                                    />
                                </div>
                                
                                <div className="button-group">
                                    <button 
                                        onClick={() => setSetupStep(1)} 
                                        className="btn btn-secondary"
                                    >
                                        ← Back
                                    </button>
                                    <button 
                                        onClick={() => setSetupStep(3)} 
                                        className="btn btn-primary"
                                    >
                                        Next: Review →
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 3: Confirmation */}
                        {setupStep === 3 && (
                            <>
                                <div className="confirmation-summary">
                                    <h3>📋 Interview Configuration</h3>
                                    <div className="config-item">
                                        <span className="config-label">Topic:</span>
                                        <span className="config-value">{topics.find(t => t.id === selectedTopic)?.name}</span>
                                    </div>
                                    <div className="config-item">
                                        <span className="config-label">Company Style:</span>
                                        <span className="config-value">{companies.find(c => c.id === selectedCompany)?.name}</span>
                                    </div>
                                    <div className="config-item">
                                        <span className="config-label">Difficulty:</span>
                                        <span className="config-value">{selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}</span>
                                    </div>
                                    <div className="config-item">
                                        <span className="config-label">Duration:</span>
                                        <span className="config-value">{selectedDuration} minutes</span>
                                    </div>
                                    <div className="config-item">
                                        <span className="config-label">AI Voice:</span>
                                        <span className="config-value">{enableTTS ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                    <div className="config-item">
                                        <span className="config-label">Resume:</span>
                                        <span className="config-value">{resumeParsed ? '✅ Uploaded' : '❌ Not provided'}</span>
                                    </div>
                                    <div className="config-item">
                                        <span className="config-label">Job Description:</span>
                                        <span className="config-value">{jobDescription ? '✅ Provided' : '❌ Not provided'}</span>
                                    </div>
                                </div>
                                
                                <div className="button-group">
                                    <button 
                                        onClick={() => setSetupStep(2)} 
                                        className="btn btn-secondary"
                                    >
                                        ← Back
                                    </button>
                                    <button 
                                        onClick={startInterview} 
                                        disabled={isProcessing}
                                        className="btn btn-primary btn-large"
                                    >
                                        {isProcessing ? "Starting..." : "🚀 Start Interview"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Render interview view
    return (
        <div className="interview-container">
            {/* Hidden audio element for TTS */}
            <audio ref={ttsAudioRef} style={{ display: 'none' }} />
            
            {/* Interview Timer Bar */}
            <div className={`timer-bar ${isTimeWarning ? 'warning' : ''} ${isTimeUp ? 'time-up' : ''}`}>
                <div className="timer-info">
                    <span className="timer-elapsed">⏱️ {formatTime(elapsedTime)}</span>
                    <span className="timer-remaining">
                        {isTimeUp ? '⏰ Time\'s Up!' : `${formatTime(remainingTime)} remaining`}
                    </span>
                </div>
                <div className="timer-progress">
                    <div 
                        className="timer-progress-bar" 
                        style={{ width: `${Math.min(100, (elapsedTime / (selectedDuration * 60)) * 100)}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="interview-header">
                <div className="header-info">
                    <span className="topic-badge">{selectedTopic.toUpperCase()}</span>
                    <span className="company-badge">{selectedCompany.toUpperCase()}</span>
                    <span className="question-count">Q#{questionCount}</span>
                    {averageScore && (
                        <span className="score-badge">
                            ⭐ {averageScore}/10
                            {difficultyTrend === 'harder' && ' 📈'}
                            {difficultyTrend === 'easier' && ' 📉'}
                        </span>
                    )}
                </div>
                <div className="header-actions">
                    {isSpeaking && <span className="speaking-indicator">🔊 Speaking...</span>}
                    <button onClick={endInterview} className="btn btn-danger" disabled={isProcessing}>
                        End Interview
                    </button>
                </div>
            </div>

            <div className="chat-container">
                {conversationHistory.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === "assistant" ? "🤖" : "👤"}
                        </div>
                        <div className="message-content">
                            <div className="message-header">
                                <span className="message-role">
                                    {msg.role === "assistant" ? "Interviewer" : "You"}
                                </span>
                                {msg.score && (
                                    <span className="message-score">Score: {msg.score}/10</span>
                                )}
                            </div>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                
                {isProcessing && (
                    <div className="message assistant">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <span className="message-role">Interviewer</span>
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="recording-controls">
                {isRecording && (
                    <div className="recording-visualizer">
                        <div className="recording-timer">
                            <span className="rec-dot"></span>
                            REC {formatTime(recordingTime)}
                        </div>
                        <div className="audio-visualizer">
                            {[...Array(20)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="visualizer-bar"
                                    style={{ 
                                        height: `${Math.max(4, audioLevel * 100 * (0.5 + Math.random() * 0.5))}%`,
                                        animationDelay: `${i * 0.05}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                )}
                
                {!isRecording ? (
                    <button 
                        onClick={startRecording} 
                        disabled={isProcessing || isSpeaking}
                        className="btn btn-record"
                    >
                        🎤 {isSpeaking ? "Wait for AI..." : "Hold to Answer"}
                    </button>
                ) : (
                    <button 
                        onClick={stopRecording} 
                        className="btn btn-recording"
                    >
                        <span className="recording-pulse"></span>
                        🛑 Stop Recording
                    </button>
                )}
                
                {audioURL && !isProcessing && !isRecording && (
                    <audio src={audioURL} controls className="audio-playback" />
                )}
            </div>
        </div>
    );
};

export default AudioRecorder;