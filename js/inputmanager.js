/**
 * InputManager Module for Word Scramble Game
 * Unified handling of mouse and touch interactions
 */
const InputManager = (function() {
    // Private state
    let _draggingItem = null;
    let _dragTileClone = null;
    let _originalPosition = null;
    let _isTouchDevice = false;
    
    // DOM elements
    let _dropArea = null;
    let _scrambledWordArea = null;
    
    // Private methods
    
    /**
     * Detect if device supports touch
     * @returns {boolean} Whether device supports touch
     */
    function _detectTouchSupport() {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 || 
               navigator.msMaxTouchPoints > 0;
    }
    
    /**
     * Handle start of drag operation (mouse)
     * @param {DragEvent} e - Drag start event
     */
    function _handleDragStart(e) {
        _draggingItem = e.target;
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('dragging');
        
        // Record original position
        _originalPosition = {
            parent: e.target.parentElement,
            nextSibling: e.target.nextElementSibling
        };
        
        // Create a better drag image
        const dragImage = e.target.cloneNode(true);
        dragImage.style.width = '50px';
        dragImage.style.height = '50px';
        dragImage.style.opacity = '0.9';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        
        // Set custom drag image
        e.dataTransfer.setDragImage(dragImage, 25, 25);
        
        // Remove temporary element after delay
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
        
        // Play drag sound
        window.AudioService.playSound('drag');
        
        // Publish drag start event
        window.EventBus.publish('dragStart', {
            element: e.target,
            id: e.target.id,
            sourceContainer: e.target.closest('.letter-box') ? 'letter-box' : 'scrambled-word'
        });
    }
    
    /**
     * Handle end of drag operation (mouse)
     * @param {DragEvent} e - Drag end event
     */
    function _handleDragEnd(e) {
        e.target.classList.remove('dragging');
        _draggingItem = null;
        
        // Publish drag end event
        window.EventBus.publish('dragEnd', {
            element: e.target,
            id: e.target.id
        });
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch start event
     */
    function _handleTouchStart(e) {
        // Prevent default to avoid scrolling while dragging
        e.preventDefault();
        
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (!target || !target.classList.contains('letter-tile')) return;
        
        _draggingItem = target;
        _draggingItem.classList.add('dragging');
        
        // Save original position for reference
        _originalPosition = {
            parent: _draggingItem.parentElement,
            nextSibling: _draggingItem.nextElementSibling
        };
        
        // Get touch position
        const startX = touch.clientX;
        const startY = touch.clientY;
        
        // Calculate offset from the tile center for more accurate positioning
        const rect = _draggingItem.getBoundingClientRect();
        const offsetX = startX - (rect.left + rect.width / 2);
        const offsetY = startY - (rect.top + rect.height / 2);
        
        // Create a clone for visual feedback
        _dragTileClone = _draggingItem.cloneNode(true);
        _dragTileClone.classList.add('touch-clone');
        _dragTileClone.style.width = `${rect.width}px`;
        _dragTileClone.style.height = `${rect.height}px`;
        
        // Position at the touch point
        _positionCloneAtTouch(touch);
        
        document.body.appendChild(_dragTileClone);
        
        // Make the original semi-transparent to indicate it's being dragged
        _draggingItem.style.opacity = '0.4';
        
        // Play drag sound
        window.AudioService.playSound('drag');
        
        // Publish touch start event
        window.EventBus.publish('touchDragStart', {
            element: _draggingItem,
            id: _draggingItem.id,
            touch: {
                clientX: touch.clientX,
                clientY: touch.clientY
            },
            sourceContainer: _draggingItem.closest('.letter-box') ? 'letter-box' : 'scrambled-word'
        });
    }
    
    /**
     * Handle touch move event
     * @param {TouchEvent} e - Touch move event
     */
    function _handleTouchMove(e) {
        if (!_draggingItem || !_dragTileClone) return;
        
        e.preventDefault(); // Prevent scrolling
        
        const touch = e.touches[0];
        
        // Move the clone with the touch
        _positionCloneAtTouch(touch);
        
        // Identify potential drop targets
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Remove highlight from all potential drop targets
        document.querySelectorAll('.drag-over, .drag-highlight').forEach(el => {
            el.classList.remove('drag-over');
            el.classList.remove('drag-highlight');
        });
        
        // Highlight the potential drop target
        const dropTarget = _findDropTarget(elementUnderTouch);
        if (dropTarget) {
            dropTarget.classList.add('drag-highlight');
        }
        
        // Publish touch move event
        window.EventBus.publish('touchDragMove', {
            element: _draggingItem,
            id: _draggingItem.id,
            touch: {
                clientX: touch.clientX,
                clientY: touch.clientY
            },
            dropTarget: dropTarget ? dropTarget.id : null
        });
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} e - Touch end event
     */
    function _handleTouchEnd(e) {
        if (!_draggingItem || !_dragTileClone) return;
        
        e.preventDefault(); // Prevent default behavior
        
        // Get the position of the last touch
        const touch = e.changedTouches[0];
        
        // Find the element under the touch
        const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Find potential drop target
        const dropTarget = _findDropTarget(elementUnderTouch);
        
        // Reset original tile opacity
        if (_draggingItem) {
            _draggingItem.style.opacity = '1';
        }
        
        // Handle the drop
        if (dropTarget) {
            dropTarget.classList.remove('drag-highlight');
            
            if (dropTarget.classList.contains('letter-box')) {
                _handleDropInLetterBox(dropTarget);
            } else if (dropTarget.id === 'scrambled-word' || dropTarget.closest('#scrambled-word')) {
                _handleDropInScrambledArea(_scrambledWordArea, touch);
            }
        } else {
            // If no valid target, return to original position
            _returnToOriginalPosition();
        }
        
        // Publish touch end event
        window.EventBus.publish('touchDragEnd', {
            element: _draggingItem,
            id: _draggingItem.id,
            dropTarget: dropTarget ? dropTarget.id : null,
            touch: {
                clientX: touch.clientX,
                clientY: touch.clientY
            }
        });
        
        // Clean up
        _cleanupDrag();
    }
    
    /**
     * Position the clone at the touch position
     * @param {Touch} touch - The touch object
     */
    function _positionCloneAtTouch(touch) {
        if (!_dragTileClone) return;
        
        // Center the clone at the touch point
        _dragTileClone.style.left = (touch.clientX - _dragTileClone.offsetWidth/2) + 'px';
        _dragTileClone.style.top = (touch.clientY - _dragTileClone.offsetHeight/2) + 'px';
    }
    
    /**
     * Find a valid drop target from the element under touch
     * @param {HTMLElement} element - The element under touch
     * @returns {HTMLElement|null} The drop target or null
     */
    function _findDropTarget(element) {
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
    function _handleDropInLetterBox(letterBox) {
        // Check if box already has a letter tile
        const existingTile = letterBox.querySelector('.letter-tile');
        
        if (!existingTile) {
            // Empty box - just move the tile there
            letterBox.appendChild(_draggingItem);
        } else {
            // Swap with the existing tile
            
            // 1. Find where our dragged tile came from
            const originalParent = _originalPosition.parent;
            const originalNextSibling = _originalPosition.nextSibling;
            
            // 2. Put the existing tile where our dragged tile came from
            if (originalNextSibling) {
                originalParent.insertBefore(existingTile, originalNextSibling);
            } else {
                originalParent.appendChild(existingTile);
            }
            
            // 3. Put our dragged tile in the letter box
            letterBox.appendChild(_draggingItem);
        }
        
        // Play sound
        window.AudioService.playSound('drag');
        
        // Check if answer is complete
        _checkAnswer();
    }
    
    /**
     * Handle dropping a tile back to the scrambled area
     * @param {HTMLElement} scrambledArea - The scrambled word area
     * @param {Touch} touch - The touch that ended the drag
     */
    function _handleDropInScrambledArea(scrambledArea, touch) {
        // Only proceed if the tile is coming from a letter box
        if (_originalPosition.parent.classList.contains('letter-box')) {
            // Find position to insert based on touch Y position
            const afterElement = _getElementAfterTouch(scrambledArea, touch.clientY);
            
            // Insert at appropriate position
            if (afterElement) {
                scrambledArea.insertBefore(_draggingItem, afterElement);
            } else {
                scrambledArea.appendChild(_draggingItem);
            }
            
            // Play sound
            window.AudioService.playSound('drag');
        } else {
            // Coming from another position in the scrambled area
            // Find position to insert based on touch Y position
            const afterElement = _getElementAfterTouch(scrambledArea, touch.clientY);
            
            // Insert at appropriate position
            if (afterElement && afterElement !== _draggingItem) {
                scrambledArea.insertBefore(_draggingItem, afterElement);
            } else if (!afterElement) {
                scrambledArea.appendChild(_draggingItem);
            } else {
                // Put it back where it was
                _returnToOriginalPosition();
            }
        }
    }
    
    /**
     * Return the dragged tile to its original position
     */
    function _returnToOriginalPosition() {
        if (!_draggingItem || !_originalPosition || !_originalPosition.parent) return;
        
        if (_originalPosition.nextSibling) {
            _originalPosition.parent.insertBefore(_draggingItem, _originalPosition.nextSibling);
        } else {
            _originalPosition.parent.appendChild(_draggingItem);
        }
    }
    
    /**
     * Get element after which to insert based on Y position
     * @param {HTMLElement} container - Container element
     * @param {number} y - Touch Y position
     * @returns {HTMLElement|null} Element to insert after or null
     */
    function _getElementAfterTouch(container, y) {
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
    function _checkAnswer() {
        const allBoxesFilled = _dropArea.querySelectorAll('.letter-box:empty').length === 0;
        if (allBoxesFilled) {
            setTimeout(() => {
                window.EventBus.publish('allLettersPlaced', null);
            }, 100);
        }
    }
    
    /**
     * Clean up after dragging
     */
    function _cleanupDrag() {
        if (_draggingItem) {
            _draggingItem.classList.remove('dragging');
            _draggingItem.style.opacity = '1';
        }
        
        if (_dragTileClone && _dragTileClone.parentElement) {
            _dragTileClone.parentElement.removeChild(_dragTileClone);
        }
        
        // Remove highlight from all potential drop targets
        document.querySelectorAll('.drag-over, .drag-highlight').forEach(el => {
            el.classList.remove('drag-over');
            el.classList.remove('drag-highlight');
        });
        
        // Reset variables
        _draggingItem = null;
        _dragTileClone = null;
        _originalPosition = null;
    }
    
    /**
     * Add touch-specific CSS styles
     */
    function _addTouchStyles() {
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
     * Set up mouse drag handlers for an element
     * @param {HTMLElement} element - Element to set up
     */
    function _setupMouseDragHandlers(element) {
        if (!element) return;
        
        // Skip if already set up
        if (element.dataset.dragEnabled) return;
        
        element.addEventListener('dragstart', _handleDragStart);
        element.addEventListener('dragend', _handleDragEnd);
        
        // Mark as drag-enabled
        element.dataset.dragEnabled = 'true';
    }
    
    /**
     * Set up touch handlers for an element
     * @param {HTMLElement} element - Element to set up
     */
    function _setupTouchHandlers(element) {
        if (!element || !_isTouchDevice) return;
        
        // Skip if already set up
        if (element.dataset.touchEnabled) return;
        
        element.addEventListener('touchstart', _handleTouchStart, { passive: false });
        element.addEventListener('touchmove', _handleTouchMove, { passive: false });
        element.addEventListener('touchend', _handleTouchEnd, { passive: false });
        element.addEventListener('touchcancel', _handleTouchEnd, { passive: false });
        
        // Mark as touch-enabled
        element.dataset.touchEnabled = 'true';
    }
    
    /**
     * Set up mutation observer to watch for new letter tiles
     */
    function _setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.classList.contains('letter-tile')) {
                            _setupMouseDragHandlers(node);
                            _setupTouchHandlers(node);
                        }
                    });
                }
            });
        });
        
        // Observe both drop area and scrambled word area
        observer.observe(_dropArea, { childList: true, subtree: true });
        observer.observe(_scrambledWordArea, { childList: true, subtree: true });
    }
    
    // Public API
    return {
        /**
         * Initialize input manager
         * @returns {Object} InputManager for chaining
         */
        init: function() {
            // Get DOM elements
            _dropArea = document.getElementById('drop-area');
            _scrambledWordArea = document.getElementById('scrambled-word');
            
            // Check for touch support
            _isTouchDevice = _detectTouchSupport();
            
            // Add touch styles if this is a touch device
            if (_isTouchDevice) {
                _addTouchStyles();
            }
            
            // Apply input handlers to existing letter tiles
            document.querySelectorAll('.letter-tile').forEach(tile => {
                _setupMouseDragHandlers(tile);
                _setupTouchHandlers(tile);
            });
            
            // Set up drop area listeners
            this.setupDropAreaListeners();
            
            // Set up mutation observer to watch for new letter tiles
            _setupMutationObserver();
            
            return this;
        },
        
        /**
         * Set up drop area listeners
         * @returns {Object} InputManager for chaining
         */
        setupDropAreaListeners: function() {
            if (!_dropArea || !_scrambledWordArea) return this;
            
            // Set up drop area event listeners
            _dropArea.addEventListener('dragover', e => e.preventDefault());
            _dropArea.addEventListener('drop', e => {
                e.preventDefault();
                
                // Get data and elements
                const id = e.dataTransfer.getData('text/plain');
                const draggedElement = document.getElementById(id);
                
                if (!draggedElement) return;
                
                // Find the first empty letter box
                const emptyBox = _dropArea.querySelector('.letter-box:empty');
                if (emptyBox) {
                    // Create a clone of the dragged tile
                    const clone = draggedElement.cloneNode(true);
                    
                    // Set up drag handlers on the clone
                    _setupMouseDragHandlers(clone);
                    _setupTouchHandlers(clone);
                    
                    // Add to target and remove original
                    emptyBox.appendChild(clone);
                    draggedElement.remove();
                    
                    // Play sound
                    window.AudioService.playSound('drag');
                    
                    // Check if answer is complete
                    _checkAnswer();
                }
            });
            
            // Set up scrambled word area event listeners
            _scrambledWordArea.addEventListener('dragover', e => e.preventDefault());
            _scrambledWordArea.addEventListener('drop', e => {
                e.preventDefault();
                
                // Get data and elements
                const id = e.dataTransfer.getData('text/plain');
                const draggedElement = document.getElementById(id);
                
                if (!draggedElement) return;
                
                // Only process if coming from drop area letter box
                const sourceContainer = e.dataTransfer.getData('source-container');
                if (sourceContainer === 'letter-box') {
                    // Add to scrambled word area
                    _scrambledWordArea.appendChild(draggedElement);
                    
                    // Play sound
                    window.AudioService.playSound('drag');
                }
            });
            
            return this;
        },
        
        /**
         * Check if the device supports touch
         * @returns {boolean} Whether the device supports touch
         */
        isTouchDevice: function() {
            return _isTouchDevice;
        }
    };
})();

// Export the module
window.InputManager = InputManager;
