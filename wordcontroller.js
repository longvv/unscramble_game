/**
 * WordController Module for Word Scramble Game
 * Handles word management, loading, and scrambling
 */
const WordController = (function() {
    // Private state (minimized since GameState is now the source of truth)
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
     * Display the scrambled word in the UI
     * @param {string} scrambledWord - The scrambled word to display
     */
    function _displayScrambledWord(scrambledWord) {
        if (!_elements.scrambledWordElement) return;
        
        // Clear existing content
        _elements.scrambledWordElement.innerHTML = '';
        
        // Create letter tiles for each character
        for (let i = 0; i < scrambledWord.length; i++) {
            const letter = scrambledWord[i];
            
            // Create a letter tile
            const letterTile = window.UIFactory.createLetterTile(
                letter,
                window.DragDropManager.dragStart.bind(window.DragDropManager),
                window.DragDropManager.dragEnd.bind(window.DragDropManager)
            );
            
            // Add to scrambled word area
            _elements.scrambledWordElement.appendChild(letterTile);
        }
    }
    
    /**
     * Create letter boxes in the drop area
     * @param {string} word - The current word
     */
    function _createLetterBoxes(word) {
        if (!_elements.dropArea) return;
        
        // Clear existing content
        _elements.dropArea.innerHTML = '';
        
        // Get the callbacks for letter boxes
        const dropCallbacks = window.DragDropManager.getLetterBoxCallbacks(() => {
            window.EventBus.publish('allLettersPlaced', null);
        });
        
        // Create a letter box for each character
        for (let i = 0; i < word.length; i++) {
            const letterBox = window.UIFactory.createLetterBox(i, dropCallbacks);
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
    function _loadNextWord() {
        try {
            const gameState = window.GameState.getState();
            
            // Reset hint status
            window.GameState.update({
                hintUsed: false
            });
            
            let availableWords = gameState.availableWords;
            
            // If no words available, get words from Word Manager
            if (availableWords.length === 0) {
                availableWords = window.WordManager.getWords();
                
                // Fallback to default words if still no words available
                if (!availableWords || availableWords.length === 0) {
                    availableWords = window.GameConfig.get('defaultWords');
                    console.log('Using fallback words');
                }
                
                // Update available words in state
                window.GameState.update({
                    availableWords
                });
            }
            
            // Choose a random word
            const randomIndex = Math.floor(Math.random() * availableWords.length);
            const currentWord = availableWords[randomIndex];
            
            // Remove word from available words
            const updatedWords = [...availableWords];
            updatedWords.splice(randomIndex, 1);
            
            // Get image URL for word
            const currentImageUrl = window.WordManager.getWordImage(currentWord);
            
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
            window.AudioService.setupPronunciation(currentWord);
            
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
            window.EventBus.publish('wordLoaded', {
                word: currentWord,
                scrambled: scrambledWord
            });
            
            return true;
        } catch (error) {
            console.error('Error loading next word:', error);
            
            // Fallback to a simple word in case of error
            const currentWord = 'apple';
            const scrambledWord = 'pplea';
            
            window.GameState.update({
                currentWord,
                scrambledWord
            });
            
            // Create letter boxes and display fallback word
            _createLetterBoxes(currentWord);
            _displayScrambledWord(scrambledWord);
            
            // Publish error event
            window.EventBus.publish('wordLoadError', {
                error,
                fallbackWord: currentWord
            });
            
            return false;
        }
    }
    
    /**
     * Show a hint (first letter)
     * @returns {boolean} Success status
     */
    function _showHint() {
        try {
            // Mark hint as used
            window.GameState.update({
                hintUsed: true
            });
            
            // Play hint sound
            window.AudioService.playSound('hint');
            
            const gameState = window.GameState.getState();
            
            // Find the first letter of the current word
            const firstLetter = gameState.currentWord.charAt(0);
            
            // Find matching letter in the scrambled word area
            const scrambledWordElement = document.getElementById('scrambled-word');
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
                if (firstLetterBox && !firstLetterBox.hasChildNodes()) {
                    // Clone the tile
                    const clone = matchingTile.cloneNode(true);
                    clone.addEventListener('dragstart', window.DragDropManager.dragStart.bind(window.DragDropManager));
                    clone.addEventListener('dragend', window.DragDropManager.dragEnd.bind(window.DragDropManager));
                    
                    // Add to first letter box
                    firstLetterBox.appendChild(clone);
                    
                    // Remove original tile
                    matchingTile.remove();
                    
                    // Publish hint applied event
                    window.EventBus.publish('hintApplied', {
                        letter: firstLetter,
                        position: 0
                    });
                    
                    // Check if answer is now complete
                    const allBoxesFilled = _elements.dropArea.querySelectorAll('.letter-box:empty').length === 0;
                    if (allBoxesFilled) {
                        window.EventBus.publish('allLettersPlaced', null);
                    }
                    
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error showing hint:', error);
            
            // Publish error event
            window.EventBus.publish('hintError', {
                error
            });
            
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
            
            // Subscribe to events
            window.EventBus.subscribe('hintButtonClicked', () => {
                this.showHint();
            });
            
            window.EventBus.subscribe('nextButtonClicked', () => {
                this.loadNextWord();
            });
            
            // Subscribe to state changes related to words
            window.EventBus.subscribe('stateChanged', (data) => {
                if (data.changes.scrambledWord) {
                    _displayScrambledWord(data.changes.scrambledWord.newValue);
                }
            });
            
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
        }
    };
})();

// Export the module
window.WordController = WordController;