// Avatar Components
export { default as AIAvatar } from './avatar/AIAvatar';
export { default as Avatar3D } from './avatar/Avatar3D';

// Audio Components
export { default as AudioVisualizer } from './audio/AudioVisualizer';

// UI Components
export { default as RecordButton } from './ui/RecordButton';
export { default as Toast } from './ui/Toast';
export { default as ScoreBadge } from './ui/ScoreDisplay';
export { default as TypingIndicator } from './ui/TypingIndicator';
export { Spinner, PulseDots, Skeleton, PageLoader, LoadingText, AIThinking } from './ui/LoadingState';

// Interview Components
export { default as InterviewSetup } from './interview/InterviewSetup';
export { default as InterviewSummary } from './interview/InterviewSummary';

// Gamification Components
export { 
    useXPSystem,
    calculateXP,
    calculateLevel,
    LevelProgressBar,
    XPGainPopup,
    AchievementBadge,
    StreakCounter,
    AchievementUnlock,
    StatsWidget,
    ACHIEVEMENTS
} from './gamification/XPSystem';

// Dashboard Components
export { default as Dashboard } from './dashboard/Dashboard';

// Effects Components
export { default as ConfettiCelebration, useConfetti } from './effects/ConfettiCelebration';

// Theme Components
export { default as ThemeProvider, useTheme, ThemeSelector } from './theme/ThemeProvider';

// Settings Components
export { default as SettingsPanel } from './settings/SettingsPanel';
