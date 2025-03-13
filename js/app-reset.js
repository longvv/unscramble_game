/**
 * App Reset Module for Word Scramble Game
 * Handles clearing app data and resetting settings
 */
const AppReset = (function() {
    // Private methods
    
    /**
     * Clear all app data
     * @returns {Promise<boolean>} Success status
     */
    async function _clearAllData() {
        try {
            // Clear localStorage
            localStorage.clear();
            
            // Clear IndexedDB databases
            await _clearIndexedDB();
            
            // Clear cache if possible
            await _clearCache();
            
            return true;
        } catch (error) {
            console.error('Error clearing app data:', error);
            return false;
        }
    }
    
    /**
     * Clear all IndexedDB databases used by the app
     * @returns {Promise<boolean>} Success status
     */
    async function _clearIndexedDB() {
        return new Promise((resolve) => {
            try {
                // Get list of all databases
                if (!window.indexedDB.databases) {
                    // For browsers that don't support databases() method, try known databases
                    const knownDatabases = [
                        'word_scramble_db',
                        'word_scramble_offline_queue'
                    ];
                    
                    knownDatabases.forEach(dbName => {
                        const request = window.indexedDB.deleteDatabase(dbName);
                        request.onsuccess = () => console.log(`Database ${dbName} deleted successfully`);
                        request.onerror = () => console.error(`Error deleting database ${dbName}`);
                    });
                    
                    resolve(true);
                    return;
                }
                
                // For browsers that support databases() method
                window.indexedDB.databases().then(databases => {
                    const deletionPromises = databases.map(db => {
                        return new Promise((resolveDelete) => {
                            const request = window.indexedDB.deleteDatabase(db.name);
                            request.onsuccess = () => {
                                console.log(`Database ${db.name} deleted successfully`);
                                resolveDelete(true);
                            };
                            request.onerror = () => {
                                console.error(`Error deleting database ${db.name}`);
                                resolveDelete(false);
                            };
                        });
                    });
                    
                    Promise.all(deletionPromises).then(() => {
                        resolve(true);
                    });
                });
            } catch (error) {
                console.error('Error clearing IndexedDB:', error);
                resolve(false);
            }
        });
    }
    
    /**
     * Clear cache storage if available
     * @returns {Promise<boolean>} Success status
     */
    async function _clearCache() {
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
                return true;
            } catch (error) {
                console.error('Error clearing cache:', error);
                return false;
            }
        }
        return false;
    }
    
    /**
     * Reset user preferences to defaults
     * @returns {boolean} Success status
     */
    function _resetPreferences() {
        try {
            const defaultPrefs = {
                soundEnabled: true,
                notificationsEnabled: true,
                hintsAllowed: true,
                difficulty: 'medium'
            };
            
            localStorage.setItem('userPreferences', JSON.stringify(defaultPrefs));
            return true;
        } catch (error) {
            console.error('Error resetting preferences:', error);
            return false;
        }
    }
    
    /**
     * Reset game score
     * @returns {Promise<boolean>} Success status
     */
    async function _resetScore() {
        try {
            // Reset in GameState
            if (window.GameState && typeof window.GameState.update === 'function') {
                window.GameState.update({
                    score: 0
                });
            }
            
            // Reset in database if available
            if (window.DatabaseService && 
                typeof window.DatabaseService.saveScore === 'function' &&
                window.DatabaseService.isInitialized()) {
                await window.DatabaseService.saveScore(0);
            }
            
            // Reset in localStorage as fallback
            if (window.StorageService && typeof window.StorageService.saveScore === 'function') {
                window.StorageService.saveScore(0);
            }
            
            return true;
        } catch (error) {
            console.error('Error resetting score:', error);
            return false;
        }
    }
    
    // Public API
    return {
        /**
         * Reset all app data (factory reset)
         * @returns {Promise<boolean>} Success status
         */
        factoryReset: async function() {
            try {
                const success = await _clearAllData();
                
                // Show confirmation dialog
                if (success) {
                    alert('All app data has been cleared. The app will now reload.');
                    window.location.reload();
                } else {
                    alert('There was an error clearing app data. Please try again.');
                }
                
                return success;
            } catch (error) {
                console.error('Factory reset error:', error);
                return false;
            }
        },
        
        /**
         * Reset user preferences to defaults
         * @returns {boolean} Success status
         */
        resetPreferences: function() {
            return _resetPreferences();
        },
        
        /**
         * Reset game score to zero
         * @returns {Promise<boolean>} Success status
         */
        resetScore: function() {
            return _resetScore();
        },
        
        /**
         * Clear the word list and restore defaults
         * @returns {Promise<boolean>} Success status
         */
        resetWordList: async function() {
            try {
                // Clear custom words from database if available
                if (window.DatabaseService && window.DatabaseService.isInitialized()) {
                    await window.DatabaseService.clearAllData();
                    
                    // Reload defaults
                    if (window.WordManager && typeof window.WordManager.refreshData === 'function') {
                        await window.WordManager.refreshData();
                    }
                    
                    return true;
                }
                
                // Fallback to StorageService
                if (window.StorageService) {
                    window.StorageService.clearAllData();
                    
                    // Reload page to initialize with defaults
                    window.location.reload();
                    return true;
                }
                
                return false;
            } catch (error) {
                console.error('Error resetting word list:', error);
                return false;
            }
        }
    };
})();

// Export the module
window.AppReset = AppReset;
