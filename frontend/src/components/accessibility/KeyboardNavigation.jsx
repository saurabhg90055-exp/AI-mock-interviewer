import React, { useEffect, useRef } from 'react';
import { useAccessibility } from './AccessibilityContext';

const SkipLinks = () => {
    const { settings } = useAccessibility();
    
    if (!settings.keyboardNavigation) return null;
    
    return (
        <div className="skip-links" role="navigation" aria-label="Skip navigation">
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            <a href="#navigation" className="skip-link">
                Skip to navigation
            </a>
        </div>
    );
};

// Focus trap for modals
export const useFocusTrap = (isActive, containerRef) => {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;
        
        const container = containerRef.current;
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };
        
        container.addEventListener('keydown', handleKeyDown);
        firstElement?.focus();
        
        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [isActive, containerRef]);
};

// Live region announcer for screen readers
export const useLiveAnnouncer = () => {
    const announceRef = useRef(null);
    
    useEffect(() => {
        // Create live region if doesn't exist
        let liveRegion = document.getElementById('live-announcer');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'live-announcer';
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }
        announceRef.current = liveRegion;
        
        return () => {
            // Clean up on unmount
            if (liveRegion && liveRegion.parentNode) {
                // Don't remove - might be used by other components
            }
        };
    }, []);
    
    const announce = (message, priority = 'polite') => {
        if (!announceRef.current) return;
        
        announceRef.current.setAttribute('aria-live', priority);
        announceRef.current.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            if (announceRef.current) {
                announceRef.current.textContent = '';
            }
        }, 1000);
    };
    
    return { announce };
};

// Roving tabindex for lists/grids
export const useRovingTabIndex = (items, currentIndex, setCurrentIndex) => {
    const handleKeyDown = (e) => {
        let newIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                newIndex = (currentIndex + 1) % items.length;
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = (currentIndex - 1 + items.length) % items.length;
                break;
            case 'Home':
                e.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                newIndex = items.length - 1;
                break;
            default:
                return;
        }
        
        setCurrentIndex(newIndex);
    };
    
    return {
        handleKeyDown,
        getTabIndex: (index) => index === currentIndex ? 0 : -1
    };
};

export default SkipLinks;
