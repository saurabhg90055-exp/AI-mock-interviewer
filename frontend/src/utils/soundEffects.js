/**
 * Sound Effects System
 * Provides audio feedback for various app interactions
 */

class SoundEffectsManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.loaded = false;
    
    // Define sound effects with their configurations
    this.soundConfigs = {
      // Recording sounds
      startRecording: { frequency: 880, duration: 0.15, type: 'sine', volume: 0.4 },
      stopRecording: { frequency: 440, duration: 0.2, type: 'sine', volume: 0.4 },
      
      // AI interaction sounds
      aiThinking: { frequency: 523, duration: 0.1, type: 'sine', volume: 0.2, repeat: 3, interval: 0.15 },
      aiSpeaking: { frequency: 659, duration: 0.1, type: 'sine', volume: 0.3 },
      
      // Feedback sounds
      goodScore: { frequencies: [523, 659, 784], duration: 0.15, type: 'sine', volume: 0.4 },
      badScore: { frequencies: [392, 330], duration: 0.2, type: 'sine', volume: 0.3 },
      
      // UI sounds
      click: { frequency: 1000, duration: 0.05, type: 'sine', volume: 0.2 },
      success: { frequencies: [523, 659, 784, 1047], duration: 0.12, type: 'sine', volume: 0.4 },
      error: { frequency: 200, duration: 0.3, type: 'sawtooth', volume: 0.3 },
      notification: { frequencies: [800, 1000], duration: 0.1, type: 'sine', volume: 0.3 },
      
      // Session sounds
      sessionStart: { frequencies: [392, 523, 659], duration: 0.2, type: 'sine', volume: 0.4 },
      sessionEnd: { frequencies: [784, 659, 523, 392], duration: 0.25, type: 'sine', volume: 0.4 },
      
      // Timer sounds
      timeWarning: { frequency: 600, duration: 0.3, type: 'square', volume: 0.3, repeat: 2, interval: 0.4 },
      timeUp: { frequency: 400, duration: 0.5, type: 'square', volume: 0.4, repeat: 3, interval: 0.3 }
    };
    
    this.audioContext = null;
  }

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  init() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.loaded = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  /**
   * Play a synthesized sound
   */
  playTone(frequency, duration, type = 'sine', volume = 0.5) {
    if (!this.enabled || !this.audioContext) {
      this.init();
      if (!this.audioContext) return;
    }

    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // Apply volume with fade out
    gainNode.gain.setValueAtTime(volume * this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Play a chord (multiple frequencies)
   */
  playChord(frequencies, duration, type = 'sine', volume = 0.5, stagger = 0) {
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, duration, type, volume / frequencies.length);
      }, index * stagger * 1000);
    });
  }

  /**
   * Play a named sound effect
   */
  play(soundName) {
    if (!this.enabled) return;
    
    const config = this.soundConfigs[soundName];
    if (!config) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }

    // Handle multiple frequencies (chord)
    if (config.frequencies) {
      this.playChord(
        config.frequencies, 
        config.duration, 
        config.type, 
        config.volume,
        config.stagger || 0.08
      );
    } 
    // Handle repeated sounds
    else if (config.repeat) {
      for (let i = 0; i < config.repeat; i++) {
        setTimeout(() => {
          this.playTone(config.frequency, config.duration, config.type, config.volume);
        }, i * (config.interval || 0.2) * 1000);
      }
    }
    // Single tone
    else {
      this.playTone(config.frequency, config.duration, config.type, config.volume);
    }
  }

  /**
   * Set global volume (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Enable/disable sound effects
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Toggle sound effects
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Create singleton instance
const soundEffects = new SoundEffectsManager();

// Export both the class and singleton
export { SoundEffectsManager };
export default soundEffects;
