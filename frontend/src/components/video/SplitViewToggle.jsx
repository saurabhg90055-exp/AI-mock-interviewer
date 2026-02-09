import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, LayoutList, Columns } from 'lucide-react';
import './SplitViewToggle.css';

const VIEW_MODES = [
    { id: 'side-by-side', icon: Columns, label: 'Side by Side' },
    { id: 'stacked', icon: LayoutList, label: 'Stacked' },
    { id: 'focus', icon: LayoutGrid, label: 'Focus Mode' }
];

const SplitViewToggle = ({ 
    currentView = 'side-by-side',
    onViewChange,
    size = 'medium' 
}) => {
    return (
        <div className={`split-view-toggle ${size}`}>
            {VIEW_MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = currentView === mode.id;
                
                return (
                    <motion.button
                        key={mode.id}
                        className={`view-btn ${isActive ? 'active' : ''}`}
                        onClick={() => onViewChange?.(mode.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={mode.label}
                    >
                        <Icon size={size === 'small' ? 16 : 18} />
                        {size === 'large' && <span>{mode.label}</span>}
                        {isActive && (
                            <motion.div
                                className="active-indicator"
                                layoutId="viewIndicator"
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};

export default SplitViewToggle;
