/**
 * Storage Module for Word Scramble Game
 * This module handles data persistence using localStorage
 * Follows the Repository Pattern
 */
const StorageService = (function() {
    // Private methods
    
    /**
     * Safely parse JSON from localStorage
     * @param {string} key - The localStorage key
     * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
     * @returns {*} Parsed value or default
     */
    function _safelyGetItem(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error retrieving ${key} from localStorage:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Safely store JSON in localStorage
     * @param {string} key - The localStorage key
     * @param {*} value - Value to store
     */
    function _safelySetItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
            return false;
        }
    }
    
    // Public API
    return {
        /**
         * Get words from storage
         * @returns {Array} Array of words
         */
        getWords: function() {
            return _safelyGetItem(
                GameConfig.get('storage').words, 
                GameConfig.get('defaultWords')
            );
        },
        
        /**
         * Save words to storage
         * @param {Array} words - Array of words to save
         * @returns {boolean} Success status
         */
        saveWords: function(words) {
            return _safelySetItem(GameConfig.get('storage').words, words);
        },
        
        /**
         * Get word images from storage
         * @returns {Object} Word to image mapping
         */
        getWordImages: function() {
            return _safelyGetItem(
                GameConfig.get('storage').wordImages, 
                GameConfig.get('defaultWordImages')
            );
        },
        
        /**
         * Save word images to storage
         * @param {Object} wordImages - Word to image mapping
         * @returns {boolean} Success status
         */
        saveWordImages: function(wordImages) {
            return _safelySetItem(GameConfig.get('storage').wordImages, wordImages);
        },
        
        /**
         * Get score from storage
         * @returns {number} Current score
         */
        getScore: function() {
            return _safelyGetItem(GameConfig.get('storage').score, 0);
        },
        
        /**
         * Save score to storage
         * @param {number} score - Score to save
         * @returns {boolean} Success status
         */
        saveScore: function(score) {
            return _safelySetItem(GameConfig.get('storage').score, score);
        },
        
        /**
         * Clear all game data from storage
         * @returns {boolean} Success status
         */
        clearAllData: function() {
            try {
                localStorage.removeItem(GameConfig.get('storage').words);
                localStorage.removeItem(GameConfig.get('storage').wordImages);
                localStorage.removeItem(GameConfig.get('storage').score);
                return true;
            } catch (error) {
                console.error('Error clearing game data:', error);
                return false;
            }
        }
    };
})();

// Export the module
window.StorageService = StorageService;
