import { useEffect, useCallback } from 'react';

// Keyboard shortcuts configuration
const defaultShortcuts = {
    'Ctrl+Enter': 'submit_answer',
    'Ctrl+R': 'start_recording',
    'Ctrl+S': 'stop_recording',
    'Escape': 'cancel_action',
    'Ctrl+N': 'new_interview',
    'Ctrl+H': 'toggle_hint',
    'Ctrl+/': 'show_shortcuts',
    'Space': 'toggle_pause',
};

export const useKeyboardShortcuts = (handlers = {}, enabled = true) => {
    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;
        
        // Don't trigger shortcuts when typing in input fields
        if (
            event.target.tagName === 'INPUT' ||
            event.target.tagName === 'TEXTAREA' ||
            event.target.isContentEditable
        ) {
            // Only allow Escape in input fields
            if (event.key !== 'Escape') return;
        }

        // Build the key combination string
        const keys = [];
        if (event.ctrlKey || event.metaKey) keys.push('Ctrl');
        if (event.shiftKey) keys.push('Shift');
        if (event.altKey) keys.push('Alt');
        
        // Add the actual key
        let key = event.key;
        if (key === ' ') key = 'Space';
        if (key.length === 1) key = key.toUpperCase();
        keys.push(key);

        const combo = keys.join('+');
        
        // Check if we have a handler for this combo
        const action = defaultShortcuts[combo];
        if (action && handlers[action]) {
            event.preventDefault();
            handlers[action](event);
        }
    }, [handlers, enabled]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return { shortcuts: defaultShortcuts };
};

// Keyboard shortcuts help overlay
export const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const categories = {
        'Recording': [
            { keys: 'Ctrl + R', action: 'Start recording' },
            { keys: 'Ctrl + S', action: 'Stop recording' },
            { keys: 'Space', action: 'Toggle pause' },
        ],
        'Navigation': [
            { keys: 'Ctrl + Enter', action: 'Submit answer' },
            { keys: 'Ctrl + N', action: 'New interview' },
            { keys: 'Escape', action: 'Cancel/Close' },
        ],
        'Help': [
            { keys: 'Ctrl + H', action: 'Toggle hint' },
            { keys: 'Ctrl + /', action: 'Show shortcuts' },
        ],
    };

    return (
        <div className="shortcuts-overlay" onClick={onClose}>
            <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="shortcuts-content">
                    {Object.entries(categories).map(([category, shortcuts]) => (
                        <div key={category} className="shortcut-category">
                            <h3>{category}</h3>
                            <div className="shortcut-list">
                                {shortcuts.map(({ keys, action }) => (
                                    <div key={keys} className="shortcut-item">
                                        <kbd className="shortcut-keys">
                                            {keys.split(' + ').map((key, i) => (
                                                <span key={i}>
                                                    {i > 0 && <span className="key-sep">+</span>}
                                                    <span className="key">{key}</span>
                                                </span>
                                            ))}
                                        </kbd>
                                        <span className="shortcut-action">{action}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="shortcuts-footer">
                    <p>Press <kbd>Esc</kbd> to close</p>
                </div>
            </div>
            <style>{`
                .shortcuts-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .shortcuts-modal {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow: hidden;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                }
                
                .shortcuts-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .shortcuts-header h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #fff;
                }
                
                .close-btn {
                    width: 32px;
                    height: 32px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s ease;
                }
                
                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .shortcuts-content {
                    padding: 1.5rem;
                    overflow-y: auto;
                    max-height: 50vh;
                }
                
                .shortcut-category {
                    margin-bottom: 1.5rem;
                }
                
                .shortcut-category:last-child {
                    margin-bottom: 0;
                }
                
                .shortcut-category h3 {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6366f1;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 0.75rem;
                }
                
                .shortcut-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .shortcut-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                }
                
                .shortcut-keys {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-family: inherit;
                    background: transparent;
                    border: none;
                }
                
                .key {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.25rem 0.5rem;
                    background: rgba(99, 102, 241, 0.2);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 4px;
                    color: #a5b4fc;
                    font-size: 0.75rem;
                    font-weight: 600;
                    min-width: 24px;
                }
                
                .key-sep {
                    color: rgba(255, 255, 255, 0.3);
                    margin: 0 0.25rem;
                }
                
                .shortcut-action {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.875rem;
                }
                
                .shortcuts-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    text-align: center;
                }
                
                .shortcuts-footer p {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.75rem;
                }
                
                .shortcuts-footer kbd {
                    padding: 0.125rem 0.375rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    font-family: inherit;
                }
            `}</style>
        </div>
    );
};

export default useKeyboardShortcuts;
