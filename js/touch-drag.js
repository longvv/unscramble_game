/**
 * Enhanced Touch Support for Word Scramble Game
 * Add this code to your existing drag-drop.js file
 */

const TouchDragManager = (function() {
    // Track touch state
    let isDragging = false;
    let currentDragTile = null;
    let dragTileClone = null;
    let startX, startY;
    let offsetX, offsetY;
    
    // DOM elements
    let dropArea = null;
    let scrambledWordArea = null;
    
    /**
     * Initialize touch support for all draggable elements
     */
    function init() {
        // Get the main game areas
        dropArea = document.getElementById('drop-area');
        scrambledWordArea = document.getElementById('scrambled-word');
        
        // Apply touch handlers to existing letter tiles
        applyTouchHandlersToAllTiles();
        
        // Set up a mutation observer to watch for new letter tiles
        setupMutationObserver();
        
        console.log('TouchDragManager initialized');
    }
    
    /**
     * Apply touch handlers to all letter tiles
     */
    function applyTouchHandlersToAllTiles() {
        const letterTiles = document.querySelectorAll('.letter-tile');
        letterTiles.forEach(tile => {
            setupTouchHandlers(tile);
        });
    }
    
    /**
     * Set up a mutation observer to watch for new letter tiles and apply touch handlers
     */
    function setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList.contains('letter-tile')) {
                            setupTouchHandlers(node);
                        }
                    });
                }
            });
        });
        
        // Observe both the drop area and scrambled word area
        if (dropArea) {
            observer.observe(dropArea, { childList: true, subtree: true });
        }
        
        if (scrambledWordArea) {
            observer.observe(scrambledWordArea, { childList: true, subtree: true });
        }
    }
    
    /**
     * Set up touch handlers for a letter tile
     * @param {HTMLElement} tile - The letter tile element
     */
    function setupTouchHandlers(tile) {
        // Skip if already set up
        if (tile.dataset.touchEnabled) return;
        
        tile.addEventListener('touchstart', handleTouchStart);
        tile.addEventListener('touchmove', handleTouchMove);
        tile.addEventListener('touchend', handleTouchEnd);
        
        // Mark as touch-enabled
        tile.dataset.touchEnabled = 'true';
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch start event
     */
    function handleTouchStart(e) {
        e.preventDefault(); // Prevent scrolling
        
        currentDragTile = this;
        currentDragTile.classList.add('dragging');
        
        // Get touch position
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        // Calculate offset from the tile center
        const rect = currentDragTile.getBoundingClientRect();
        offsetX = startX - (rect.left + rect.width / 2);
        offsetY = startY - (rect.top + rect.height / 2);
        
        // Create a clone for visual feedback
        dragTileClone = currentDragTile.cloneNode(true);
        dragTileClone.style.position = 'fixed';
        dragTileClone.style.zIndex = '1000';
        dragTileClone.style.opacity = '0.8';
        dragTileClone.style.pointerEvents = 'none';
        
        // Position at the touch point
        positionCloneAtTouch(touch);
        
        document.body.appendChild(dragTileClone);
        
        // Indicate dragging has started
        isDragging = true;
        
        // Play drag sound
        window.AudioService.playSound('drag');
    }
    
    /**
     * Handle touch move event
     * @param {TouchEvent} e - Touch move event
     */
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        e.preventDefault(); // Prevent scrolling
        
        const touch = e.touches[0];
        
        // Move the clone with the touch
        positionCloneAtTouch(touch);
        
        // Identify potential drop targets
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Remove highlight from all potential drop targets
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
        
        // Highlight the potential drop target
        const dropTarget = findDropTarget(elementUnderTouch);
        if (dropTarget) {
            dropTarget.classList.add('drag-over');
        }
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} e - Touch end event
     */
    function handleTouchEnd(e) {
        if (!isDragging) return;
        
        e.preventDefault(); // Prevent default behavior
        
        // Get the position of the last touch
        const touch = e.changedTouches[0];
        
        // Find the element under the touch
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Find potential drop target
        const dropTarget = findDropTarget(elementUnderTouch);
        
        // Handle the drop
        if (dropTarget) {
            dropTarget.classList.remove('drag-over');
            
            // Handle drop in letter box
            if (dropTarget.classList.contains('letter-box')) {
                handleDropInLetterBox(dropTarget);
            } 
            // Handle drop back in scrambled word area
            else if (dropTarget.id === 'scrambled-word') {
                handleDropInScrambledArea(dropTarget);
            }
        }
        
        // Clean up
        cleanupDrag();
    }
    
    /**
     * Position the clone at the touch position
     * @param {Touch} touch - The touch object
     */
    function positionCloneAtTouch(touch) {
        if (!dragTileClone) return;
        
        dragTileClone.style.left = (touch.clientX - offsetX) + 'px';
        dragTileClone.style.top = (touch.clientY - offsetY) + 'px';
    }
    
    /**
     * Find a valid drop target from the element under touch
     * @param {HTMLElement} element - The element under touch
     * @returns {HTMLElement|null} The drop target or null
     */
    function findDropTarget(element) {
        if (!element) return null;
        
        // Check if the element itself is a drop target
        if (element.classList.contains('letter-box') || element.id === 'scrambled-word') {
            return element;
        }
        
        // Check parents
        let parent = element.parentElement;
        while (parent) {
            if (parent.classList.contains('letter-box') || parent.id === 'scrambled-word') {
                return parent;
            }
            parent = parent.parentElement;
        }
        
        return null;
    }
    
    /**
     * Handle dropping a tile in a letter box
     * @param {HTMLElement} letterBox - The letter box element
     */
    function handleDropInLetterBox(letterBox) {
        // Check if box already has a letter tile
        const existingTile = letterBox.querySelector('.letter-tile');
        
        if (!existingTile) {
            // Create a clone of the dragged tile to place in the target
            const newTile = currentDragTile.cloneNode(true);
            newTile.classList.remove('dragging');
            
            // Add touch handlers to the new tile
            setupTouchHandlers(newTile);
            
            // Add to letter box
            letterBox.appendChild(newTile);
            
            // Remove original tile
            currentDragTile.remove();
            
            // Check if answer is complete
            checkAnswer();
        } else {
            // Swap tiles
            const newTile = currentDragTile.cloneNode(true);
            const existingClone = existingTile.cloneNode(true);
            
            newTile.classList.remove('dragging');
            
            // Set up touch handlers
            setupTouchHandlers(newTile);
            setupTouchHandlers(existingClone);
            
            // Remove existing tile from letter box
            existingTile.remove();
            
            // Add the dragged tile to the letter box
            letterBox.appendChild(newTile);
            
            // Add the existing tile to where the dragged tile came from
            const parent = currentDragTile.parentElement;
            if (parent) {
                currentDragTile.remove();
                parent.appendChild(existingClone);
            } else {
                document.getElementById('scrambled-word').appendChild(existingClone);
                currentDragTile.remove();
            }
        }
        
        // Play sound
        window.AudioService.playSound('drag');
    }
    
    /**
     * Handle dropping a tile back to the scrambled area
     * @param {HTMLElement} scrambledArea - The scrambled word area
     */
    function handleDropInScrambledArea(scrambledArea) {
        // Only do this if it's coming from a letter box
        if (currentDragTile.closest('.letter-box')) {
            // Create a clone to add to the scrambled area
            const newTile = currentDragTile.cloneNode(true);
            newTile.classList.remove('dragging');
            
            // Add touch handlers
            setupTouchHandlers(newTile);
            
            // Add to scrambled area
            scrambledArea.appendChild(newTile);
            
            // Remove the original
            currentDragTile.remove();
            
            // Play sound
            window.AudioService.playSound('drag');
        }
    }
    
    /**
     * Check if the answer is complete and trigger answer checking
     */
    function checkAnswer() {
        const allBoxesFilled = dropArea.querySelectorAll('.letter-box:empty').length === 0;
        if (allBoxesFilled) {
            // Check if there's a controller with checkAnswer method
            if (window.GameController && typeof window.GameController.checkAnswer === 'function') {
                setTimeout(() => {
                    window.GameController.checkAnswer();
                }, 100);
            }
        }
    }
    
    /**
     * Clean up after dragging
     */
    function cleanupDrag() {
        if (currentDragTile) {
            currentDragTile.classList.remove('dragging');
        }
        
        if (dragTileClone && dragTileClone.parentElement) {
            dragTileClone.parentElement.removeChild(dragTileClone);
        }
        
        // Remove highlight from all potential drop targets
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
        
        // Reset variables
        isDragging = false;
        currentDragTile = null;
        dragTileClone = null;
    }
    
    return {
        init: init,
        setupTouchHandlers: setupTouchHandlers
    };
})();

// Initialize the touch manager when the page loads
document.addEventListener('DOMContentLoaded', function() {
    TouchDragManager.init();
});