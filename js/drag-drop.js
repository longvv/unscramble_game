/**
 * Enhanced DragDropManager Module for Word Scramble Game
 * Provides unified handling for both mouse and touch drag/drop functionality
 */
const DragDropManager = (function() {
    // Private state
    let _draggingItem = null;
    let _originalPosition = null;
    let _dropArea = null;
    let _scrambledWordArea = null;
    
    // Private methods
    
    /**
     * Handle drag start event
     * @param {Event} e - Drag start event
     */
    function _handleDragStart(e) {
        _draggingItem = e.target;
        
        // Store the data needed for the drop
        e.dataTransfer.setData('text/plain', e.target.id);
        e.dataTransfer.setData('source-container', 
            e.target.closest('.letter-box') ? 'letter-box' : 'scrambled-word');
        
        // Add visual indicator for dragging
        e.target.classList.add('dragging');
        
        // Record original position for potential return
        _originalPosition = {
            parent: e.target.parentElement,
            nextSibling: e.target.nextElementSibling
        };
        
        // Play drag sound if available
        if (window.AudioService && typeof window.AudioService.playSound === 'function') {
            window.AudioService.playSound('drag');
        }
        
        // Publish drag start event if EventBus is available
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish('dragStart', {
                element: e.target,
                id: e.target.id,
                sourceContainer: e.target.closest('.letter-box') ? 'letter-box' : 'scrambled-word'
            });
        }
    }
    
    /**
     * Handle drag end event
     * @param {Event} e - Drag end event
     */
    function _handleDragEnd(e) {
        e.target.classList.remove('dragging');
        _draggingItem = null;
        
        // Publish drag end event if EventBus is available
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish('dragEnd', {
                element: e.target,
                id: e.target.id
            });
        }
    }
    
    /**
     * Handle drag over event - allows for drop
     * @param {Event} e - Drag over event
     */
    function _handleDragOver(e) {
        e.preventDefault(); // Necessary to allow drop
        return false;
    }
    
    /**
     * Handle drag enter event - visual feedback
     * @param {Event} e - Drag enter event
     */
    function _handleDragEnter(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }
    
    /**
     * Handle drag leave event - remove visual feedback
     * @param {Event} e - Drag leave event
     */
    function _handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }
    
    /**
     * Handle drop event in letter boxes
     * @param {Event} e - Drop event
     */
    function _handleLetterBoxDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        // Get the dragged element data
        const id = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(id);
        
        if (!draggedElement) return;
        
        const letterBox = e.currentTarget;
        
        // Check if the letter box already has a letter
        const existingTile = letterBox.querySelector('.letter-tile');
        
        if (existingTile) {
            // Swap with existing tile
            const sourceParent = draggedElement.parentElement;
            
            // Move existing tile to where dragged element came from
            sourceParent.appendChild(existingTile);
            
            // Move dragged element to letter box
            letterBox.appendChild(draggedElement);
        } else {
            // Empty box - just move the tile there
            letterBox.appendChild(draggedElement);
        }
        
        // Play sound effect
        if (window.AudioService && typeof window.AudioService.playSound === 'function') {
            window.AudioService.playSound('drag');
        }
        
        // Check if all letter boxes are filled to trigger completion check
        _checkCompleteness();
        
        // Publish drop event if EventBus is available
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish('letterDropped', {
                letter: draggedElement.textContent,
                targetBox: letterBox.getAttribute('data-position')
            });
        }
    }
    
    /**
     * Handle drop in scrambled word area
     * @param {Event} e - Drop event
     */
    function _handleScrambledAreaDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        // Get data and elements
        const id = e.dataTransfer.getData('text/plain');
        const sourceContainer = e.dataTransfer.getData('source-container');
        const draggedElement = document.getElementById(id);
        
        if (!draggedElement) return;
        
        // Only allow drops from letter boxes to scrambled area
        if (sourceContainer === 'letter-box') {
            _scrambledWordArea.appendChild(draggedElement);
            
            // Play sound effect
            if (window.AudioService && typeof window.AudioService.playSound === 'function') {
                window.AudioService.playSound('drag');
            }
            
            // Publish event if EventBus is available
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('letterReturnedToScrambled', {
                    letter: draggedElement.textContent
                });
            }
        }
    }
    
    /**
     * Check if all letter boxes are filled to trigger completion check
     */
    function _checkCompleteness() {
        if (!_dropArea) return;
        
        const allBoxesFilled = _dropArea.querySelectorAll('.letter-box:empty').length === 0;
        
        if (allBoxesFilled) {
            // Small delay to ensure DOM updates are complete
            setTimeout(() => {
                // Trigger event for all letters placed
                if (window.EventBus && typeof window.EventBus.publish === 'function') {
                    window.EventBus.publish('allLettersPlaced', null);
                }
            }, 100);
        }
    }
    
    /**
     * Set up touch handlers for mobile devices
     * This is a simple integration with TouchDragManager if it exists
     */
    function _setupTouchHandlers() {
        // If TouchDragManager exists, it will handle touch events
        // If not, we'll rely on the browser's touch-to-mouse event translation
        if (!window.TouchDragManager && typeof navigator !== 'undefined' && 'ontouchstart' in window) {
            console.log('No TouchDragManager found, but touch device detected. Using simplified touch handling.');
            
            // Basic touch event handling if no TouchDragManager is available
            document.querySelectorAll('.letter-tile').forEach(tile => {
                tile.addEventListener('touchstart', function(e) {
                    e.preventDefault(); // Prevent scrolling when starting drag
                });
            });
        }
    }
    
    // Public API
    return {
        /**
         * Initialize drag and drop manager
         * @returns {Object} DragDropManager for chaining
         */
        init: function() {
            // Get DOM elements
            _dropArea = document.getElementById('drop-area');
            _scrambledWordArea = document.getElementById('scrambled-word');
            
            if (!_dropArea || !_scrambledWordArea) {
                console.error('Required DOM elements not found.');
                return this;
            }
            
            // Set up event handlers for drop area
            this.setupDropAreaListeners();
            
            // Set up event handlers for scrambled word area
            this.setupScrambledAreaListeners();
            
            // Set up touch handlers if needed
            _setupTouchHandlers();
            
            console.log('DragDropManager initialized successfully');
            return this;
        },
        
        /**
         * Handle drag start event (exposed for external binding)
         * @param {Event} e - Drag start event
         */
        dragStart: function(e) {
            _handleDragStart(e);
        },
        
        /**
         * Handle drag end event (exposed for external binding)
         * @param {Event} e - Drag end event
         */
        dragEnd: function(e) {
            _handleDragEnd(e);
        },
        
        /**
         * Set up event listeners for drop area
         * @returns {Object} DragDropManager for chaining
         */
        setupDropAreaListeners: function() {
            if (!_dropArea) return this;
            
            // Add event listeners to letter boxes in drop area
            const letterBoxes = _dropArea.querySelectorAll('.letter-box');
            letterBoxes.forEach(box => {
                box.addEventListener('dragover', _handleDragOver);
                box.addEventListener('dragenter', _handleDragEnter);
                box.addEventListener('dragleave', _handleDragLeave);
                box.addEventListener('drop', _handleLetterBoxDrop);
            });
            
            // Set up a mutation observer to handle new letter boxes
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1 && node.classList.contains('letter-box')) {
                                node.addEventListener('dragover', _handleDragOver);
                                node.addEventListener('dragenter', _handleDragEnter);
                                node.addEventListener('dragleave', _handleDragLeave);
                                node.addEventListener('drop', _handleLetterBoxDrop);
                            }
                        });
                    }
                });
            });
            
            observer.observe(_dropArea, { childList: true, subtree: false });
            
            return this;
        },
        
        /**
         * Set up event listeners for scrambled word area
         * @returns {Object} DragDropManager for chaining
         */
        setupScrambledAreaListeners: function() {
            if (!_scrambledWordArea) return this;
            
            _scrambledWordArea.addEventListener('dragover', _handleDragOver);
            _scrambledWordArea.addEventListener('dragenter', _handleDragEnter);
            _scrambledWordArea.addEventListener('dragleave', _handleDragLeave);
            _scrambledWordArea.addEventListener('drop', _handleScrambledAreaDrop);
            
            return this;
        },
        
        /**
         * Get callbacks for letter boxes
         * @param {Function} onCompleteCallback - Callback when all boxes are filled
         * @returns {Object} Object with callback functions
         */
        getLetterBoxCallbacks: function(onCompleteCallback) {
            return {
                dragOver: _handleDragOver,
                dragEnter: _handleDragEnter,
                dragLeave: _handleDragLeave,
                drop: function(e) {
                    e.preventDefault();
                    e.currentTarget.classList.remove('drag-over');
                    
                    const id = e.dataTransfer.getData('text/plain');
                    const draggedElement = document.getElementById(id);
                    
                    if (!draggedElement) return;
                    
                    // Check if box already has a letter tile
                    const existingTile = e.currentTarget.querySelector('.letter-tile');
                    
                    if (existingTile) {
                        // Swap tiles
                        const sourceParent = draggedElement.parentElement;
                        sourceParent.appendChild(existingTile);
                    }
                    
                    // Add dragged tile to letter box
                    e.currentTarget.appendChild(draggedElement);
                    
                    // Play sound effect
                    if (window.AudioService && typeof window.AudioService.playSound === 'function') {
                        window.AudioService.playSound('drag');
                    }
                    
                    // Check completeness
                    if (onCompleteCallback) {
                        const allBoxesFilled = _dropArea.querySelectorAll('.letter-box:empty').length === 0;
                        if (allBoxesFilled) {
                            onCompleteCallback();
                        }
                    }
                }
            };
        }
    };
})();

// Export the module
window.DragDropManager = DragDropManager;