import React from 'react';
import { motion } from 'framer-motion';
import { 
    Accessibility, Eye, Type, MousePointer, Palette,
    Volume2, Keyboard, RotateCcw, Check
} from 'lucide-react';
import { useAccessibility } from './AccessibilityContext';
import './AccessibilityPanel.css';

const AccessibilityPanel = ({ isOpen, onClose }) => {
    const { settings, updateSetting, resetSettings } = useAccessibility();
    
    const fontSizeOptions = [
        { value: 'small', label: 'Small' },
        { value: 'normal', label: 'Normal' },
        { value: 'large', label: 'Large' },
        { value: 'xlarge', label: 'Extra Large' }
    ];
    
    const colorBlindOptions = [
        { value: 'none', label: 'None' },
        { value: 'protanopia', label: 'Protanopia (Red-blind)' },
        { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
        { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' }
    ];
    
    if (!isOpen) return null;
    
    return (
        <motion.div
            className="accessibility-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="accessibility-panel"
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                exit={{ x: 300 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="panel-header">
                    <div className="header-title">
                        <Accessibility size={20} />
                        <h3>Accessibility</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="panel-content">
                    {/* Visual Section */}
                    <div className="settings-section">
                        <h4><Eye size={16} /> Visual</h4>
                        
                        <div className="setting-item">
                            <label>
                                <span>Reduce Motion</span>
                                <small>Minimize animations and transitions</small>
                            </label>
                            <button
                                className={`toggle-btn ${settings.reduceMotion ? 'active' : ''}`}
                                onClick={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                                role="switch"
                                aria-checked={settings.reduceMotion}
                            >
                                {settings.reduceMotion && <Check size={14} />}
                            </button>
                        </div>
                        
                        <div className="setting-item">
                            <label>
                                <span>High Contrast</span>
                                <small>Increase color contrast for better visibility</small>
                            </label>
                            <button
                                className={`toggle-btn ${settings.highContrast ? 'active' : ''}`}
                                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                                role="switch"
                                aria-checked={settings.highContrast}
                            >
                                {settings.highContrast && <Check size={14} />}
                            </button>
                        </div>
                        
                        <div className="setting-item">
                            <label>
                                <span>Color Blind Mode</span>
                                <small>Adjust colors for color vision deficiency</small>
                            </label>
                            <select
                                value={settings.colorBlindMode}
                                onChange={(e) => updateSetting('colorBlindMode', e.target.value)}
                                className="setting-select"
                            >
                                {colorBlindOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Text Section */}
                    <div className="settings-section">
                        <h4><Type size={16} /> Text</h4>
                        
                        <div className="setting-item">
                            <label>
                                <span>Font Size</span>
                                <small>Adjust text size throughout the app</small>
                            </label>
                            <div className="size-selector">
                                {fontSizeOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`size-btn ${settings.fontSize === opt.value ? 'active' : ''}`}
                                        onClick={() => updateSetting('fontSize', opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Navigation Section */}
                    <div className="settings-section">
                        <h4><MousePointer size={16} /> Navigation</h4>
                        
                        <div className="setting-item">
                            <label>
                                <span>Keyboard Navigation</span>
                                <small>Enable full keyboard control</small>
                            </label>
                            <button
                                className={`toggle-btn ${settings.keyboardNavigation ? 'active' : ''}`}
                                onClick={() => updateSetting('keyboardNavigation', !settings.keyboardNavigation)}
                                role="switch"
                                aria-checked={settings.keyboardNavigation}
                            >
                                {settings.keyboardNavigation && <Check size={14} />}
                            </button>
                        </div>
                        
                        <div className="setting-item">
                            <label>
                                <span>Focus Indicators</span>
                                <small>Show visible focus outlines when navigating</small>
                            </label>
                            <button
                                className={`toggle-btn ${settings.focusIndicators ? 'active' : ''}`}
                                onClick={() => updateSetting('focusIndicators', !settings.focusIndicators)}
                                role="switch"
                                aria-checked={settings.focusIndicators}
                            >
                                {settings.focusIndicators && <Check size={14} />}
                            </button>
                        </div>
                        
                        <div className="setting-item">
                            <label>
                                <span>Screen Reader Mode</span>
                                <small>Optimize for screen reader usage</small>
                            </label>
                            <button
                                className={`toggle-btn ${settings.screenReaderMode ? 'active' : ''}`}
                                onClick={() => updateSetting('screenReaderMode', !settings.screenReaderMode)}
                                role="switch"
                                aria-checked={settings.screenReaderMode}
                            >
                                {settings.screenReaderMode && <Check size={14} />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Keyboard Shortcuts */}
                    <div className="settings-section">
                        <h4><Keyboard size={16} /> Keyboard Shortcuts</h4>
                        <div className="shortcuts-list">
                            <div className="shortcut-item">
                                <kbd>Space</kbd>
                                <span>Start/Stop recording</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>Enter</kbd>
                                <span>Submit answer</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>Esc</kbd>
                                <span>Close dialog/Cancel</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>Tab</kbd>
                                <span>Navigate between elements</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>?</kbd>
                                <span>Show all shortcuts</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="panel-footer">
                    <button className="reset-btn" onClick={resetSettings}>
                        <RotateCcw size={14} />
                        Reset to Defaults
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AccessibilityPanel;
