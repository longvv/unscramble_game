/**
 * Audio Module for Word Scramble Game
 * Handles all sound effects and pronunciations
 */
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
            
            const ttsUrl = `${GameConfig.get('apis').textToSpeech}${encodeURIComponent(word)}`;
            _pronunciationAudio.src = ttsUrl;
            _pronunciationAudio.load();
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

// Export the module
window.AudioService = AudioService;
