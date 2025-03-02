---
id: developer-guide
title: Developer Guide
sidebar_position: 9
---

# Developer Guide

This developer guide provides instructions for developers who want to extend or modify the Word Scramble Game.

## Getting Started

### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript
- Any modern web browser
- A text editor or IDE (VS Code, Sublime Text, etc.)

### Project Setup

1. Clone or download the repository
2. No build tools or dependencies are required
3. Simply open the `index.html` file in your browser to run the game

## Project Structure

```
word-scramble-game/
├── index.html          # Main HTML file
├── style.css           # Styles for the game
├── manifest.json       # Progressive Web App manifest
├── js/                 # JavaScript modules
│   ├── config.js       # Game configuration
│   ├── eventbus.js     # Event communication system
│   ├── gamestate.js    # Centralized state management
│   ├── storage.js      # Data persistence
│   ├── audio.js        # Sound management
│   ├── ui-factory.js   # UI component creation
│   ├── word-manager.js # Word management
│   ├── wordcontroller.js # Word logic and control
│   ├── drag-drop.js    # Drag and drop functionality
│   ├── inputmanager.js # Unified input handling
│   ├── touch-drag.js   # Enhanced touch support
│   ├── game-controller.js # Main game logic
│   ├── service-worker.js # PWA service worker
│   └── main.js         # Entry point
├── docs/               # Documentation
└── README.md           # Project overview
```

## Architecture Overview

The game follows a modular architecture with the following main components:

1. **Config Module** - Centralized configuration
2. **EventBus Module** - Communication between modules
3. **GameState Module** - Centralized state management
4. **Storage Module** - Data persistence
5. **Audio Module** - Sound management
6. **UI Factory** - UI component creation
7. **Word Manager** - Word list management
8. **WordController** - Word loading and scrambling
9. **Drag-Drop Manager** - Drag and drop functionality
10. **InputManager** - Unified input handling
11. **TouchDragManager** - Enhanced touch support
12. **Game Controller** - Core game logic
13. **Main** - Application entry point

For a detailed explanation of the architecture, see the [Architecture Overview](architecture).

## Module Explanations

### EventBus Module

The EventBus provides a central communication system that allows modules to interact without direct dependencies. This publish-subscribe pattern improves code maintainability by decoupling components.

Key methods:
- `subscribe(eventName, callback)` - Listen for a specific event
- `publish(eventName, data)` - Broadcast an event with optional data
- `unsubscribe(eventName, callback)` - Stop listening for an event

Usage example:
```javascript
// Subscribe to an event
EventBus.subscribe('wordLoaded', function(data) {
    console.log('New word loaded:', data.word);
});

// Publish an event
EventBus.publish('wordLoaded', { word: 'apple', scrambled: 'plepa' });
```

### GameState Module

The GameState module provides centralized state management with a single source of truth for the application's state. It notifies subscribers when state changes occur.

Key methods:
- `getState()` - Get the current game state
- `get(property)` - Get a specific state property
- `update(newValues)` - Update state with new values
- `resetState()` - Reset state to initial values

Usage example:
```javascript
// Update state
GameState.update({
    score: GameState.get('score') + 10,
    hintUsed: false
});

// Get full state
const state = GameState.getState();
console.log('Current word:', state.currentWord);
```

### InputManager Module

The InputManager provides a unified interface for handling both mouse and touch input, making the game accessible on various devices.

Key features:
- Handles both mouse and touch events
- Provides consistent drag and drop behavior across devices
- Detects device capabilities and adjusts accordingly

Usage example:
```javascript
// Initialize input manager
InputManager.init();

// Check if the device supports touch
const isTouchDevice = InputManager.isTouchDevice();
```

## Game Flow

The game flow follows these main steps:

1. **Initialization**:
   - Main module initializes all components
   - EventBus and GameState are initialized first
   - Services and controllers are initialized next
   - Game Controller coordinates the game flow

2. **Word Loading**:
   - WordController selects a random word
   - Word is scrambled and displayed
   - Word image is loaded and displayed
   - Letter boxes are created for the answer

3. **Gameplay**:
   - User drags letters to the drop area
   - InputManager handles drag and drop interactions
   - GameController checks the answer when all letters are placed
   - Correct answers trigger celebration and update score
   - Wrong answers provide feedback for the user

4. **Word List Management**:
   - User can add custom words and images
   - WordManager handles word list operations
   - StorageService saves changes to localStorage

## Extending the Game

### Adding New Features

When adding new features to the game, consider which module should be responsible for the functionality. Here are some common extension scenarios:

#### Adding New Game Modes

To add a new game mode:

