/**
 * Improved WordController Module for Word Scramble Game
 * Handles word management, loading, and scrambling with improved letter box creation
 */
const WordController = (function() {
    // Private state
    let _elements = {
        dropArea: null,
        scrambledWordElement: null
    };
    
    // Private methods
    
    /**
     * Scramble a word using Fisher-Yates shuffle
     * @param {string} word - Word to scramble
     * @returns {string} Scrambled word
     */
    function _scrambleWord(word) {
        const wordArray = word.split('');
        
        // Fisher-Yates shuffle
        for (let i = wordArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
        }
        
        let scrambled = wordArray.join('');
        
        // If scrambled word is the same as original, try again
        if (scrambled === word && word.length > 1) {
            return _scrambleWord(word);
        }
        
        return scrambled;
    }
    
    /**
     * Display the scrambled word in the UI with improved tile creation
     * @param {string} scrambledWord - The scrambled word to display
     */
    function _displayScrambledWord(scrambledWord) {
        if (!_elements.scrambledWordElement) {
            console.error('Scrambled word element not found');
            return;
        }
        
        // Clear existing content
        _elements.scrambledWordElement.innerHTML = '';
        
        // Ensure DragDropManager is available
        if (!window.DragDropManager) {
            console.error('DragDropManager not found or not initialized');
            return;
        }
        
        // Create letter tiles for each character
        for (let i = 0; i < scrambledWord.length; i++) {
            const letter = scrambledWord[i];
            
            // Create a letter tile
            let letterTile = document.createElement('div');
            letterTile.className = 'letter-tile';
            letterTile.textContent = letter;
            letterTile.draggable = true;
            letterTile.id = `tile-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`;
            
            // Add drag event listeners
            letterTile.addEventListener('dragstart', window.DragDropManager.dragStart);
            letterTile.addEventListener('dragend', window.DragDropManager.dragEnd);
            
            // Add to scrambled word area
            _elements.scrambledWordElement.appendChild(letterTile);
        }
    }
    
    /**
     * Create letter boxes in the drop area with improved positioning
     * @param {string} word - The current word
     */
    function _createLetterBoxes(word) {
        if (!_elements.dropArea) {
            console.error('Drop area element not found');
            return;
        }
        
        // Clear existing content
        _elements.dropArea.innerHTML = '';
        
        // Get the callbacks for letter boxes
        let dropCallbacks = null;
        if (window.DragDropManager && typeof window.DragDropManager.getLetterBoxCallbacks === 'function') {
            dropCallbacks = window.DragDropManager.getLetterBoxCallbacks(() => {
                if (window.EventBus) {
                    window.EventBus.publish('allLettersPlaced', null);
                }
            });
        }
        
        // Create a letter box for each character
        for (let i = 0; i < word.length; i++) {
            // Create letter box
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            letterBox.setAttribute('data-position', i);
            
            // Add position number indicator (positioned absolutely within the box)
            const numberIndicator = document.createElement('div');
            numberIndicator.className = 'position-number';
            numberIndicator.textContent = i + 1; // Add 1 because position is zero-based
            letterBox.appendChild(numberIndicator);
            
            // Add event listeners for drag and drop
            if (dropCallbacks) {
                if (dropCallbacks.dragOver) letterBox.addEventListener('dragover', dropCallbacks.dragOver);
                if (dropCallbacks.dragEnter) letterBox.addEventListener('dragenter', dropCallbacks.dragEnter);
                if (dropCallbacks.dragLeave) letterBox.addEventListener('dragleave', dropCallbacks.dragLeave);
                if (dropCallbacks.drop) letterBox.addEventListener('drop', dropCallbacks.drop);
            }
            
            _elements.dropArea.appendChild(letterBox);
        }
    }
    
    /**
     * Display word image
     * @param {string} imageUrl - Image URL for the word
     * @param {string} word - The current word for alt text
     */
    function _displayWordImage(imageUrl, word) {
        const wordImageElement = document.getElementById('word-image');
        if (!wordImageElement) return;
        
        if (imageUrl) {
            wordImageElement.src = imageUrl;
            wordImageElement.alt = word;
        } else {
            // Use a placeholder or generated image
            const placeholderUrl = `https://source.unsplash.com/300x200/?${encodeURIComponent(word)}`;
            wordImageElement.src = placeholderUrl;
            wordImageElement.alt = word;
        }
    }
    
    /**
     * Load the next word
     * @returns {boolean} Success status
     */
    async function _loadNextWord() {
        try {
            // Safety check for GameState
            if (!window.GameState || typeof window.GameState.getState !== 'function') {
                console.error('GameState not properly initialized');
                return false;
            }
            
            const gameState = window.GameState.getState();
            
            // Reset hint status
            window.GameState.update({
                hintUsed: false
            });
            
            let availableWords = gameState.availableWords || [];
            
            // If no words available, get words from Word Manager
            if (availableWords.length === 0) {
                if (window.WordManager && typeof window.WordManager.getWords === 'function') {
                    availableWords = window.WordManager.getWords();
                } else {
                    console.warn('WordManager not properly initialized, using fallback words');
                }
                
                // Fallback to default words if still no words available
                if (!availableWords || availableWords.length === 0) {
                    if (window.GameConfig && typeof window.GameConfig.get === 'function') {
                        availableWords = window.GameConfig.get('defaultWords');
                    } else {
                        // Hard-coded fallback if GameConfig is not available
                        availableWords = [
                            'apple', 'banana', 'cat', 'dog', 'elephant', 
                            'flower', 'garden', 'house', 'ice', 'jungle'
                        ];
                    }
                    console.log('Using fallback words');
                }
                
                // Update available words in state
                window.GameState.update({
                    availableWords
                });
            }
            
            // Get a random word
            const randomIndex = Math.floor(Math.random() * availableWords.length);
            const currentWord = availableWords[randomIndex];
            
            // Remove word from available words
            const updatedWords = [...availableWords];
            updatedWords.splice(randomIndex, 1);
            
            // Get image URL for word
            let currentImageUrl = null;

            // First try to get the image from DatabaseService (preferred)
            if (window.DatabaseService && typeof window.DatabaseService.getWordImages === 'function') {
                try {
                    const dbWordImages = await window.DatabaseService.getWordImages();
                    currentImageUrl = dbWordImages[currentWord.toLowerCase()];
                } catch (error) {
                    console.warn('Error getting image from DatabaseService:', error);
                }
            }
            
            // If no image from DatabaseService, try WordManager
            if (!currentImageUrl && window.WordManager && typeof window.WordManager.getWordImage === 'function') {
                currentImageUrl = window.WordManager.getWordImage(currentWord);
            } 
            
            // If still no image, try legacy StorageService
            if (!currentImageUrl && window.StorageService && typeof window.StorageService.getWordImages === 'function') {
                const wordImages = window.StorageService.getWordImages();
                currentImageUrl = wordImages[currentWord.toLowerCase()];
            }
            
            // Scramble the word
            const scrambledWord = _scrambleWord(currentWord);
            
            // Update state
            window.GameState.update({
                currentWord,
                scrambledWord,
                currentImageUrl,
                availableWords: updatedWords
            });
            
            // Set up pronunciation
            if (window.AudioService && typeof window.AudioService.setupPronunciation === 'function') {
                window.AudioService.setupPronunciation(currentWord);
            }
            
            // Display word image
            _displayWordImage(currentImageUrl, currentWord);
            
            // Create letter boxes in drop area
            _createLetterBoxes(currentWord);
            
            // Display scrambled word
            _displayScrambledWord(scrambledWord);
            
            // Reset check button
            const checkBtn = document.getElementById('check-btn');
            if (checkBtn) {
                checkBtn.disabled = false;
            }
            
            // Publish event for new word loaded
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('wordLoaded', {
                    word: currentWord,
                    scrambled: scrambledWord
                });
            }
            
            return true;
        } catch (error) {
            console.error('Error loading next word:', error);
            
            // Fallback to a simple word in case of error
            const currentWord = 'apple';
            const scrambledWord = 'pplea';
            
            if (window.GameState && typeof window.GameState.update === 'function') {
                window.GameState.update({
                    currentWord,
                    scrambledWord
                });
            }
            
            // Create letter boxes and display fallback word
            _createLetterBoxes(currentWord);
            _displayScrambledWord(scrambledWord);
            
            // Publish error event
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('wordLoadError', {
                    error,
                    fallbackWord: currentWord
                });
            }
            
            return false;
        }
    }
    
    /**
     * Show a hint (first letter)
     * @returns {boolean} Success status
     */
    function _showHint() {
        try {
            // Safety check for GameState
            if (!window.GameState || typeof window.GameState.update !== 'function') {
                console.error('GameState not properly initialized');
                return false;
            }
            
            // Mark hint as used
            window.GameState.update({
                hintUsed: true
            });
            
            // Play hint sound
            if (window.AudioService && typeof window.AudioService.playSound === 'function') {
                window.AudioService.playSound('hint');
            }
            
            const gameState = window.GameState.getState();
            
            // Find the first letter of the current word
            const firstLetter = gameState.currentWord.charAt(0);
            
            // Find matching letter in the scrambled word area
            const scrambledWordElement = document.getElementById('scrambled-word');
            if (!scrambledWordElement) {
                console.error('Scrambled word element not found');
                return false;
            }
            
            const letterTiles = scrambledWordElement.querySelectorAll('.letter-tile');
            let matchingTile = null;
            
            for (const tile of letterTiles) {
                if (tile.textContent.toLowerCase() === firstLetter.toLowerCase()) {
                    matchingTile = tile;
                    break;
                }
            }
            
            if (matchingTile) {
                // Get the first letter box
                const firstLetterBox = _elements.dropArea.querySelector('.letter-box[data-position="0"]');
                
                // If first letter box is empty
                if (firstLetterBox && !firstLetterBox.querySelector('.letter-tile')) {
                    // Move the tile to the first letter box
                    firstLetterBox.appendChild(matchingTile);
                    
                    // Publish hint applied event
                    if (window.EventBus && typeof window.EventBus.publish === 'function') {
                        window.EventBus.publish('hintApplied', {
                            letter: firstLetter,
                            position: 0
                        });
                    }
                    
                    // Check if answer is now complete
                    const allBoxesFilled = _elements.dropArea.querySelectorAll('.letter-box:empty').length === 0;
                    if (allBoxesFilled && window.EventBus) {
                        window.EventBus.publish('allLettersPlaced', null);
                    }
                    
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error showing hint:', error);
            
            // Publish error event
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('hintError', {
                    error
                });
            }
            
            return false;
        }
    }
    
    // Public API
    return {
        /**
         * Initialize word controller
         * @returns {Object} WordController for chaining
         */
        init: function() {
            // Get DOM elements
            _elements = {
                dropArea: document.getElementById('drop-area'),
                scrambledWordElement: document.getElementById('scrambled-word')
            };
            
            if (!_elements.dropArea) {
                console.error('Drop area element not found during initialization');
            }
            
            if (!_elements.scrambledWordElement) {
                console.error('Scrambled word element not found during initialization');
            }
            
            // Subscribe to events if EventBus is available
            if (window.EventBus && typeof window.EventBus.subscribe === 'function') {
                window.EventBus.subscribe('hintButtonClicked', () => {
                    this.showHint();
                });
                
                window.EventBus.subscribe('nextButtonClicked', () => {
                    this.loadNextWord();
                });
                
                // Subscribe to state changes related to words
                window.EventBus.subscribe('stateChanged', (data) => {
                    if (data && data.changes && data.changes.scrambledWord) {
                        _displayScrambledWord(data.changes.scrambledWord.newValue);
                    }
                });
            } else {
                console.warn('EventBus not available, button events will not work');
            }
            
            return this;
        },
        
        /**
         * Load next word (exposed for external access)
         * @returns {boolean} Success status
         */
        loadNextWord: function() {
            return _loadNextWord();
        },
        
        /**
         * Show hint (exposed for external access)
         * @returns {boolean} Success status
         */
        showHint: function() {
            return _showHint();
        },
        
        /**
         * Get scrambled version of a word
         * @param {string} word - Word to scramble
         * @returns {string} Scrambled word
         */
        getScrambledWord: function(word) {
            return _scrambleWord(word);
        },
    };
})();

window.EventBus.subscribe('pronounceButtonClicked', () => {
    // Call the pronounceWord method from AudioService
    if (window.AudioService && typeof window.AudioService.pronounceWord === 'function') {
        window.AudioService.pronounceWord();
    }
});

// Export the module
window.WordController = WordController;