/**
 * Main entry point for Word Scramble Game
 * Initializes all modules and starts the game
 * - Updated to prioritize DatabaseService for data persistence
 * - Maintains backward compatibility with StorageService
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Word Scramble Game...');
    
    try {
        // Initialize modules in correct order (dependencies first)
        initializeModules();
        
        // Add share button with a slight delay to ensure DOM is ready
        setTimeout(() => {
            addShareButton();
        }, 1000);
        
    } catch (error) {
        console.error('Critical error initializing game:', error);
    }
});

/**
 * Initialize modules in the correct dependency order
 */
async function initializeModules() {
    // 1. Core modules (no dependencies)
    if (window.GameConfig) {
        console.log('GameConfig loaded');
    } else {
        console.error('GameConfig not found!');
    }
    
    // 2. EventBus (communication bus)
    if (window.EventBus) {
        console.log('EventBus loaded');
    } else {
        console.error('EventBus not found!');
        // Create a simple event bus if not found to avoid breaking everything
        window.EventBus = {
            subscribe: function(event, callback) {
                console.warn('EventBus not properly initialized!');
                return false;
            },
            publish: function(event, data) {
                console.warn('EventBus not properly initialized!');
                return false;
            },
            unsubscribe: function(event, callback) {
                console.warn('EventBus not properly initialized!');
                return false;
            }
        };
    }
    
    // 3. Initialize Database Service (new IndexedDB implementation)
    let dbInitialized = false;
    if (window.DatabaseService) {
        console.log('Initializing DatabaseService...');
        try {
            // Initialize Database to load word data
            await window.DatabaseService.init();
            console.log('DatabaseService initialized successfully');
            dbInitialized = true;
            
            // Publish event for database initialization complete
            if (window.EventBus) {
                window.EventBus.publish('databaseInitialized', { success: true });
            }
            
            // Hide loading overlay
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('loaded');
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 500);
            }
        } catch (error) {
            console.error('Error initializing DatabaseService:', error);
            // Show error message in loading overlay
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                const message = loadingOverlay.querySelector('p');
                if (message) {
                    message.textContent = 'Error loading game data. Falling back to local storage.';
                    message.style.color = '#ff9966';  // Orange instead of red to indicate fallback, not failure
                }
            }
            
            // Publish event for database initialization failed
            if (window.EventBus) {
                window.EventBus.publish('databaseInitError', { error: error.message });
            }
        }
    } else {
        console.warn('DatabaseService not found. Will use localStorage for data persistence.');
    }
    
    // 4. Legacy StorageService - we can keep this for backward compatibility
    if (window.StorageService) {
        console.log('Legacy StorageService available (used as fallback)');
    } else if (!dbInitialized) {
        console.error('Neither DatabaseService nor StorageService are available! Data will not persist.');
    }
    
    // 5. AudioService
    if (window.AudioService) {
        console.log('Initializing AudioService...');
        try {
            window.AudioService.init();
            console.log('AudioService initialized');
        } catch (error) {
            console.error('Error initializing AudioService:', error);
        }
    } else {
        console.error('AudioService not found!');
    }
    
    // 6. Check for DragDropManager and create fallback if not present
    if (!window.DragDropManager) {
        console.warn('DragDropManager not found! Creating fallback implementation...');
        
        // Create a minimal fallback implementation
        window.DragDropManager = {
            init: function() {
                console.log('Using fallback DragDropManager');
                return this;
            },
            
            dragStart: function(e) {
                e.dataTransfer.setData('text/plain', e.target.id);
                e.target.classList.add('dragging');
                
                if (window.AudioService && typeof window.AudioService.playSound === 'function') {
                    window.AudioService.playSound('drag');
                }
            },
            
            dragEnd: function(e) {
                e.target.classList.remove('dragging');
            },
            
            setupDropAreaListeners: function() {
                return this;
            },
            
            setupScrambledAreaListeners: function() {
                return this;
            },
            
            getLetterBoxCallbacks: function(callback) {
                return {
                    dragOver: function(e) { e.preventDefault(); },
                    dragEnter: function(e) { 
                        e.preventDefault();
                        e.target.classList.add('drag-over');
                    },
                    dragLeave: function(e) { 
                        e.target.classList.remove('drag-over');
                    },
                    drop: function(e) {
                        e.preventDefault();
                        e.target.classList.remove('drag-over');
                        
                        const id = e.dataTransfer.getData('text/plain');
                        const draggedElement = document.getElementById(id);
                        
                        if (draggedElement) {
                            e.target.appendChild(draggedElement);
                            
                            if (window.AudioService) {
                                window.AudioService.playSound('drag');
                            }
                            
                            if (callback) callback();
                        }
                    }
                };
            }
        };
    }
    
    // Initialize DragDropManager
    console.log('Initializing DragDropManager...');
    try {
        window.DragDropManager.init();
        console.log('DragDropManager initialized');
    } catch (error) {
        console.error('Error initializing DragDropManager:', error);
    }
    
    // 7. Word Manager (depends on StorageService/DatabaseService, UIFactory)
    if (window.WordManager) {
        console.log('Initializing WordManager...');
        try {
            const wordManagerElements = {
                newWordInput: document.getElementById('new-word-input'),
                addWordBtn: document.getElementById('add-word-btn'),
                imageUploadArea: document.getElementById('image-upload-area'),
                imageUpload: document.getElementById('image-upload'),
                imagePreview: document.getElementById('image-preview'),
                wordList: document.getElementById('word-items')
            };
            
            window.WordManager.init(wordManagerElements);
            console.log('WordManager initialized');
        } catch (error) {
            console.error('Error initializing WordManager:', error);
        }
    } else {
        console.error('WordManager not found!');
    }
    
    // 8. Word Controller (depends on WordManager, GameState, EventBus)
    if (window.WordController) {
        console.log('Initializing WordController...');
        try {
            window.WordController.init();
            console.log('WordController initialized');
        } catch (error) {
            console.error('Error initializing WordController:', error);
        }
    } else {
        console.error('WordController not found!');
    }
    
    // 9. Input Managers (depend on EventBus)
    if (window.InputManager) {
        console.log('Initializing InputManager...');
        try {
            window.InputManager.init();
            console.log('InputManager initialized');
        } catch (error) {
            console.error('Error initializing InputManager:', error);
        }
    } else {
        console.error('InputManager not found!');
    }
    
    // Initialize TouchDragManager after InputManager
    if (window.TouchDragManager) {
        console.log('Initializing TouchDragManager...');
        try {
            window.TouchDragManager.init();
            console.log('TouchDragManager initialized');
        } catch (error) {
            console.error('Error initializing TouchDragManager:', error);
        }
    } else {
        console.log('TouchDragManager not found or not needed on this device');
    }
    
    // 10. Game Controller (depends on all other modules)
    if (window.GameController) {
        console.log('Initializing GameController...');
        try {
            window.GameController.init();
            console.log('Game initialization complete!');
            
            // Subscribe to game initialization events
            if (window.EventBus) {
                window.EventBus.subscribe('gameInitialized', () => {
                    console.log('Game initialized successfully!');
                });
                
                window.EventBus.subscribe('gameInitError', (data) => {
                    console.error('Game initialization error:', data ? data.error : 'Unknown error');
                });
            }
        } catch (error) {
            console.error('Error initializing GameController:', error);
        }
    } else {
        console.error('GameController not found!');
    }
}

