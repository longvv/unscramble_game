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

        // Add a manual reset score button for testing
        setTimeout(() => {
            // Create a reset button
            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset Score';
            resetButton.className = 'game-btn';
            resetButton.style.marginTop = '10px';
            resetButton.style.backgroundColor = '#ff6b6b';
            
            // Add click event to reset score
            resetButton.addEventListener('click', () => {
                console.log('Manual score reset triggered');
                
                // Get all score elements before reset
                const beforeElements = document.querySelectorAll('[id="score"]');
                console.log('Score elements before reset:', beforeElements.length);
                beforeElements.forEach(el => {
                    console.log('Before reset value:', el.textContent);
                });
                
                // Call reset function
                if (window.GameController && typeof window.GameController.resetScore === 'function') {
                    window.GameController.resetScore();
                    console.log('GameController.resetScore() called');
                } else {
                    console.error('GameController.resetScore is not available');
                }
                
                // Verify score elements after reset
                setTimeout(() => {
                    const afterElements = document.querySelectorAll('[id="score"]');
                    console.log('Score elements after reset:', afterElements.length);
                    afterElements.forEach(el => {
                        console.log('After reset value:', el.textContent);
                    });
                }, 200);
            });
            
            // Add button to the game area
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                const buttonContainer = document.querySelector('.buttons-container');
                if (buttonContainer) {
                    buttonContainer.appendChild(resetButton);
                } else {
                    gameArea.appendChild(resetButton);
                }
                console.log('Reset score button added');
            } else {
                console.warn('Game area not found - could not add reset button');
            }
        }, 1000); // Wait for game to initialize

    } catch (error) {
        console.error('Error initializing game:', error);
    }
});


