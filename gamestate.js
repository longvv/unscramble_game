/**
 * GameState Module for Word Scramble Game
 * Centralizes game state management with change notification
 */
const GameState = (function() {
    // Private state
    let _state = {
        currentWord: '',
        scrambledWord: '',
        currentImageUrl: '',
        score: 0,
        hintUsed: false,
        availableWords: []
    };
    
    // Private methods
    
    /**
     * Compare two objects to detect changes
     * @param {Object} oldObj - Old object
     * @param {Object} newObj - New object
     * @returns {Object} Object with changed properties
     */
    function _getChanges(oldObj, newObj) {
        const changes = {};
        
        // Find all keys that exist in either object
        const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
        
        // Check each key for changes
        allKeys.forEach(key => {
            // Only add to changes if the values differ
            if (oldObj[key] !== newObj[key]) {
                changes[key] = {
                    oldValue: oldObj[key],
                    newValue: newObj[key]
                };
            }
        });
        
        return changes;
    }
    
    // Public API
    return {
        /**
         * Initialize game state
         * @returns {Object} GameState for chaining
         */
        init: function() {
            // Reset state to initial values
            this.resetState();
            return this;
        },
        
        /**
         * Get the entire state
         * @returns {Object} Copy of current state
         */
        getState: function() {
            return {..._state}; // Return a copy to prevent direct modification
        },
        
        /**
         * Get a specific state property
         * @param {string} property - State property name
         * @returns {*} Value of the property
         */
        get: function(property) {
            return _state[property];
        },
        
        /**
         * Update state with new values
         * @param {Object} newValues - Object with new state values
         * @returns {boolean} Success status
         */
        update: function(newValues) {
            if (!newValues || typeof newValues !== 'object') {
                console.error('New state values must be an object');
                return false;
            }
            
            try {
                // Store the old state for change detection
                const oldState = {..._state};
                
                // Update state
                _state = {..._state, ...newValues};
                
                // Detect changes
                const changes = _getChanges(oldState, _state);
                
                // Notify about state changes if any occurred
                if (Object.keys(changes).length > 0) {
                    window.EventBus.publish('stateChanged', {
                        changes,
                        oldState,
                        newState: {..._state}
                    });
                }
                
                return true;
            } catch (error) {
                console.error('Error updating game state:', error);
                return false;
            }
        },
        
        /**
         * Reset state to initial values
         * @returns {boolean} Success status
         */
        resetState: function() {
            const oldState = {..._state};
            
            _state = {
                currentWord: '',
                scrambledWord: '',
                currentImageUrl: '',
                score: 0,
                hintUsed: false,
                availableWords: []
            };
            
            // Notify about reset
            window.EventBus.publish('stateReset', {
                oldState,
                newState: {..._state}
            });
            
            return true;
        }
    };
})();

// Export the module
window.GameState = GameState;
