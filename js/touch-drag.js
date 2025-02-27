/**
 * Enhanced Touch Support for Word Scramble Game with Fixes
 */

const TouchDragManager = (function() {
    // Track touch state
    let isDragging = false;
    let currentDragTile = null;
    let dragTileClone = null;
    let startX, startY;
    let offsetX, offsetY;
    let originalPosition = null;
    
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
        
        // Add specific touch styles
        addTouchStyles();
        
        console.log('TouchDragManager initialized');
    }
    
    /**
     * Add touch-specific styles
     */
    function addTouchStyles() {
        if (!document.getElementById('touch-drag-styles')) {
            const style = document.createElement('style');
            style.id = 'touch-drag-styles';
            style.textContent = `
                .letter-tile {
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: none;
                }
                
                .touch-clone {
                    position: fixed;
                    z-index: 9999;
                    opacity: 0.8;
                    pointer-events: none;
                    transition: none;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
                
                .letter-box.drag-highlight {
                    background-color: rgba(142, 68, 173, 0.2);
                    border: 2px solid #8e44ad;
                    transform: scale(1.1);
                }
            `;
            document.head.appendChild(style);
        }
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
        
        tile.addEventListener('touchstart', handleTouchStart, { passive: false });
        tile.addEventListener('touchmove', handleTouchMove, { passive: false });
        tile.addEventListener('touchend', handleTouchEnd, { passive: false });
        tile.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        
        // Mark as touch-enabled
        tile.dataset.touchEnabled = 'true';
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch start event
     */
    function handleTouchStart(e) {
        // Prevent default to avoid scrolling while dragging
        e.preventDefault();
        
        currentDragTile = this;
        currentDragTile.classList.add('dragging');
        
        // Save original position for reference
        originalPosition = {
            parent: currentDragTile.parentElement,
            nextSibling: currentDragTile.nextElementSibling
        };
        
        // Get touch position
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        // Calculate offset from the tile center for more accurate positioning
        const rect = currentDragTile.getBoundingClientRect();
        offsetX = startX - (rect.left + rect.width / 2);
        offsetY = startY - (rect.top + rect.height / 2);
        
        // Create a clone for visual feedback
        dragTileClone = currentDragTile.cloneNode(true);
        dragTileClone.classList.add('touch-clone');
        dragTileClone.style.width = `${rect.width}px`;
        dragTileClone.style.height = `${rect.height}px`;
        
        // Position at the touch point
        positionCloneAtTouch(touch);
        
        document.body.appendChild(dragTileClone);
        
        // Make the original semi-transparent to indicate it's being dragged
        currentDragTile.style.opacity = '0.4';
        
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
        document.querySelectorAll('.drag-over, .drag-highlight').forEach(el => {
            el.classList.remove('drag-over');
            el.classList.remove('drag-highlight');
        });
        
        // Highlight the potential drop target
        const dropTarget = findDropTarget(elementUnderTouch);
        if (dropTarget) {
            dropTarget.classList.add('drag-highlight');
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
        
        // Reset original tile opacity
        if (currentDragTile) {
            currentDragTile.style.opacity = '1';
        }
        
        // Handle the drop
        if (dropTarget) {
            dropTarget.classList.remove('drag-highlight');
            
            // Handle drop in letter box
            if (dropTarget.classList.contains('letter-box')) {
                handleDropInLetterBox(dropTarget);
            } 
            // Handle drop back in scrambled word area
            else if (dropTarget.id === 'scrambled-word' || dropTarget.closest('#scrambled-word')) {
                handleDropInScrambledArea(scrambledWordArea, touch);
            }
        } else {
            // If no valid target, return to original position
            returnToOriginalPosition();
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
        
        // Center the clone at the touch point, accounting for the offset
        dragTileClone.style.left = (touch.clientX - dragTileClone.offsetWidth/2) + 'px';
        dragTileClone.style.top = (touch.clientY - dragTileClone.offsetHeight/2) + 'px';
    }
    
    /**
     * Find a valid drop target from the element under touch
     * @param {HTMLElement} element - The element under touch
     * @returns {HTMLElement|null} The drop target or null
     */
    function findDropTarget(element) {
        if (!element) return null;
        
        // Check if the element itself is a drop target
        if (element.classList.contains('letter-box')) {
            return element;
        }
        
        // Check if the element is the scrambled word area or within it
        if (element.id === 'scrambled-word' || element.closest('#scrambled-word')) {
            return document.getElementById('scrambled-word');
        }
        
        // Check parents for letter-box
        let parent = element.parentElement;
        while (parent) {
            if (parent.classList.contains('letter-box')) {
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
            // Empty box - just move the tile there
            letterBox.appendChild(currentDragTile);
        } else {
            // Swap with the existing tile
            
            // 1. Find where our dragged tile came from
            const originalParent = originalPosition.parent;
            const originalNextSibling = originalPosition.nextSibling;
            
            // 2. Put the existing tile where our dragged tile came from
            if (originalNextSibling) {
                originalParent.insertBefore(existingTile, originalNextSibling);
            } else {
                originalParent.appendChild(existingTile);
            }
            
            // 3. Put our dragged tile in the letter box
            letterBox.appendChild(currentDragTile);
        }
        
        // Play sound
        window.AudioService.playSound('drag');
        
        // Check if answer is complete
        checkAnswer();
    }
    
    /**
     * Handle dropping a tile back to the scrambled area
     * @param {HTMLElement} scrambledArea - The scrambled word area
     * @param {Touch} touch - The touch that ended the drag
     */
    function handleDropInScrambledArea(scrambledArea, touch) {
        // Only proceed if the tile is coming from a letter box
        if (originalPosition.parent.classList.contains('letter-box')) {
            // Find position to insert based on touch Y position
            const afterElement = getElementAfterTouch(scrambledArea, touch.clientY);
            
            // Insert at appropriate position
            if (afterElement) {
                scrambledArea.insertBefore(currentDragTile, afterElement);
            } else {
                scrambledArea.appendChild(currentDragTile);
            }
            
            // Play sound
            window.AudioService.playSound('drag');
        } else {
            // Coming from another position in the scrambled area
            // Find position to insert based on touch Y position
            const afterElement = getElementAfterTouch(scrambledArea, touch.clientY);
            
            // Insert at appropriate position
            if (afterElement && afterElement !== currentDragTile) {
                scrambledArea.insertBefore(currentDragTile, afterElement);
            } else if (!afterElement) {
                scrambledArea.appendChild(currentDragTile);
            } else {
                // Put it back where it was
                returnToOriginalPosition();
            }
        }
    }
    
    /**
     * Return the dragged tile to its original position
     */
    function returnToOriginalPosition() {
        if (!currentDragTile || !originalPosition || !originalPosition.parent) return;
        
        if (originalPosition.nextSibling) {
            originalPosition.parent.insertBefore(currentDragTile, originalPosition.nextSibling);
        } else {
            originalPosition.parent.appendChild(currentDragTile);
        }
    }
    
    /**
     * Get element after which to insert based on Y position
     * @param {HTMLElement} container - Container element
     * @param {number} y - Touch Y position
     * @returns {HTMLElement|null} Element to insert after or null
     */
    function getElementAfterTouch(container, y) {
        // Get all letter tiles in the container except the one being dragged
        const draggableElements = [...container.querySelectorAll('.letter-tile:not(.dragging)')];
        
        // Find the element after which to insert the dragged element
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            // If offset is negative but greater than closest, this element is closer
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    /**
     * Check if the answer is complete and trigger answer checking
     */
    function checkAnswer() {
        const allBoxesFilled = dropArea.querySelectorAll('.letter-box:empty').length === 0;
        if (allBoxesFilled && window.GameController && typeof window.GameController.checkAnswer === 'function') {
            setTimeout(() => {
                window.GameController.checkAnswer();
            }, 100);
        }
    }
    
    /**
     * Clean up after dragging
     */
    function cleanupDrag() {
        if (currentDragTile) {
            currentDragTile.classList.remove('dragging');
            currentDragTile.style.opacity = '1';
        }
        
        if (dragTileClone && dragTileClone.parentElement) {
            dragTileClone.parentElement.removeChild(dragTileClone);
        }
        
        // Remove highlight from all potential drop targets
        document.querySelectorAll('.drag-over, .drag-highlight').forEach(el => {
            el.classList.remove('drag-over');
            el.classList.remove('drag-highlight');
        });
        
        // Reset variables
        isDragging = false;
        currentDragTile = null;
        dragTileClone = null;
        originalPosition = null;
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