/**
 * Add share button to the game UI
 */
function addShareButton() {
    try {
        // Check if share button already exists to avoid duplicates
        if (document.querySelector('.share-button-container')) {
            console.log('Share button already exists');
            return;
        }
        
        // Create a share button container
        const shareButtonContainer = document.createElement('div');
        shareButtonContainer.className = 'share-button-container';
        
        // Create main share button
        const shareButton = document.createElement('button');
        shareButton.className = 'game-btn primary share-btn';
        shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Share Game';
        
        // Create share dropdown for options
        const shareDropdown = document.createElement('div');
        shareDropdown.className = 'share-dropdown';
        
        // Share options
        const shareOptions = [
            { name: 'Email', icon: 'fa-envelope', action: 'email' },
            { name: 'SMS', icon: 'fa-sms', action: 'sms' },
            { name: 'Facebook', icon: 'fa-facebook-messenger', action: 'facebook' },
            { name: 'Telegram', icon: 'fa-telegram', action: 'telegram' }
        ];
        
        // Create share items
        shareOptions.forEach(option => {
            const item = document.createElement('button');
            item.className = 'share-option';
            item.innerHTML = `<i class="fas ${option.icon}"></i> ${option.name}`;
            item.setAttribute('data-share-action', option.action);
            shareDropdown.appendChild(item);
            
            // Add click handler for each option
            item.addEventListener('click', () => {
                shareGame(option.action);
            });
        });
        
        // Append dropdown to container
        shareButtonContainer.appendChild(shareButton);
        shareButtonContainer.appendChild(shareDropdown);
        
        // Toggle dropdown visibility when main button is clicked
        shareButton.addEventListener('click', () => {
            // Use Web Share API if available and button is clicked directly
            if (navigator.share) {
                shareGame('native');
            } else {
                shareDropdown.classList.toggle('active');
            }
        });
        
        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!shareButtonContainer.contains(e.target)) {
                shareDropdown.classList.remove('active');
            }
        });
        
        // Add button to the game area
        let buttonAdded = false;
        const buttonContainer = document.querySelector('.buttons-container');
        if (buttonContainer) {
            buttonContainer.appendChild(shareButtonContainer);
            console.log('Share button added to button container');
            buttonAdded = true;
        } else {
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                gameArea.appendChild(shareButtonContainer);
                console.log('Share button added to game area');
                buttonAdded = true;
            } else {
                console.warn('Could not find a place to add the share button');
            }
        }
        
        // Publish event for share button added
        if (buttonAdded && window.EventBus) {
            window.EventBus.publish('shareButtonAdded', null);
        }
    } catch (error) {
        console.error('Error adding share button:', error);
    }
}

