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

        // Add share button with a slight delay to ensure DOM is ready
        setTimeout(() => {
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
            const buttonContainer = document.querySelector('.buttons-container');
            if (buttonContainer) {
                buttonContainer.appendChild(shareButtonContainer);
                console.log('Share button added to button container');
            } else {
                const gameArea = document.querySelector('.game-area');
                if (gameArea) {
                    gameArea.appendChild(shareButtonContainer);
                    console.log('Share button added to game area');
                } else {
                    console.warn('Could not find a place to add the share button');
                }
            }
        }, 1000); // Wait for game to fully initialize

    } catch (error) {
        console.error('Error initializing game:', error);
    }
});

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
    
    // Get current score if available
    const scoreElement = document.getElementById('score');
    const score = scoreElement ? ` My current score is ${scoreElement.textContent}!` : "";
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
                }).catch((error) => {
                    console.error('Error sharing:', error);
                    // Fallback to opening share dropdown
                    const shareDropdown = document.querySelector('.share-dropdown');
                    if (shareDropdown) shareDropdown.classList.add('active');
                });
            }
            break;
            
        case 'email':
            // Open default email client with pre-filled content
            const emailSubject = encodeURIComponent(gameTitle);
            const emailBody = encodeURIComponent(scoreShareText);
            window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
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
            break;
            
        case 'facebook':
            // Open Facebook share dialog
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`);
            break;
            
        case 'telegram':
            // Share via Telegram
            window.open(`https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(gameDescription + score)}`);
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