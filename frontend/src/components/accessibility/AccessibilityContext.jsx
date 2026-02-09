import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
};

export const AccessibilityProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('accessibility-settings');
        return saved ? JSON.parse(saved) : {
            reduceMotion: false,
            highContrast: false,
            largeText: false,
            screenReaderMode: false,
            keyboardNavigation: true,
            focusIndicators: true,
            fontSize: 'normal', // small, normal, large, xlarge
            colorBlindMode: 'none' // none, protanopia, deuteranopia, tritanopia
        };
    });
    
    useEffect(() => {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));
        
        // Apply settings to document
        const root = document.documentElement;
        
        // Reduce motion
        if (settings.reduceMotion) {
            root.style.setProperty('--motion-duration', '0s');
            root.classList.add('reduce-motion');
        } else {
            root.style.setProperty('--motion-duration', '0.3s');
            root.classList.remove('reduce-motion');
        }
        
        // High contrast
        root.classList.toggle('high-contrast', settings.highContrast);
        
        // Font size
        const fontSizes = {
            small: '14px',
            normal: '16px',
            large: '18px',
            xlarge: '20px'
        };
        root.style.setProperty('--base-font-size', fontSizes[settings.fontSize] || '16px');
        
        // Color blind modes
        root.dataset.colorBlindMode = settings.colorBlindMode;
        
        // Focus indicators
        root.classList.toggle('show-focus', settings.focusIndicators);
        
    }, [settings]);
    
    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const resetSettings = () => {
        setSettings({
            reduceMotion: false,
            highContrast: false,
            largeText: false,
            screenReaderMode: false,
            keyboardNavigation: true,
            focusIndicators: true,
            fontSize: 'normal',
            colorBlindMode: 'none'
        });
    };
    
    // Check for prefers-reduced-motion
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleChange = (e) => {
            if (e.matches && !settings.reduceMotion) {
                updateSetting('reduceMotion', true);
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        if (mediaQuery.matches && !settings.reduceMotion) {
            updateSetting('reduceMotion', true);
        }
        
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    
    return (
        <AccessibilityContext.Provider value={{
            settings,
            updateSetting,
            resetSettings
        }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export default AccessibilityProvider;
