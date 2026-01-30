import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
    dark: {
        name: 'Dark',
        colors: {
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
            surface: 'rgba(255, 255, 255, 0.05)',
            surfaceHover: 'rgba(255, 255, 255, 0.1)',
            border: 'rgba(255, 255, 255, 0.1)',
            text: '#ffffff',
            textMuted: 'rgba(255, 255, 255, 0.6)',
            primary: '#6366f1',
            primaryHover: '#818cf8',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            accent: '#ec4899'
        }
    },
    light: {
        name: 'Light',
        colors: {
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 50%, #d0d5dc 100%)',
            surface: 'rgba(255, 255, 255, 0.9)',
            surfaceHover: 'rgba(255, 255, 255, 1)',
            border: 'rgba(0, 0, 0, 0.1)',
            text: '#1a1a2e',
            textMuted: 'rgba(0, 0, 0, 0.6)',
            primary: '#4f46e5',
            primaryHover: '#6366f1',
            secondary: '#7c3aed',
            success: '#059669',
            warning: '#d97706',
            error: '#dc2626',
            accent: '#db2777'
        }
    },
    midnight: {
        name: 'Midnight',
        colors: {
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)',
            surface: 'rgba(30, 41, 59, 0.8)',
            surfaceHover: 'rgba(30, 41, 59, 1)',
            border: 'rgba(71, 85, 105, 0.5)',
            text: '#f8fafc',
            textMuted: 'rgba(248, 250, 252, 0.6)',
            primary: '#3b82f6',
            primaryHover: '#60a5fa',
            secondary: '#8b5cf6',
            success: '#22c55e',
            warning: '#eab308',
            error: '#f43f5e',
            accent: '#06b6d4'
        }
    },
    sunset: {
        name: 'Sunset',
        colors: {
            background: 'linear-gradient(135deg, #1a0a1a 0%, #2d1b3d 50%, #4a2c4a 100%)',
            surface: 'rgba(74, 44, 74, 0.5)',
            surfaceHover: 'rgba(74, 44, 74, 0.7)',
            border: 'rgba(236, 72, 153, 0.2)',
            text: '#fdf2f8',
            textMuted: 'rgba(253, 242, 248, 0.6)',
            primary: '#ec4899',
            primaryHover: '#f472b6',
            secondary: '#f97316',
            success: '#10b981',
            warning: '#fbbf24',
            error: '#f43f5e',
            accent: '#a855f7'
        }
    },
    forest: {
        name: 'Forest',
        colors: {
            background: 'linear-gradient(135deg, #0a1a0a 0%, #1a2e1a 50%, #2d4a2d 100%)',
            surface: 'rgba(45, 74, 45, 0.5)',
            surfaceHover: 'rgba(45, 74, 45, 0.7)',
            border: 'rgba(34, 197, 94, 0.2)',
            text: '#f0fdf4',
            textMuted: 'rgba(240, 253, 244, 0.6)',
            primary: '#22c55e',
            primaryHover: '#4ade80',
            secondary: '#84cc16',
            success: '#10b981',
            warning: '#fbbf24',
            error: '#ef4444',
            accent: '#06b6d4'
        }
    },
    ocean: {
        name: 'Ocean',
        colors: {
            background: 'linear-gradient(135deg, #0a1a2e 0%, #0f3460 50%, #16537e 100%)',
            surface: 'rgba(22, 83, 126, 0.5)',
            surfaceHover: 'rgba(22, 83, 126, 0.7)',
            border: 'rgba(6, 182, 212, 0.2)',
            text: '#ecfeff',
            textMuted: 'rgba(236, 254, 255, 0.6)',
            primary: '#06b6d4',
            primaryHover: '#22d3ee',
            secondary: '#3b82f6',
            success: '#10b981',
            warning: '#fbbf24',
            error: '#f43f5e',
            accent: '#a855f7'
        }
    }
};

const ThemeContext = createContext({
    theme: themes.dark,
    themeName: 'dark',
    setTheme: () => {},
    availableThemes: Object.keys(themes)
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [themeName, setThemeName] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved && themes[saved] ? saved : 'dark';
    });

    const theme = themes[themeName];

    useEffect(() => {
        localStorage.setItem('theme', themeName);
        
        // Apply CSS variables
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });
        
        // Apply background to body
        document.body.style.background = theme.colors.background;
        
        // Set data-theme attribute for CSS targeting
        document.documentElement.setAttribute('data-theme', themeName);
        document.body.setAttribute('data-theme', themeName);
        
        // Set color scheme for browser UI elements
        if (themeName === 'light') {
            document.documentElement.style.colorScheme = 'light';
        } else {
            document.documentElement.style.colorScheme = 'dark';
        }
    }, [themeName, theme]);

    const setTheme = (name) => {
        if (themes[name]) {
            setThemeName(name);
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            themeName,
            setTheme,
            availableThemes: Object.keys(themes),
            themes
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Theme Selector Component
export const ThemeSelector = () => {
    const { themeName, setTheme, themes, availableThemes } = useTheme();

    return (
        <div className="theme-selector">
            <label className="theme-label">Theme</label>
            <div className="theme-options">
                {availableThemes.map((name) => (
                    <button
                        key={name}
                        className={`theme-option ${themeName === name ? 'active' : ''}`}
                        onClick={() => setTheme(name)}
                        style={{
                            background: themes[name].colors.primary
                        }}
                        title={themes[name].name}
                    />
                ))}
            </div>
        </div>
    );
};

export default ThemeProvider;
