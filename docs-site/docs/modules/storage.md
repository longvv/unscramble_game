---
id: storage
title: Storage Module
sidebar_position: 2
---

# Storage Module

The Storage Module handles data persistence using the browser's localStorage API.

## Purpose

This module provides a clean abstraction for saving and loading game data, including:
- Word lists
- Word images
- Game scores

## Implementation

The Storage Module implements the Repository Pattern:

```javascript
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
```

## Key Features

- **Error handling**: Robust error handling for localStorage operations
- **Default values**: When stored data is not available, sensible defaults are used
- **Separation of concerns**: Storage logic is isolated from game logic
- **Type safety**: JSON parsing and serialization is handled safely

## Public Methods

| Method | Description |
|--------|-------------|
| `getWords()` | Retrieves the word list from storage |
| `saveWords(words)` | Saves the word list to storage |
| `getWordImages()` | Retrieves word-to-image mappings from storage |
| `saveWordImages(wordImages)` | Saves word-to-image mappings to storage |
| `getScore()` | Retrieves the player's score from storage |
| `saveScore(score)` | Saves the player's score to storage |
| `clearAllData()` | Removes all game data from storage |

## Usage Example

```javascript
// Load words from storage
const words = StorageService.getWords();

// Save words to storage
StorageService.saveWords(['apple', 'banana', 'cat']);

// Get current score
const score = StorageService.getScore();

// Save new score
StorageService.saveScore(score + 10);
```

This implementation provides a simple, consistent interface for data persistence while handling all the complexities of serialization and error handling behind the scenes.
