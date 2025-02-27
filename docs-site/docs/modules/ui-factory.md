---
id: ui-factory
title: UI Factory Module
sidebar_position: 4
---

# UI Factory Module

The UI Factory Module creates and manages UI elements using the Factory Pattern.

## Purpose

This module provides a consistent way to create UI elements throughout the application, ensuring:
- Consistent styling and behavior
- Proper event handler attachment
- Reusable UI components

## Implementation

The UI Factory uses the Factory Pattern to abstract element creation:

```javascript
const UIFactory = (function() {
    // Public API
    return {
        /**
         * Create a letter tile
         * @param {string} letter - Letter for the tile
         * @param {Function} dragStartCallback - Callback for dragstart event
         * @param {Function} dragEndCallback - Callback for dragend event
         * @returns {HTMLElement} Letter tile element
         */
        createLetterTile: function(letter, dragStartCallback, dragEndCallback) {
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
            
            return tile;
        },
        
        /**
         * Create a letter box for the drop area
         * @param {number} position - Position index of the letter box
         * @param {Object} dropCallbacks - Callbacks for drop events
         * @returns {HTMLElement} Letter box element
         */
        createLetterBox: function(position, dropCallbacks) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            letterBox.setAttribute('data-position', position);
            
            // Set up drop event listeners if callbacks provided
            if (dropCallbacks) {
                if (dropCallbacks.dragOver) {
                    letterBox.addEventListener('dragover', dropCallbacks.dragOver);
                }
                
                if (dropCallbacks.dragEnter) {
                    letterBox.addEventListener('dragenter', dropCallbacks.dragEnter);
                }
                
                if (dropCallbacks.dragLeave) {
                    letterBox.addEventListener('dragleave', dropCallbacks.dragLeave);
                }
                
                if (dropCallbacks.drop) {
                    letterBox.addEventListener('drop', dropCallbacks.drop);
                }
            }
            
            return letterBox;
        },
        
        /**
         * Create a word item for the word list
         * @param {string} word - The word
         * @param {string} imageUrl - URL or data URL for the word image
         * @param {Function} deleteCallback - Callback for delete button click
         * @returns {HTMLElement} Word item element
         */
        createWordItem: function(word, imageUrl, deleteCallback) {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.setAttribute('data-word', word);
            
            // Create image element if URL provided
            if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = word;
                img.className = 'word-item-image';
                wordItem.appendChild(img);
            }
            
            // Create word text
            const wordText = document.createElement('span');
            wordText.className = 'word-item-text';
            wordText.textContent = word;
            wordItem.appendChild(wordText);
            
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-word-btn';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            
            if (deleteCallback) {
                deleteBtn.addEventListener('click', () => deleteCallback(wordItem, word));
            }
            
            wordItem.appendChild(deleteBtn);
            
            return wordItem;
        },
        
        /**
         * Create celebration overlay content
         * @returns {Object} Object with created celebration elements
         */
        createCelebrationContent: function() {
            // Get random congratulation messages
            const headings = GameConfig.get('congratsMessages').headings;
            const messages = GameConfig.get('congratsMessages').messages;
            
            const heading = headings[Math.floor(Math.random() * headings.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];
            
            // Update celebration heading and message
            const celebrationOverlay = document.getElementById('celebration-overlay');
            const headingElement = celebrationOverlay.querySelector('h2');
            const messageElement = celebrationOverlay.querySelector('p');
            
            headingElement.textContent = heading;
            messageElement.textContent = message;
            
            return { heading, message };
        },
        
        /**
         * Create an image preview from a data URL
         * @param {string} dataUrl - Data URL for the image
         * @param {HTMLElement} previewElement - Element to show the preview
         */
        createImagePreview: function(dataUrl, previewElement) {
            if (!previewElement) return;
            
            previewElement.style.backgroundImage = `url('${dataUrl}')`;
            previewElement.classList.add('has-image');
        },
        
        /**
         * Reset image preview
         * @param {HTMLElement} previewElement - Element to reset
         */
        resetImagePreview: function(previewElement) {
            if (!previewElement) return;
            
            previewElement.style.backgroundImage = '';
            previewElement.classList.remove('has-image');
        }
    };
})();
```

## UI Elements Created

The factory creates various UI elements used throughout the game:

### Letter Tiles

![Letter Tile](https://via.placeholder.com/60x60/74b9ff/ffffff?text=A)

Draggable letter tiles with:
- Unique ID for drag and drop operations
- Event listeners for drag start and end
- Visual styling for the game's appearance

### Letter Boxes

![Letter Box](https://via.placeholder.com/60x60/ffffff/000000?text=_)

Drop targets for letter tiles with:
- Position data attribute for answer ordering
- Event listeners for drag and drop interactions
- Visual feedback for valid drop targets

### Word Items

Word list items with:
- Associated image (if available)
- Text display of the word
- Delete button with event handler

### Other Elements

- Celebration content with random messages
- Image previews for the word management system

## Benefits

- **Consistency**: All UI elements are created with consistent styling and behavior
- **Separation of concerns**: UI creation logic is separated from game logic
- **Reusability**: UI elements can be created anywhere in the application
- **Maintainability**: Changes to UI elements only need to be made in one place

## Usage Example

```javascript
// Create a letter tile
const tile = UIFactory.createLetterTile(
    'A', 
    DragDropManager.dragStart.bind(DragDropManager),
    DragDropManager.dragEnd.bind(DragDropManager)
);
scrambledWordElement.appendChild(tile);

// Create a letter box
const letterBox = UIFactory.createLetterBox(
    0, 
    DragDropManager.getLetterBoxCallbacks(checkAnswer)
);
dropArea.appendChild(letterBox);

// Create a word item
const wordItem = UIFactory.createWordItem(
    'apple',
    'https://example.com/apple.jpg',
    removeWordCallback
);
wordList.appendChild(wordItem);
```
