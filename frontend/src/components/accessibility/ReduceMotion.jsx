import { useAccessibility } from './AccessibilityContext';

// Custom hook that respects reduce motion preference
export const useReducedMotion = () => {
    const { settings } = useAccessibility?.() || { settings: {} };
    
    // Also check system preference
    const prefersReducedMotion = 
        typeof window !== 'undefined' && 
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    
    return settings.reduceMotion || prefersReducedMotion;
};

// Animation variants that respect reduce motion
export const getMotionVariants = (reduceMotion) => ({
    hidden: reduceMotion 
        ? { opacity: 0 }
        : { opacity: 0, y: 20 },
    visible: reduceMotion 
        ? { opacity: 1 }
        : { opacity: 1, y: 0 },
    exit: reduceMotion 
        ? { opacity: 0 }
        : { opacity: 0, y: -20 }
});

// Transition settings that respect reduce motion
export const getTransition = (reduceMotion) => 
    reduceMotion 
        ? { duration: 0 }
        : { duration: 0.3, ease: 'easeOut' };

// Safe animation wrapper - use instead of motion.div when respecting reduce motion
export const safeAnimation = (animation, reduceMotion) => {
    if (reduceMotion) {
        return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0 }
        };
    }
    return animation;
};

export default useReducedMotion;
