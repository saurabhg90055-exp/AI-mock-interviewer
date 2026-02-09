import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Menu, X, Home, Mic, Video, BarChart3, 
    Settings, User, Trophy, HelpCircle, LogOut 
} from 'lucide-react';
import './MobileNav.css';

const MobileNav = ({ 
    currentPage = 'home',
    onNavigate,
    user,
    onLogout,
    onOpenSettings
}) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);
    
    const menuItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'audio', label: 'Audio Interview', icon: Mic },
        { id: 'video', label: 'Video Interview', icon: Video },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
        { id: 'settings', label: 'Settings', icon: Settings, action: onOpenSettings },
        { id: 'help', label: 'Help & Support', icon: HelpCircle },
    ];
    
    const handleNavClick = (item) => {
        if (item.action) {
            item.action();
        } else {
            onNavigate?.(item.id);
        }
        setIsOpen(false);
    };
    
    return (
        <>
            <button 
                className="mobile-menu-trigger"
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="mobile-nav-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />
                        
                        {/* Drawer */}
                        <motion.nav
                            className="mobile-nav-drawer"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="drawer-header">
                                <div className="drawer-brand">
                                    <span className="brand-icon">🎯</span>
                                    <span className="brand-name">ProCoach AI</span>
                                </div>
                                <button 
                                    className="drawer-close"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            {user && (
                                <div className="drawer-user">
                                    <div className="user-avatar">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="user-info">
                                        <span className="user-name">{user.name || 'Guest'}</span>
                                        <span className="user-level">Level {user.level || 1}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="drawer-menu">
                                {menuItems.map((item, index) => (
                                    <motion.button
                                        key={item.id}
                                        className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
                                        onClick={() => handleNavClick(item)}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                            
                            {user && (
                                <div className="drawer-footer">
                                    <button 
                                        className="logout-btn"
                                        onClick={() => {
                                            onLogout?.();
                                            setIsOpen(false);
                                        }}
                                    >
                                        <LogOut size={18} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default MobileNav;
