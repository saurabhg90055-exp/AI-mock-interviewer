import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ 
    steps = [], 
    currentStep = 0, 
    orientation = 'horizontal',
    size = 'medium',
    onStepClick 
}) => {
    const getStepStatus = (index) => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'current';
        return 'upcoming';
    };
    
    return (
        <div className={`progress-indicator ${orientation} ${size}`}>
            {steps.map((step, index) => {
                const status = getStepStatus(index);
                const Icon = step.icon;
                
                return (
                    <React.Fragment key={step.id || index}>
                        <motion.div
                            className={`progress-step ${status}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => status !== 'upcoming' && onStepClick?.(index)}
                            role="button"
                            tabIndex={status !== 'upcoming' ? 0 : -1}
                            aria-label={`Step ${index + 1}: ${step.label} - ${status}`}
                        >
                            <div className="step-circle">
                                {status === 'completed' ? (
                                    <Check size={14} />
                                ) : Icon ? (
                                    <Icon size={14} />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            <div className="step-content">
                                <span className="step-label">{step.label}</span>
                                {step.description && (
                                    <span className="step-description">{step.description}</span>
                                )}
                            </div>
                        </motion.div>
                        
                        {index < steps.length - 1 && (
                            <div className={`step-connector ${index < currentStep ? 'completed' : ''}`}>
                                <div className="connector-line" />
                                {index < currentStep && (
                                    <motion.div
                                        className="connector-fill"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                    />
                                )}
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default ProgressIndicator;
