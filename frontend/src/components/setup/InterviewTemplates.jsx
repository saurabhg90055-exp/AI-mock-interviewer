import React from 'react';
import { motion } from 'framer-motion';
import { 
    Building2, Rocket, Zap, Target, Clock, 
    Users, Code, Brain, Briefcase, CheckCircle 
} from 'lucide-react';
import './InterviewTemplates.css';

const TEMPLATES = [
    {
        id: 'faang',
        name: 'FAANG Prep',
        description: 'Prepare for top tech companies with algorithmic and system design focus',
        icon: Building2,
        color: '#6366f1',
        duration: 45,
        topics: ['Technical', 'System Design', 'Behavioral'],
        difficulty: 'hard',
        questionCount: 8,
        features: ['LP-based questions', 'Complexity analysis', 'Scale focus']
    },
    {
        id: 'startup',
        name: 'Startup Ready',
        description: 'Fast-paced interview style for startup environments',
        icon: Rocket,
        color: '#f97316',
        duration: 30,
        topics: ['General', 'Technical', 'Behavioral'],
        difficulty: 'medium',
        questionCount: 6,
        features: ['Versatility focus', 'Product thinking', 'Move fast mentality']
    },
    {
        id: 'behavioral',
        name: 'Behavioral Deep Dive',
        description: 'STAR method mastery with leadership scenarios',
        icon: Users,
        color: '#10b981',
        duration: 30,
        topics: ['Behavioral', 'Leadership'],
        difficulty: 'medium',
        questionCount: 5,
        features: ['STAR format', 'Conflict resolution', 'Leadership examples']
    },
    {
        id: 'technical',
        name: 'Technical Intensive',
        description: 'Heavy focus on coding and technical problem solving',
        icon: Code,
        color: '#8b5cf6',
        duration: 60,
        topics: ['Technical', 'System Design'],
        difficulty: 'hard',
        questionCount: 10,
        features: ['Algorithm design', 'Code review', 'Architecture']
    },
    {
        id: 'case-study',
        name: 'Case Study Pro',
        description: 'Business case analysis and strategic thinking',
        icon: Brain,
        color: '#ec4899',
        duration: 45,
        topics: ['Case Study', 'Behavioral'],
        difficulty: 'hard',
        questionCount: 4,
        features: ['Framework thinking', 'Market analysis', 'Data interpretation']
    },
    {
        id: 'quick-practice',
        name: 'Quick Practice',
        description: 'Short session for daily practice',
        icon: Zap,
        color: '#fbbf24',
        duration: 15,
        topics: ['General'],
        difficulty: 'easy',
        questionCount: 3,
        features: ['Quick feedback', 'Daily habit', 'Confidence boost']
    }
];

const InterviewTemplates = ({ onSelect, selectedId }) => {
    return (
        <div className="interview-templates">
            <div className="templates-header">
                <h3>Interview Templates</h3>
                <p>Choose a pre-configured setup or customize your own</p>
            </div>
            
            <div className="templates-grid">
                {TEMPLATES.map((template, index) => {
                    const Icon = template.icon;
                    const isSelected = selectedId === template.id;
                    
                    return (
                        <motion.button
                            key={template.id}
                            className={`template-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => onSelect?.(template)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSelected && (
                                <div className="selected-badge">
                                    <CheckCircle size={16} />
                                </div>
                            )}
                            
                            <div 
                                className="template-icon"
                                style={{ 
                                    background: `linear-gradient(135deg, ${template.color}20, ${template.color}10)`,
                                    color: template.color 
                                }}
                            >
                                <Icon size={24} />
                            </div>
                            
                            <h4 className="template-name">{template.name}</h4>
                            <p className="template-desc">{template.description}</p>
                            
                            <div className="template-meta">
                                <span className="meta-item">
                                    <Clock size={14} />
                                    {template.duration} min
                                </span>
                                <span className="meta-item">
                                    <Target size={14} />
                                    {template.questionCount} Q's
                                </span>
                                <span className={`difficulty-tag ${template.difficulty}`}>
                                    {template.difficulty}
                                </span>
                            </div>
                            
                            <div className="template-topics">
                                {template.topics.map(topic => (
                                    <span key={topic} className="topic-tag">{topic}</span>
                                ))}
                            </div>
                            
                            <div className="template-features">
                                {template.features.map((feature, i) => (
                                    <span key={i} className="feature-item">
                                        <CheckCircle size={12} />
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export { TEMPLATES };
export default InterviewTemplates;
