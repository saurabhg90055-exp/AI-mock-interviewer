import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items = [], onNavigate }) => {
    if (items.length === 0) return null;
    
    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                    <button 
                        className="breadcrumb-link home"
                        onClick={() => onNavigate?.('home')}
                        aria-label="Home"
                    >
                        <Home size={16} />
                    </button>
                </li>
                {items.map((item, index) => (
                    <li key={item.id || index} className="breadcrumb-item">
                        <ChevronRight size={14} className="breadcrumb-separator" />
                        {index === items.length - 1 ? (
                            <span className="breadcrumb-current" aria-current="page">
                                {item.icon && <item.icon size={14} />}
                                {item.label}
                            </span>
                        ) : (
                            <motion.button
                                className="breadcrumb-link"
                                onClick={() => onNavigate?.(item.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {item.icon && <item.icon size={14} />}
                                {item.label}
                            </motion.button>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