/**
 * Share functionality for Word Scramble Game
 * This function handles sharing the game via different methods
 * @param {string} method - The sharing method to use (native, email, sms, facebook, telegram)
 */
function shareGame(method) {
    // Base share content
    const gameTitle = "Word Scramble Game";
    const gameDescription = "Check out this fun educational word scramble game!";
    const gameUrl = window.location.href;
    const shareText = `${gameDescription} Play it here: ${gameUrl}`;
    
    // Get current score if available - now works with either DatabaseService or GameState
    let score = "";
    
    // Try getting score from GameState first (most up-to-date)
    if (window.GameState && typeof window.GameState.getState === 'function') {
        const gameState = window.GameState.getState();
        score = gameState && gameState.score !== undefined ? ` My current score is ${gameState.score}!` : "";
    } 
    // Fallback to DOM if needed
    else {
        const scoreElement = document.getElementById('score');
        score = scoreElement ? ` My current score is ${scoreElement.textContent}!` : "";
    }
    
    const scoreShareText = `${shareText}${score}`;
    
    // Handle different share methods
    switch (method) {
        case 'native':
            // Use Web Share API if available (mobile devices)
            if (navigator.share) {
                navigator.share({
                    title: gameTitle,
                    text: gameDescription + score,
                    url: gameUrl
                }).then(() => {
                    console.log('Shared successfully');
                    // Publish share success event
                    if (window.EventBus) {
                        window.EventBus.publish('shareSuccess', { method: 'native' });
                    }
                }).catch((error) => {
                    console.error('Error sharing:', error);
                    // Fallback to opening share dropdown
                    const shareDropdown = document.querySelector('.share-dropdown');
                    if (shareDropdown) shareDropdown.classList.add('active');
                    
                    // Publish share error event
                    if (window.EventBus) {
                        window.EventBus.publish('shareError', { method: 'native', error: error.message });
                    }
                });
            }
            break;
            
        case 'email':
            // Open default email client with pre-filled content
            const emailSubject = encodeURIComponent(gameTitle);
            const emailBody = encodeURIComponent(scoreShareText);
            window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
            
            // Publish share event
            if (window.EventBus) {
                window.EventBus.publish('shareSuccess', { method: 'email' });
            }
            break;
            
        case 'sms':
            // Open SMS with pre-filled message
            const smsBody = encodeURIComponent(scoreShareText);
            // Try different SMS URI schemes for compatibility
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                window.open(`sms:&body=${smsBody}`);
            } else {
                window.open(`sms:?body=${smsBody}`);
            }
            
            // Publish share event
            if (window.EventBus) {
                window.EventBus.publish('shareSuccess', { method: 'sms' });
            }
            break;
            
        case 'facebook':
            // Open Facebook share dialog
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`);
            
            // Publish share event
            if (window.EventBus) {
                window.EventBus.publish('shareSuccess', { method: 'facebook' });
            }
            break;
            
        case 'telegram':
            // Share via Telegram
            window.open(`https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(gameDescription + score)}`);
            
            // Publish share event
            if (window.EventBus) {
                window.EventBus.publish('shareSuccess', { method: 'telegram' });
            }
            break;
    }
    
    // Close the dropdown after sharing
    const shareDropdown = document.querySelector('.share-dropdown');
    if (shareDropdown) {
        setTimeout(() => {
            shareDropdown.classList.remove('active');
        }, 300);
    }
}