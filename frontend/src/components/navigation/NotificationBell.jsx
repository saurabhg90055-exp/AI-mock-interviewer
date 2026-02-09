import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Trash2, Award, Target, TrendingUp, Calendar, Star } from 'lucide-react';
import './NotificationBell.css';

const NOTIFICATION_ICONS = {
    achievement: Award,
    goal: Target,
    improvement: TrendingUp,
    reminder: Calendar,
    streak: Star,
    default: Bell
};

const NotificationBell = ({ notifications = [], onMarkRead, onClear, onClearAll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);
    
    const handleMarkAllRead = () => {
        notifications.forEach(n => {
            if (!n.read) onMarkRead?.(n.id);
        });
    };
    
    const formatTime = (timestamp) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };
    
    return (
        <div className="notification-bell" ref={dropdownRef}>
            <motion.button
                className={`bell-button ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
                <Bell size={20} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            className="unread-badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="notification-dropdown"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="notification-header">
                            <h3>Notifications</h3>
                            <div className="header-actions">
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} title="Mark all as read">
                                        <CheckCheck size={16} />
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button onClick={onClearAll} title="Clear all">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="empty-notifications">
                                    <Bell size={32} />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map((notif) => {
                                    const Icon = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.default;
                                    return (
                                        <motion.div
                                            key={notif.id}
                                            className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => onMarkRead?.(notif.id)}
                                        >
                                            <div className={`notif-icon ${notif.type || 'default'}`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="notif-content">
                                                <p className="notif-message">{notif.message}</p>
                                                <span className="notif-time">{formatTime(notif.timestamp)}</span>
                                            </div>
                                            <button
                                                className="notif-clear"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onClear?.(notif.id);
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
