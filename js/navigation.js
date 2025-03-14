/**
 * Navigation Module for Word Scramble Game
 * Handles navigation between screens and menu interactions
 */
const Navigation = (function() {
    // Private state
    let _currentScreen = 'game-screen';
    let _isMenuOpen = false;
    
    // DOM elements
    let _elements = {
        menuToggle: null,
        leftMenu: null,
        menuOverlay: null,
        contentContainer: null,
        menuItems: null,
        screenSections: null
    };
    
    /**
     * Initialize navigation elements
     */
    function _init() {
        // Get DOM elements
        _elements.menuToggle = document.getElementById('menu-toggle');
        _elements.leftMenu = document.getElementById('left-menu');
        _elements.menuOverlay = document.getElementById('menu-overlay');
        _elements.contentContainer = document.getElementById('content-container');
        _elements.menuItems = document.querySelectorAll('.menu-item');
        _elements.screenSections = document.querySelectorAll('.screen-section');
        
        // Set up event listeners
        if (_elements.menuToggle) {
            _elements.menuToggle.addEventListener('click', _toggleMenu);
        }
        
        if (_elements.menuOverlay) {
            _elements.menuOverlay.addEventListener('click', _closeMenu);
        }
        
        // Set up menu item click handlers
        if (_elements.menuItems) {
            _elements.menuItems.forEach(item => {
                item.addEventListener('click', () => {
                    const screenId = item.getAttribute('data-screen');
                    if (screenId) {
                        _navigateToScreen(screenId);
                        _closeMenu();
                    }
                });
            });
        }
        
        // Initialize with the game screen active
        _navigateToScreen('game-screen');
        
        // Publish initialization event
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish('navigationInitialized', null);
        }
    }
    
    /**
     * Toggle menu open/closed
     */
    function _toggleMenu() {
        if (_isMenuOpen) {
            _closeMenu();
        } else {
            _openMenu();
        }
    }
    
    /**
     * Open the menu
     */
    function _openMenu() {
        if (_elements.leftMenu) {
            _elements.leftMenu.classList.add('open');
        }
        
        if (_elements.menuOverlay) {
            _elements.menuOverlay.classList.add('open');
        }
        
        if (_elements.contentContainer) {
            _elements.contentContainer.classList.add('menu-open');
        }
        
        _isMenuOpen = true;
        
        // Publish menu open event
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish('menuOpened', null);
        }
    }
    
    /**
     * Close the menu
     */
    function _closeMenu() {
        if (_elements.leftMenu) {
            _elements.leftMenu.classList.remove('open');
        }
        
        if (_elements.menuOverlay) {
            _elements.menuOverlay.classList.remove('open');
        }
        
        if (_elements.contentContainer) {
            _elements.contentContainer.classList.remove('menu-open');
        }
        
        _isMenuOpen = false;
        
        // Publish menu close event
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish('menuClosed', null);
        }
    }
    
    /**
     * Navigate to a specific screen
     * @param {string} screenId - ID of the screen to navigate to
     */
    function _navigateToScreen(screenId) {
        // Skip if already on this screen
        if (_currentScreen === screenId) return;
        
        // Hide all screens
        if (_elements.screenSections) {
            _elements.screenSections.forEach(section => {
                section.classList.remove('active');
            });
        }
        
        // Show the selected screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            _currentScreen = screenId;
            
            // Update active menu item
            if (_elements.menuItems) {
                _elements.menuItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('data-screen') === screenId) {
                        item.classList.add('active');
                    }
                });
            }
            
            // Publish screen change event
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('screenChanged', { screenId });
            }
        }
    }
    
    // Public API
    return {
        /**
         * Initialize the navigation module
         */
        init: function() {
            _init();
            return this;
        },
        
        /**
         * Navigate to a specific screen
         * @param {string} screenId - ID of the screen to navigate to
         */
        navigateToScreen: function(screenId) {
            _navigateToScreen(screenId);
            return this;
        },
        
        /**
         * Get the current screen ID
         * @returns {string} Current screen ID
         */
        getCurrentScreen: function() {
            return _currentScreen;
        },
        
        /**
         * Check if menu is open
         * @returns {boolean} Whether menu is open
         */
        isMenuOpen: function() {
            return _isMenuOpen;
        },
        
        /**
         * Open the menu
         */
        openMenu: function() {
            _openMenu();
            return this;
        },
        
        /**
         * Close the menu
         */
        closeMenu: function() {
            _closeMenu();
            return this;
        }
    };
})();

// Export the module
window.Navigation = Navigation;

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation after a short delay to ensure other modules are loaded
    setTimeout(() => {
        if (window.Navigation && typeof window.Navigation.init === 'function') {
            window.Navigation.init();
        }
    }, 100);
});