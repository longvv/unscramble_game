/**
 * Drag and Drop Module for Word Scramble Game
 * Handles all drag and drop interactions
 */
const DragDropManager = (function() {
    // Private state
    let _draggedItem = null;
    let _gameController = null;
    
    // Public API
    return {
        /**
         * Initialize drag and drop manager
         * @param {Object} gameController - Reference to game controller
         * @returns {Object} DragDropManager for chaining
         */
        init: function(gameController) {
            _gameController = gameController;
            return this;
        },
        
        /**
         * Handle drag start event
         * @param {Event} e - Drag start event
         */
        dragStart: function(e) {
            _draggedItem = e.target;
            e.dataTransfer.setData('text/plain', e.target.id);
            e.target.classList.add('dragging');
            
            // Create a better drag image that's visible during dragging
            // Create a clone of the tile for the drag image
            const dragImage = e.target.cloneNode(true);
            dragImage.style.width = '50px';
            dragImage.style.height = '50px';
            dragImage.style.opacity = '0.9';
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            document.body.appendChild(dragImage);
            
            // Set the custom drag image
            e.dataTransfer.setDragImage(dragImage, 25, 25);
            
            // Remove the temporary element after a short delay
            setTimeout(() => {
                document.body.removeChild(dragImage);
            }, 0);
            
            // Play drag sound
            window.AudioService.playSound('drag');
        },
        
        /**
         * Handle drag end event
         * @param {Event} e - Drag end event
         */
        dragEnd: function(e) {
            e.target.classList.remove('dragging');
            _draggedItem = null;
        },
        
        /**
         * Handle drag over event
         * @param {Event} e - Drag over event
         */
        dragOver: function(e) {
            e.preventDefault();
        },
        
        /**
         * Handle drag enter event
         * @param {Event} e - Drag enter event
         */
        dragEnter: function(e) {
            e.preventDefault();
            // Always add the drag-over class to indicate a valid drop target
            // Regardless of whether the target already has a letter or not
            e.target.classList.add('drag-over');
        },
        
        /**
         * Handle drag leave event
         * @param {Event} e - Drag leave event
         */
        dragLeave: function(e) {
            e.target.classList.remove('drag-over');
        },
        
        /**
         * Handle drop on letter box
         * @param {Event} e - Drop event
         * @param {Function} checkAnswerCallback - Callback to check answer
         */
        dropOnLetterBox: function(e, checkAnswerCallback) {
            e.preventDefault();
            e.stopPropagation(); // Stop event propagation
            e.target.classList.remove('drag-over');
            
            // Get data and elements
            const id = e.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(id);
            
            if (!draggedElement) return;
            
            // Make sure we're targeting the letter-box even if a child element was the target
            let targetBox = e.target;
            while (targetBox && !targetBox.classList.contains('letter-box')) {
                targetBox = targetBox.parentElement;
            }
            
            if (!targetBox) return;
            
            // Check if target box already has a letter tile
            const existingTile = targetBox.querySelector('.letter-tile');
            
            // Create clone of the dragged tile
            const clone = draggedElement.cloneNode(true);
            clone.classList.remove('dragging');
            
            // Add new event listeners to the clone
            clone.addEventListener('dragstart', this.dragStart);
            clone.addEventListener('dragend', this.dragEnd);
            
            // If target already has a letter tile, we need to swap them
            if (existingTile) {
                // Create a clone of the existing tile
                const existingClone = existingTile.cloneNode(true);
                existingClone.classList.remove('dragging');
                
                // Add event listeners to the existing tile clone
                existingClone.addEventListener('dragstart', this.dragStart);
                existingClone.addEventListener('dragend', this.dragEnd);
                
                // First remove the existing tile from the target
                existingTile.remove();
                
                // Then append the dragged tile clone to the target
                targetBox.appendChild(clone);
                
                // Find the original location of the dragged tile
                const originalParent = draggedElement.parentElement;
                
                // Replace the dragged element with the existing tile clone
                if (originalParent) {
                    draggedElement.remove();
                    originalParent.appendChild(existingClone);
                } else {
                    // If the dragged element doesn't have a parent (unlikely), add it to scrambled word area
                    document.getElementById('scrambled-word').appendChild(existingClone);
                    draggedElement.remove();
                }
            } else {
                // Normal case - target box is empty
                targetBox.appendChild(clone);
                draggedElement.remove();
            }
            
            // Play a sound feedback
            window.AudioService.playSound('drag');
            
            // Check if answer is complete
            if (typeof checkAnswerCallback === 'function') {
                const allBoxesFilled = document.querySelectorAll('.letter-box:empty').length === 0;
                if (allBoxesFilled) {
                    checkAnswerCallback();
                }
            }
        },
        
        /**
         * Handle drop on main drop area
         * @param {Event} e - Drop event
         * @param {HTMLElement} dropArea - Drop area element
         * @param {Function} checkAnswerCallback - Callback to check answer
         */
        dropOnMainArea: function(e, dropArea, checkAnswerCallback) {
            e.preventDefault();
            
            // Get data and elements
            const id = e.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(id);
            
            if (!draggedElement) return;
            
            // Find the first empty letter box
            const emptyBox = dropArea.querySelector('.letter-box:empty');
            if (emptyBox) {
                // Clone the element to avoid issues with removal
                const clone = draggedElement.cloneNode(true);
                clone.classList.remove('dragging');
                
                // Add new event listeners to the clone
                clone.addEventListener('dragstart', this.dragStart);
                clone.addEventListener('dragend', this.dragEnd);
                
                // Add to target and remove original
                emptyBox.appendChild(clone);
                draggedElement.remove();
                
                // Check if answer is complete
                if (typeof checkAnswerCallback === 'function') {
                    const allBoxesFilled = dropArea.querySelectorAll('.letter-box:empty').length === 0;
                    if (allBoxesFilled) {
                        checkAnswerCallback();
                    }
                }
            }
        },
        
        /**
         * Handle drop back to scrambled area
         * @param {Event} e - Drop event
         * @param {HTMLElement} scrambledWordElement - Scrambled word element
         */
        dropOnScrambledArea: function(e, scrambledWordElement) {
            e.preventDefault();
            
            // Get data and elements
            const id = e.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(id);
            
            if (!draggedElement) return;
            
            // Find position to insert based on mouse Y position
            const afterElement = this.getDragAfterElement(scrambledWordElement, e.clientY);
            
            // Clone the element to avoid issues with removal
            const clone = draggedElement.cloneNode(true);
            clone.classList.remove('dragging');
            
            // Add new event listeners to the clone
            clone.addEventListener('dragstart', this.dragStart);
            clone.addEventListener('dragend', this.dragEnd);
            
            // Insert at appropriate position and remove original
            if (afterElement) {
                scrambledWordElement.insertBefore(clone, afterElement);
            } else {
                scrambledWordElement.appendChild(clone);
            }
            
            draggedElement.remove();
        },
        
        /**
         * Get element after which to insert based on Y position
         * @param {HTMLElement} container - Container element
         * @param {number} y - Mouse Y position
         * @returns {HTMLElement|null} Element to insert after or null
         */
        getDragAfterElement: function(container, y) {
            // Get all draggable elements that aren't being dragged
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
        },
        
        /**
         * Set up drop area event listeners
         * @param {HTMLElement} dropArea - Drop area element
         * @param {Function} checkAnswerCallback - Callback to check answer
         */
        setupDropAreaListeners: function(dropArea, checkAnswerCallback) {
            dropArea.addEventListener('dragover', this.dragOver);
            
            // Set up drop handler on main drop area
            dropArea.addEventListener('drop', (e) => {
                this.dropOnMainArea(e, dropArea, checkAnswerCallback);
            });
            
            return this;
        },
        
        /**
         * Set up scrambled area event listeners
         * @param {HTMLElement} scrambledArea - Scrambled word element
         */
        setupScrambledAreaListeners: function(scrambledArea) {
            scrambledArea.addEventListener('dragover', this.dragOver);
            
            // Set up drop handler on scrambled area
            scrambledArea.addEventListener('drop', (e) => {
                this.dropOnScrambledArea(e, scrambledArea);
            });
            
            return this;
        },
        
        /**
         * Get drop callbacks for letter boxes
         * @param {Function} checkAnswerCallback - Callback to check answer
         * @returns {Object} Object with callback functions
         */
        getLetterBoxCallbacks: function(checkAnswerCallback) {
            return {
                dragOver: this.dragOver,
                dragEnter: this.dragEnter,
                dragLeave: this.dragLeave,
                drop: (e) => this.dropOnLetterBox(e, checkAnswerCallback)
            };
        }
    };
})();

// Export the module
window.DragDropManager = DragDropManager;
