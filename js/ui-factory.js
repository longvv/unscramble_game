/**
 * UI Factory Module for Word Scramble Game
 * Creates and manages UI elements using the Factory Pattern
 */
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
            
            // Add number indicator
            const numberIndicator = document.createElement('div');
            numberIndicator.className = 'position-number';
            numberIndicator.textContent = position + 1; // Add 1 because position is zero-based
            letterBox.appendChild(numberIndicator);
            
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

// Export the module
window.UIFactory = UIFactory;