1. Create a new controller module (similar to `game-controller.js`)
2. Implement the game logic for your new mode
3. Subscribe to relevant events using EventBus
4. Update the UI to allow switching between game modes

Example:
```javascript
// time-attack-controller.js
const TimeAttackController = (function() {
    // Private state
    let _timeRemaining = 60; // 60 seconds
    let _timer = null;
    
    // Set up event subscriptions
    function _setupEventSubscriptions() {
        EventBus.subscribe('wordLoaded', function() {
            _resetTimer();
        });
        
        EventBus.subscribe('answerCorrect', function() {
            // Add bonus time
            _timeRemaining += 5;
            _updateTimerDisplay();
        });
    }
    
    function _startTimer() {
        _timer = setInterval(() => {
            _timeRemaining--;
            _updateTimerDisplay();
            
            if (_timeRemaining <= 0) {
                _endGame();
            }
        }, 1000);
    }
    
    function _updateTimerDisplay() {
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = `Time: ${_timeRemaining}s`;
        }
    }
    
    function _endGame() {
        clearInterval(_timer);
        EventBus.publish('gameOver', {
            score: GameState.get('score')
        });
    }
    
    // Public API
    return {
        init: function() {
            // Create timer UI
            const gameArea = document.querySelector('.game-area');
            const timerDisplay = document.createElement('div');
            timerDisplay.id = 'timer-display';
            timerDisplay.className = 'timer-display';
            timerDisplay.textContent = `Time: ${_timeRemaining}s`;
            gameArea.insertBefore(timerDisplay, gameArea.firstChild);
            
            // Set up event subscriptions
            _setupEventSubscriptions();
            
            // Start timer
            _startTimer();
            
            return this;
        },
        
        reset: function() {
            _timeRemaining = 60;
            _updateTimerDisplay();
            
            if (_timer) {
                clearInterval(_timer);
            }
            
            _startTimer();
            
            return this;
        }
    };
})();
```

#### Adding Custom UI Elements

To add new UI elements:

1. Extend the `UIFactory` module with new factory methods
2. Make sure to maintain consistent styling and functionality

Example:
```javascript
// Add a new method to UIFactory
UIFactory.createTimerDisplay = function(seconds) {
    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer-display';
    timerDisplay.textContent = `Time: ${seconds}s`;
    
    // Add styling
    timerDisplay.style.fontSize = '1.2rem';
    timerDisplay.style.fontWeight = 'bold';
    timerDisplay.style.color = '#5f27cd';
    timerDisplay.style.padding = '10px';
    timerDisplay.style.borderRadius = '5px';
    timerDisplay.style.backgroundColor = 'rgba(95, 39, 205, 0.1)';
    timerDisplay.style.marginBottom = '10px';
    
    return timerDisplay;
};
```

#### Adding New Sound Effects

To add new sound effects:

1. Add new audio elements to `index.html`
2. Update the `AudioService` module to include the new sounds

Example:
```html
<!-- Add to index.html -->
<audio id="timer-tick" src="sounds/tick.mp3" preload="auto"></audio>
```

```javascript
// Update AudioService init method
init: function() {
    // Initialize audio elements
    _sounds = {
        correct: _getAudioElement('correct-sound'),
        wrong: _getAudioElement('wrong-sound'),
        // ... existing sounds ...
        tick: _getAudioElement('timer-tick') // Add new sound
    };
    
    // ... rest of initialization ...
    
    return this;
}
```

### Implementing New Events

To add new events to the EventBus:

1. Choose descriptive event names that follow the existing naming convention
2. Subscribe to the events in the appropriate modules
3. Publish events with relevant data

Example:
```javascript
// Subscribe to a new event
EventBus.subscribe('timeRunningLow', function(data) {
    // Flash the timer display when time is running low
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.classList.add('warning');
    }
    
    // Play warning sound
    AudioService.playSound('tick');
});

// Publish the event when appropriate
function _updateTimer() {
    _timeRemaining--;
    
    // Notify when time is running low
    if (_timeRemaining <= 10) {
        EventBus.publish('timeRunningLow', {
            timeRemaining: _timeRemaining
        });
    }
}
```

### Implementing Custom Storage

The game uses localStorage by default, but you can implement different storage mechanisms by modifying the `StorageService` module:

```javascript
// Example: Using IndexedDB instead of localStorage
const StorageService = (function() {
    let _db = null;
    
    function _initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('WordScrambleDB', 1);
            
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                db.createObjectStore('gameData', { keyPath: 'key' });
            };
            
            request.onsuccess = function(event) {
                _db = event.target.result;
                resolve();
            };
            
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
    }
    
    // Public API
    return {
        init: async function() {
            await _initDatabase();
            return this;
        },
        
        getWords: async function() {
            return new Promise((resolve, reject) => {
                const transaction = _db.transaction(['gameData'], 'readonly');
                const store = transaction.objectStore('gameData');
                const request = store.get('words');
                
                request.onsuccess = function() {
                    resolve(request.result ? request.result.value : GameConfig.get('defaultWords'));
                };
                
                request.onerror = function() {
                    reject(request.error);
                };
            });
        },
        
        // Implement other methods similarly
    };
})();
```

