---
id: config
title: Config Module
sidebar_position: 1
---

# Config Module

The Configuration Module serves as a central repository for all game settings and default values.

## Purpose

This module provides a single source of truth for game settings, making it easier to modify behavior across the application by changing values in one place.

## Implementation

The Config Module uses the Module Pattern to provide encapsulation:

```javascript
const GameConfig = (function() {
    // Private configuration settings
    const _config = {
        // Game settings
        scoreIncrement: {
            withoutHint: 10,
            withHint: 5
        },
        
        // Timing settings
        celebrationDuration: 3000, // 3 seconds
        
        // Sound URLs
        sounds: {
            correct: "https://assets.mixkit.co/sfx/preview/mixkit-fairy-arcade-sparkle-866.mp3",
            wrong: "https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3",
            drag: "https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3",
            hint: "https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3",
            clapping: "https://assets.mixkit.co/sfx/preview/mixkit-small-crowd-ovation-437.mp3",
            whistle: "https://assets.mixkit.co/sfx/preview/mixkit-referee-whistle-blow-2317.mp3"
        },
        
        // Default words
        defaultWords: [
            'apple', 'banana', 'cat', 'dog', 'elephant', 
            'flower', 'garden', 'house', 'ice cream', 'jungle',
            'kite', 'lion', 'monkey', 'nest', 'orange', 'penguin'
        ],
        
        // Default word images
        defaultWordImages: {
            "apple": "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=300",
            "banana": "https://images.unsplash.com/photo-1587132137056-bd0b52f945a0?w=300",
            // ... other word images ...
        },
        
        // Local storage keys
        storage: {
            words: 'gameWords',
            wordImages: 'gameWordImages',
            score: 'gameScore'
        },
    };
    
    // Public API
    return {
        get: function(key) {
            return _config[key];
        }
    };
})();
```

## Usage

Other modules access configuration values using the `get` method:

```javascript
const hintScore = GameConfig.get('scoreIncrement').withHint;
const defaultWords = GameConfig.get('defaultWords');
const soundURL = GameConfig.get('sounds').correct;
```

This approach centralizes configuration, making it easier to modify application behavior without changes to multiple files.

## Configuration Categories

The configuration module contains several categories of settings:

1. **Game Settings**: Points, timing, etc.
2. **Sound URLs**: Paths to sound effect files
3. **API Endpoints**: External service URLs (like text-to-speech)
4. **Default Words**: Initial word list
5. **Default Word Images**: Image URLs for default words
6. **Storage Keys**: LocalStorage key names

## Benefits

- **Centralized Configuration**: All settings in one place
- **Consistent Access**: Standard getter interface
- **Encapsulation**: Internal config structure is hidden
- **Default Values**: Fallbacks for when saved data is not available
