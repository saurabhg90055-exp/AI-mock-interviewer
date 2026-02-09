import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, Search, ChevronDown, ChevronUp, 
    MessageSquare, Star, Copy, Check 
} from 'lucide-react';
import './QuestionBank.css';

const QuestionBank = ({ 
    questions = [], // [{ id, question, answer, score, topic, date, feedback }]
    onQuestionSelect 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [filterTopic, setFilterTopic] = useState('all');
    const [sortBy, setSortBy] = useState('date'); // date, score
    
    const topics = ['all', ...new Set(questions.map(q => q.topic))];
    
    const filteredQuestions = questions
        .filter(q => {
            const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.answer?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTopic = filterTopic === 'all' || q.topic === filterTopic;
            return matchesSearch && matchesTopic;
        })
        .sort((a, b) => {
            if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
            return new Date(b.date) - new Date(a.date);
        });
        
    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    
    const getScoreColor = (score) => {
        if (score >= 8) return '#10b981';
        if (score >= 6) return '#6366f1';
        if (score >= 4) return '#fbbf24';
        return '#ef4444';
    };
    
    return (
        <div className="question-bank">
            <div className="bank-header">
                <div className="header-title">
                    <BookOpen size={20} />
                    <h3>Question Bank</h3>
                    <span className="question-count">{questions.length} questions</span>
                </div>
            </div>
            
            <div className="bank-controls">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search questions or answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="filter-controls">
                    <select 
                        value={filterTopic} 
                        onChange={(e) => setFilterTopic(e.target.value)}
                        className="filter-select"
                    >
                        {topics.map(topic => (
                            <option key={topic} value={topic}>
                                {topic === 'all' ? 'All Topics' : topic}
                            </option>
                        ))}
                    </select>
                    
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="date">Most Recent</option>
                        <option value="score">Highest Score</option>
                    </select>
                </div>
            </div>
            
            <div className="questions-list">
                {filteredQuestions.length === 0 ? (
                    <div className="empty-questions">
                        <MessageSquare size={32} />
                        <p>No questions found</p>
                        <span>Complete interviews to build your question bank</span>
                    </div>
                ) : (
                    filteredQuestions.map((q, index) => (
                        <motion.div
                            key={q.id}
                            className={`question-item ${expandedId === q.id ? 'expanded' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <div 
                                className="question-header"
                                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                            >
                                <div className="question-info">
                                    <span className="topic-tag">{q.topic}</span>
                                    <p className="question-text">{q.question}</p>
                                </div>
                                <div className="question-meta">
                                    {q.score && (
                                        <span 
                                            className="score-badge"
                                            style={{ backgroundColor: `${getScoreColor(q.score)}20`, color: getScoreColor(q.score) }}
                                        >
                                            <Star size={12} />
                                            {q.score}/10
                                        </span>
                                    )}
                                    {expandedId === q.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {expandedId === q.id && (
                                    <motion.div
                                        className="question-details"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        <div className="answer-section">
                                            <div className="section-header">
                                                <span>Your Answer</span>
                                                <button
                                                    className="copy-btn"
                                                    onClick={() => handleCopy(q.answer, q.id)}
                                                >
                                                    {copiedId === q.id ? <Check size={14} /> : <Copy size={14} />}
                                                    {copiedId === q.id ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                            <p className="answer-text">{q.answer || 'No answer recorded'}</p>
                                        </div>
                                        
                                        {q.feedback && (
                                            <div className="feedback-section">
                                                <span className="section-header">AI Feedback</span>
                                                <p className="feedback-text">{q.feedback}</p>
                                            </div>
                                        )}
                                        
                                        <div className="question-footer">
                                            <span className="date-text">
                                                {new Date(q.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QuestionBank;