## Mobile-Specific Considerations

The game supports mobile devices with touch interfaces through:

1. **InputManager**: Provides a unified API for mouse and touch events
2. **TouchDragManager**: Enhances touch support for better mobile experience
3. **Responsive Design**: CSS adjustments for different screen sizes

When extending the game for mobile, consider:

- Touch target sizes (buttons and draggable elements should be at least 44x44px)
- Touch event handling (use both mouse and touch events)
- Screen orientation changes
- Performance optimizations for mobile devices

## Progressive Web App Support

The game includes basic Progressive Web App (PWA) support through:

1. **manifest.json**: Defines app metadata and icons
2. **service-worker.js**: Provides offline access and caching

To enhance PWA support:

1. Update `manifest.json` with your app's information
2. Modify `service-worker.js` to cache your additional resources
3. Add more app icons in different sizes

## Best Practices

When extending or modifying the Word Scramble Game, follow these best practices:

1. **Maintain Modularity**: Keep each module focused on a single responsibility
2. **Use the Module Pattern**: Follow the existing pattern for encapsulation
3. **Use the EventBus**: Communicate between modules using events
4. **Update GameState**: Use the central state manager for game state
5. **Error Handling**: Implement robust error handling for all operations
6. **Documentation**: Add JSDoc comments for all new functions
7. **Consistent Naming**: Follow the existing naming conventions
8. **Testing**: Test your changes thoroughly, especially for edge cases

## Common Extension Points

### Module Interface Guidelines

When extending a module, maintain its public interface. If you need to add new functionality, extend the interface rather than modifying existing methods.

### Event Handling

When adding new UI interactions, follow the existing event handling patterns:

```javascript
// Example: Adding a double-click handler to letter tiles
UIFactory.createLetterTile = function(letter, dragStartCallback, dragEndCallback, dblClickCallback) {
    const tile = document.createElement('div');
    tile.className = 'letter-tile';
    tile.textContent = letter;
    tile.draggable = true;
    tile.id = `tile-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Add drag event listeners
    if (dragStartCallback) {
        tile.addEventListener('dragstart', dragStartCallback);
    }
    
    if (dragEndCallback) {
        tile.addEventListener('dragend', dragEndCallback);
    }
    
    // Add double-click listener
    if (dblClickCallback) {
        tile.addEventListener('dblclick', dblClickCallback);
    }
    
    return tile;
};
```

### Configuration Extensions

When adding new features that require configuration, extend the `GameConfig` module:

```javascript
// In config.js, add to the _config object
const _config = {
    // ... existing configuration ...
    
    // Add new configuration section
    timeAttackMode: {
        startTime: 60,
        timeBonus: {
            correctAnswer: 5,
            withHint: 2
        },
        penaltyTime: {
            wrongAnswer: 3
        }
    }
};
```

## Debugging Tips

1. **Event Debugging**: Use the browser console to log events
   ```javascript
   // Add this to debug events
   EventBus.subscribe('*', function(eventName, data) {
       console.log(`Event: ${eventName}`, data);
   });
   ```

2. **State Debugging**: Monitor state changes
   ```javascript
   // Add this to debug state changes
   EventBus.subscribe('stateChanged', function(data) {
       console.log('State changed:', data.changes);
   });
   ```

3. **Browser DevTools**: Use the browser's developer tools to:
   - Inspect elements and CSS
   - Set breakpoints in JavaScript
   - Monitor localStorage operations
   - Check for errors in the console

4. **Module Isolation**: Test modules in isolation
   ```javascript
   // Example: Test WordController in isolation
   WordController.getScrambledWord('testing'); // Should return a scrambled version
   ```

## Performance Considerations

1. **Event Handling**: Avoid excessive event publishing/subscribing
2. **DOM Manipulation**: Minimize direct DOM manipulation
3. **Mobile Performance**: Optimize touch event handling
4. **Image Optimization**: Use appropriately sized images
5. **Audio Handling**: Preload audio files and handle errors

## Conclusion

This developer guide provides a comprehensive overview of the Word Scramble Game architecture and how to extend it. By following the patterns and practices outlined here, you can add new features and functionality while maintaining the game's modular structure and code quality.

For more detailed information about specific modules, refer to the module documentation in the "Modules" section.