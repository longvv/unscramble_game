/**
 * Main entry point for Word Scramble Game
 * Initializes all modules and starts the game
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Word Scramble Game...');
    
    try {
        // Initialize game controller (which initializes other modules)
        GameController.init();
        console.log('Game initialization complete!');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});
