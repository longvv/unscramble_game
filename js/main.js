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
            
            setTimeout(() => {
                // Create a share button container
                const shareButtonContainer = document.createElement('div');
                shareButtonContainer.className = 'share-button-container';
                
                // Create main share button
                const shareButton = document.createElement('button');
                shareButton.textContent = 'Share Game';
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
                    shareDropdown.classList.toggle('active');
                    
                    // Use Web Share API if available and button is clicked directly
                    if (navigator.share) {
                        shareGame('native');
                        shareDropdown.classList.remove('active');
                    }
                });
                
                // Hide dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!shareButtonContainer.contains(e.target)) {
                        shareDropdown.classList.remove('active');
                    }
                });
                
                // Add button to the game area
                const gameArea = document.querySelector('.game-area');
                if (gameArea) {
                    const buttonContainer = document.querySelector('.buttons-container');
                    if (buttonContainer) {
                        // Find and remove the reset score button if it exists
                        const resetButton = buttonContainer.querySelector('button.game-btn[style*="background-color: rgb(255, 107, 107)"]');
                        if (resetButton && resetButton.textContent === 'Reset Score') {
                            resetButton.remove();
                        }
                        
                        // Add the share button
                        buttonContainer.appendChild(shareButtonContainer);
                        console.log('Share button added');
                    } else {
                        gameArea.appendChild(shareButtonContainer);
                    }
                } else {
                    console.warn('Game area not found - could not add share button');
                }
            }, 1000); // Wait for game to initialize
        });

    } catch (error) {
        console.error('Error initializing game:', error);
    }
});


