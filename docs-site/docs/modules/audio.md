---
id: audio
title: Audio Module
sidebar_position: 3
---

# Audio Module

The Audio Module manages all sound effects and word pronunciations in the game.

## Purpose

This module provides a clean interface for playing sounds and handling audio-related functionality, including:
- Game sound effects (correct answer, wrong answer, etc.)
- Word pronunciation using text-to-speech with local file fallback
- Celebration sound sequences

## Implementation

The Audio Module uses the Module Pattern for encapsulation:

```javascript
const AudioService = (function() {
    // Private audio elements
    let _sounds = {};
    let _pronunciationAudio = null;
    
    // Private methods
    
    /**
     * Load an audio element
     * @param {string} id - Element ID
     * @returns {HTMLAudioElement} Audio element
     */
    function _getAudioElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Audio element with ID ${id} not found.`);
            return null;
        }
        return element;
    }
    
    /**
     * Play an audio element with error handling
     * @param {HTMLAudioElement} audio - Audio element to play
     */
    function _playWithErrorHandling(audio) {
        if (!audio) return;
        
        try {
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.error(`Error playing audio:`, error);
            });
        } catch (error) {
            console.error(`Error with audio playback:`, error);
        }
    }
    
    // Public API
    return {
        /**
         * Initialize audio elements
         * @returns {Object} AudioService for chaining
         */
        init: function() {
            // Initialize audio elements
            _sounds = {
                correct: _getAudioElement('correct-sound'),
                wrong: _getAudioElement('wrong-sound'),
                drag: _getAudioElement('drag-sound'),
                hint: _getAudioElement('hint-sound'),
                clapping: _getAudioElement('clapping-sound'),
                whistle: _getAudioElement('whistle-sound')
            };
            
            _pronunciationAudio = _getAudioElement('pronunciation');
            
            // Preload audio
            Object.values(_sounds).forEach(sound => {
                if (sound) sound.load();
            });
            
            return this;
        },
        
        /**
         * Play a sound effect
         * @param {string} soundType - Type of sound to play
         * @returns {boolean} Success status
         */
        playSound: function(soundType) {
            const audio = _sounds[soundType];
            if (!audio) {
                console.error(`Sound type '${soundType}' not found.`);
                return false;
            }
            
            _playWithErrorHandling(audio);
            return true;
        },
        
        /**
         * Set up pronunciation for a word
         * @param {string} word - Word to pronounce
         * @returns {boolean} Success status
         */
        setupPronunciation: function(word) {
            if (!_pronunciationAudio) return false;
            
            // Check if we have a local pronunciation file
            const localPronunciationPath = `assets/sounds/pronunciations/${word.toLowerCase().replace(/\s+/g, '-')}.mp3`;
            
            // Try to fetch the local file first
            fetch(localPronunciationPath, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        // Local pronunciation file exists, use it
                        _pronunciationAudio.src = localPronunciationPath;
                    } else {
                        // Fall back to Google TTS API
                        const ttsUrl = `${GameConfig.get('apis').textToSpeech}${encodeURIComponent(word)}`;
                        _pronunciationAudio.src = ttsUrl;
                    }
                    _pronunciationAudio.load();
                })
                .catch(() => {
                    // Error checking for local file, fall back to Google TTS API
                    const ttsUrl = `${GameConfig.get('apis').textToSpeech}${encodeURIComponent(word)}`;
                    _pronunciationAudio.src = ttsUrl;
                    _pronunciationAudio.load();
                });
            
            return true;
        },
        
        /**
         * Pronounce the current word
         * @returns {boolean} Success status
         */
        pronounceWord: function() {
            if (!_pronunciationAudio) return false;
            
            _playWithErrorHandling(_pronunciationAudio);
            return true;
        },
        
        /**
         * Play celebration sounds
         * @returns {boolean} Success status
         */
        playCelebration: function() {
            this.playSound('correct');
            
            // Play whistle with a slight delay
            setTimeout(() => {
                this.playSound('whistle');
            }, 300);
            
            // Play clapping with a slight delay
            setTimeout(() => {
                this.playSound('clapping');
            }, 600);
            
            return true;
        }
    };
})();
```

## Key Features

- **Robust error handling**: Graceful handling of audio playback errors
- **Text-to-speech integration**: API for word pronunciation with local file fallback
- **Sound sequencing**: Timed playback of multiple sounds for celebrations
- **Centralized audio management**: All audio logic in one module
- **Offline support**: Local sound files with fallback to online TTS when available

## HTML Audio Elements

The module relies on audio elements defined in the HTML:

```html
<!-- Audio elements -->
<audio id="correct-sound" src="assets/sounds/correct-sound.mp3" preload="auto"></audio>
<audio id="wrong-sound" src="assets/sounds/wrong-sound.mp3" preload="auto"></audio>
<audio id="drag-sound" src="assets/sounds/drag-sound.mp3" preload="auto"></audio>
<audio id="hint-sound" src="assets/sounds/hint-sound.mp3" preload="auto"></audio>
<audio id="pronunciation" src="" preload="auto"></audio>
<audio id="clapping-sound" src="assets/sounds/clapping-sound.mp3" preload="auto"></audio>
<audio id="whistle-sound" src="assets/sounds/whistle-sound.mp3" preload="auto"></audio>
```

## Public Methods

| Method | Description |
|--------|-------------|
| `init()` | Initializes all audio elements and preloads sounds |
| `playSound(soundType)` | Plays a specific sound effect |
| `setupPronunciation(word)` | Sets up pronunciation for a word with local file fallback |
| `pronounceWord()` | Plays the current word's pronunciation |
| `playCelebration()` | Plays a sequence of celebration sounds |

## Text-to-Speech Implementation

The module uses a fallback mechanism for word pronunciation:

1. First, it checks for a local pronunciation file in the `assets/sounds/pronunciations/` directory
2. If a local file exists, it uses that file for pronunciation
3. If no local file is found, it falls back to Google's Text-to-Speech API:

```javascript
setupPronunciation: function(word) {
    if (!_pronunciationAudio) return false;
    
    // Check if we have a local pronunciation file
    const localPronunciationPath = `assets/sounds/pronunciations/${word.toLowerCase().replace(/\s+/g, '-')}.mp3`;
    
    // Try to fetch the local file first
    fetch(localPronunciationPath, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                // Local pronunciation file exists, use it
                _pronunciationAudio.src = localPronunciationPath;
            } else {
                // Fall back to Google TTS API
                const ttsUrl = `${GameConfig.get('apis').textToSpeech}${encodeURIComponent(word)}`;
                _pronunciationAudio.src = ttsUrl;
            }
            _pronunciationAudio.load();
        })
        .catch(() => {
            // Error checking for local file, fall back to Google TTS API
            const ttsUrl = `${GameConfig.get('apis').textToSpeech}${encodeURIComponent(word)}`;
            _pronunciationAudio.src = ttsUrl;
            _pronunciationAudio.load();
        });
    
    return true;
}
```

This provides better offline support while still leveraging the online TTS API when available, helping children learn word pronunciation along with spelling.
