/**
 * EventBus Module for Word Scramble Game
 * Provides a central event system for communication between modules
 */
const EventBus = (function() {
    // Private state
    const _events = {};
    
    // Private methods
    
    /**
     * Validate event name format
     * @param {string} eventName - Name of the event
     * @returns {boolean} Whether the event name is valid
     */
    function _validateEventName(eventName) {
        if (typeof eventName !== 'string') {
            console.error('Event name must be a string');
            return false;
        }
        if (eventName.trim() === '') {
            console.error('Event name cannot be empty');
            return false;
        }
        return true;
    }
    
    /**
     * Validate callback is a function
     * @param {Function} callback - Callback function
     * @returns {boolean} Whether the callback is valid
     */
    function _validateCallback(callback) {
        if (typeof callback !== 'function') {
            console.error('Callback must be a function');
            return false;
        }
        return true;
    }
    
    // Public API
    return {
        /**
         * Subscribe to an event
         * @param {string} eventName - Name of the event
         * @param {Function} callback - Callback function
         * @returns {boolean} Success status
         */
        subscribe: function(eventName, callback) {
            if (!_validateEventName(eventName) || !_validateCallback(callback)) {
                return false;
            }
            
            if (!_events[eventName]) {
                _events[eventName] = [];
            }
            
            // Avoid duplicate subscriptions
            if (!_events[eventName].includes(callback)) {
                _events[eventName].push(callback);
            }
            
            return true;
        },
        
        /**
         * Unsubscribe from an event
         * @param {string} eventName - Name of the event
         * @param {Function} callback - Callback function
         * @returns {boolean} Success status
         */
        unsubscribe: function(eventName, callback) {
            if (!_validateEventName(eventName) || !_validateCallback(callback)) {
                return false;
            }
            
            if (!_events[eventName]) {
                return false;
            }
            
            const initialLength = _events[eventName].length;
            _events[eventName] = _events[eventName].filter(cb => cb !== callback);
            
            return _events[eventName].length < initialLength;
        },
        
        /**
         * Publish an event
         * @param {string} eventName - Name of the event
         * @param {*} data - Data to pass to subscribers
         * @returns {boolean} Success status
         */
        publish: function(eventName, data) {
            if (!_validateEventName(eventName)) {
                return false;
            }
            
            if (!_events[eventName]) {
                return false;
            }
            
            try {
                _events[eventName].forEach(callback => callback(data));
                return true;
            } catch (error) {
                console.error(`Error publishing event "${eventName}":`, error);
                return false;
            }
        },
        
        /**
         * Clear all subscriptions for an event
         * @param {string} eventName - Name of the event
         * @returns {boolean} Success status
         */
        clearEvent: function(eventName) {
            if (!_validateEventName(eventName)) {
                return false;
            }
            
            if (!_events[eventName]) {
                return false;
            }
            
            delete _events[eventName];
            return true;
        },
        
        /**
         * Get all registered events
         * @returns {Array} Array of event names
         */
        getEvents: function() {
            return Object.keys(_events);
        }
    };
})();

// Export the module
window.EventBus = EventBus;
