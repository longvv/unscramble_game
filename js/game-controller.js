/**
 * Game Controller Module for Word Scramble Game
 * Orchestrates game flow and coordinates between other modules
 * - Updated to use DatabaseService for score persistence
 * - Maintains compatibility with StorageService as fallback
 */
const GameController = (function() {
    // Private state is minimized since GameState now manages state
    let _initialized = false;
    
    // Private methods
    
    /**
     * Save score to persistent storage
     * @param {number} score - Score to save
     * @returns {Promise<boolean>} Success status
     */
    async function _saveScore(score) {
        try {
            // Try to save score to database first
            if (window.DatabaseService && 
                typeof window.DatabaseService.saveScore === 'function' &&
                window.DatabaseService.isInitialized()) {
                await window.DatabaseService.saveScore(score);
                return true;
            }
            
            // Fallback to StorageService
            if (window.StorageService && typeof window.StorageService.saveScore === 'function') {
                window.StorageService.saveScore(score);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error saving score:', error);
            return false;
        }
    }
    
    /**
     * Load score from persistent storage
     * @returns {Promise<number>} The loaded score
     */
    async function _loadScore() {
        try {
            // Try to load score from database first
            if (window.DatabaseService && 
                typeof window.DatabaseService.getScore === 'function' &&
                window.DatabaseService.isInitialized()) {
                return await window.DatabaseService.getScore();
            }
            
            // Fallback to StorageService
            if (window.StorageService && typeof window.StorageService.getScore === 'function') {
                return window.StorageService.getScore();
            }
            
            return 0;
        } catch (error) {
            console.error('Error loading score:', error);
            return 0;
        }
    }
    
    /**
     * Check if the answer is correct
     */
    async function _checkAnswer() {
        // Get current game state
        const gameState = window.GameState.getState();
        
        // Get all letter boxes and extract the letters in their current order
        const letterBoxes = Array.from(document.querySelectorAll('.letter-box'));
        const userAnswer = letterBoxes
            .map(box => {
                const letterTile = box.querySelector('.letter-tile');
                return letterTile ? letterTile.textContent.trim() : '';
            })
            .join('');
        
        // Compare with current word
        if (userAnswer.toLowerCase() === gameState.currentWord.toLowerCase()) {
            // Correct answer
            window.AudioService.playSound('correct');
            window.AudioService.pronounceWord();
            
            // Update score based on hint usage
            const scoreIncrement = gameState.hintUsed ? 
                window.GameConfig.get('scoreIncrement').withHint : 
                window.GameConfig.get('scoreIncrement').withoutHint;
            
            const newScore = gameState.score + scoreIncrement;
            
            // Update game state
            window.GameState.update({
                score: newScore
            });
            
            // Save score to storage
            await _saveScore(newScore);
            
            // Disable check button and highlight boxes as correct
            const checkBtn = document.getElementById('check-btn');
            if (checkBtn) {
                checkBtn.disabled = true;
            }
            
            letterBoxes.forEach(box => {
                box.classList.add('correct');
                const tile = box.querySelector('.letter-tile');
                if (tile) tile.classList.add('correct');
            });
            
            // Publish correct answer event
            window.EventBus.publish('answerCorrect', {
                word: gameState.currentWord,
                score: newScore
            });
            
            // Show celebration after a short delay
            setTimeout(() => {
                _showCelebration();
            }, 500);
        } else {
            // Incorrect answer
            window.AudioService.playSound('wrong');
            
            // Visual feedback for incorrect answer
            const dropArea = document.getElementById('drop-area');
            dropArea.classList.add('shake');
            setTimeout(() => {
                dropArea.classList.remove('shake');
            }, 500);
            
            // Publish incorrect answer event
            window.EventBus.publish('answerIncorrect', {
                userAnswer,
                correctWord: gameState.currentWord
            });
        }
    }
    
    /**
     * Show celebration and prepare for next word
     */
    function _showCelebration() {
        const celebrationElement = document.getElementById('celebration-element');
        
        // Show celebration animation
        if (celebrationElement) {
            celebrationElement.classList.add('show');
        }
        
        // Play celebration sound
        window.AudioService.playCelebration();
        
        // Reset the celebration after the animation completes
        setTimeout(() => {
            if (celebrationElement) {
                celebrationElement.classList.remove('show');
            }
            
            // Load next word after a short delay
            setTimeout(() => {
                window.WordController.loadNextWord();
            }, 500);
        }, window.GameConfig.get('celebrationDuration') || 2000);
    }
    
    /**
     * Set up event listeners
     */
    function _setupEventListeners() {
        // Subscribe to relevant events
        window.EventBus.subscribe('allLettersPlaced', _checkAnswer);
        window.EventBus.subscribe('checkButtonClicked', _checkAnswer);
        
        // Set up button click handlers
        const buttons = {
            checkBtn: document.getElementById('check-btn'),
            nextBtn: document.getElementById('next-btn'),
            hintBtn: document.getElementById('hint-btn'),
            pronounceBtn: document.getElementById('pronounce-btn')
        };
        
        if (buttons.checkBtn) {
            buttons.checkBtn.addEventListener('click', () => {
                window.EventBus.publish('checkButtonClicked', null);
            });
        }
        
        if (buttons.nextBtn) {
            buttons.nextBtn.addEventListener('click', () => {
                window.EventBus.publish('nextButtonClicked', null);
            });
        }
        
        if (buttons.hintBtn) {
            buttons.hintBtn.addEventListener('click', () => {
                window.EventBus.publish('hintButtonClicked', null);
            });
        }
        
        if (buttons.pronounceBtn) {
            buttons.pronounceBtn.addEventListener('click', () => {
                window.EventBus.publish('pronounceButtonClicked', null);
            });
        }
    }
    
    // Public API
    return {
        /**
         * Initialize the game
         * @returns {Object} GameController for chaining
         */
        init: async function() {
            // Prevent multiple initializations
            if (_initialized) {
                console.warn('Game Controller already initialized');
                return this;
            }
            
            // Initialize EventBus
            if (!window.EventBus) {
                console.error('EventBus not found. Make sure it\'s loaded before GameController');
                return this;
            }
            
            // Initialize GameState
            if (window.GameState) {
                window.GameState.init();
            } else {
                console.error('GameState not found. Make sure it\'s loaded before GameController');
                return this;
            }
            
            try {
                // Load saved score
                const savedScore = await _loadScore();
                
                // Initialize game state with saved score
                window.GameState.update({
                    score: savedScore
                });
                
                // Update score display
                const scoreElement = document.getElementById('score');
                if (scoreElement) {
                    scoreElement.textContent = savedScore;
                }
                
                // Initialize services and controllers
                if (window.AudioService) window.AudioService.init();
                if (window.InputManager) window.InputManager.init();
                if (window.WordController) window.WordController.init();
                
                // Set up event listeners
                _setupEventListeners();
                
                // Publish game initialized event
                window.EventBus.publish('gameInitialized', null);
                
                // Load first word
                if (window.WordController) {
                    window.WordController.loadNextWord();
                } else {
                    console.error('WordController not found. Cannot load first word.');
                }
                
                // Mark as initialized
                _initialized = true;
                
                return this;
            } catch (error) {
                console.error('Error initializing game:', error);
                
                // Publish error event
                if (window.EventBus) {
                    window.EventBus.publish('gameInitError', {
                        error: error.message
                    });
                }
                
                return this;
            }
        },
        
        /**
         * Reset the game
         * @returns {Object} GameController for chaining
         */
        reset: async function() {
            // Reset game state
            if (window.GameState) {
                window.GameState.resetState();
            }
            
            // Reset score in storage
            await _saveScore(0);
            
            // Load first word
            if (window.WordController) {
                window.WordController.loadNextWord();
            }
            
            // Publish game reset event
            if (window.EventBus) {
                window.EventBus.publish('gameReset', null);
            }
            
            return this;
        },
        
        /**
         * Check answer (exposed for external access)
         */
        checkAnswer: function() {
            _checkAnswer();
        }
    };
})();

// Export the module
window.GameController = GameController;