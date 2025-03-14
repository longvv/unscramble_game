/**
 * PWA Handlers for Word Scramble Game
 * Manages offline mode, installation, and mobile-specific behaviors
 */
const PWAHandler = (function() {
    // Private variables
    let deferredPrompt;
    let isAppInstalled = false;
    let isOffline = !navigator.onLine;
    
    // DOM elements
    const offlineNotification = document.getElementById('offline-notification');
    const installBanner = document.getElementById('install-banner');
    const installButton = document.getElementById('install-button');
    const closeInstallButton = document.getElementById('close-install-button');
    const offlinePage = document.getElementById('offline-page');
    const reloadButton = document.getElementById('reload-button');
    
    // Private methods
    
    /**
     * Update the UI based on online/offline status
     */
    function _updateOnlineStatus() {
        isOffline = !navigator.onLine;
        
        if (isOffline) {
            // Show offline notification
            if (offlineNotification) {
                offlineNotification.classList.add('show');
            }
            
            // Check if cached content is available
            if (offlinePage && !_isContentCached()) {
                offlinePage.style.display = 'flex';
            }
            
            // Publish offline event if EventBus is available
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('appOffline', null);
            }
        } else {
            // Hide offline notification
            if (offlineNotification) {
                offlineNotification.classList.remove('show');
                
                // Hide after transition completes
                setTimeout(() => {
                    if (offlinePage) {
                        offlinePage.style.display = 'none';
                    }
                }, 300);
            }
            
            // Publish online event if EventBus is available
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('appOnline', null);
            }
            
            // If we have any pending sync operations, trigger them
            _syncOfflineData();
        }
    }
    
    /**
     * Check if content is cached and can be displayed offline
     * @returns {Promise<boolean>} Whether content is cached
     */
    async function _isContentCached() {
        if (!('caches' in window)) {
            return false;
        }
        
        try {
            const cache = await caches.open('word-scramble-v1');
            const cachedHome = await cache.match('/index.html');
            return !!cachedHome;
        } catch (error) {
            console.error('Error checking cache:', error);
            return false;
        }
    }
    
    /**
     * Handle installation prompt
     * @param {Event} e - Before install prompt event
     */
    function _handleInstallPrompt(e) {
        // Prevent Chrome 67+ from automatically showing the prompt
        e.preventDefault();
        
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        
        // Show install banner if app is not already installed
        if (!isAppInstalled && installBanner) {
            installBanner.classList.add('show');
        }
    }
    
    /**
     * Show iOS-specific install instructions
     */
    function _showIOSInstallInstructions() {
        if (!installBanner) return;
        
        // Check if we've already shown this prompt
        if (localStorage.getItem('install-prompt-shown')) {
            return;
        }
        
        // Add iOS class and update text
        installBanner.classList.add('show', 'ios');
        
        // Update text content
        const installText = installBanner.querySelector('.install-text p');
        if (installText) {
            installText.textContent = 'Tap the share icon and select "Add to Home Screen"';
        }
        
        // Hide install button as it's not applicable for iOS
        if (installButton) {
            installButton.style.display = 'none';
        }
        
        // Mark that we've shown this prompt
        localStorage.setItem('install-prompt-shown', 'true');
    }
    
    /**
     * Handle app installation
     */
    function _handleAppInstall() {
        // Don't show install prompts after the app is installed
        isAppInstalled = true;
        
        // Hide the install banner if visible
        if (installBanner) {
            installBanner.classList.remove('show');
        }
        
        // Publish install event if EventBus is available
        if (window.EventBus && typeof window.EventBus.publish === 'function') {
            window.EventBus.publish('appInstalled', null);
        }
    }
    
    /**
     * Show app update notification when a new version is available
     */
    function _showUpdateNotification() {
        // Create notification element if it doesn't exist
        let updateNotification = document.getElementById('update-notification');
        
        if (!updateNotification) {
            updateNotification = document.createElement('div');
            updateNotification.id = 'update-notification';
            updateNotification.className = 'update-notification';
            updateNotification.innerHTML = `
                <i class="fas fa-sync-alt"></i>
                <div class="update-notification-text">
                    <h4>Update Available</h4>
                    <p>A new version is ready to install</p>
                </div>
                <button id="update-now-btn" class="update-now-btn">Update Now</button>
            `;
            document.body.appendChild(updateNotification);
            
            // Add click handler to update button
            const updateButton = document.getElementById('update-now-btn');
            if (updateButton) {
                updateButton.addEventListener('click', () => {
                    window.location.reload();
                });
            }
        }
        
        // Show the notification
        setTimeout(() => {
            updateNotification.classList.add('show');
        }, 1000);
    }
    
    /**
     * Sync offline data when back online
     */
    function _syncOfflineData() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.sync.register('sync-words').catch(error => {
                    console.error('Background sync registration failed:', error);
                });
            });
        } else {
            // Fallback for browsers that don't support Background Sync
            _manualSyncOfflineData();
        }
    }
    
    /**
     * Manual sync for browsers without Background Sync support
     */
    async function _manualSyncOfflineData() {
        try {
            // This is a simplified version that would need to be expanded
            // based on your app's specific offline data needs
            
            // Check if we have an offline words queue
            const dbName = 'word_scramble_offline_queue';
            const request = indexedDB.open(dbName, 1);
            
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('words')) {
                    db.createObjectStore('words', {keyPath: 'id', autoIncrement: true});
                }
            };
            
            request.onsuccess = function(event) {
                const db = event.target.result;
                const transaction = db.transaction(['words'], 'readwrite');
                const store = transaction.objectStore('words');
                
                const getAllRequest = store.getAll();
                
                getAllRequest.onsuccess = function() {
                    const offlineWords = getAllRequest.result;
                    
                    if (offlineWords.length > 0) {
                        console.log('Syncing offline words:', offlineWords);
                        
                        // If you had a server backend, you would send these words there
                        // For now, we'll just integrate them into the local database
                        
                        offlineWords.forEach(item => {
                            // Add word to database if WordManager is available
                            if (window.WordManager && typeof window.WordManager.addWord === 'function') {
                                window.WordManager.addWord(item.word, item.imageUrl);
                            }
                            
                            // Remove from offline queue
                            store.delete(item.id);
                        });
                    }
                };
            };
        } catch (error) {
            console.error('Error manually syncing offline data:', error);
        }
    }
    
    /**
     * Save data for offline use
     * @param {string} word - Word to save
     * @param {string} imageUrl - Associated image URL
     * @returns {Promise<boolean>} Success status
     */
    async function _saveWordForOffline(word, imageUrl) {
        try {
            // If online, just return true (data will be saved normally)
            if (navigator.onLine) {
                return true;
            }
            
            // Store in offline queue
            const dbName = 'word_scramble_offline_queue';
            const request = indexedDB.open(dbName, 1);
            
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('words')) {
                    db.createObjectStore('words', {keyPath: 'id', autoIncrement: true});
                }
            };
            
            return new Promise((resolve, reject) => {
                request.onsuccess = function(event) {
                    const db = event.target.result;
                    const transaction = db.transaction(['words'], 'readwrite');
                    const store = transaction.objectStore('words');
                    
                    const addRequest = store.add({
                        word: word,
                        imageUrl: imageUrl,
                        timestamp: new Date().toISOString()
                    });
                    
                    addRequest.onsuccess = function() {
                        resolve(true);
                    };
                    
                    addRequest.onerror = function(error) {
                        console.error('Error adding to offline queue:', error);
                        reject(error);
                    };
                };
                
                request.onerror = function(error) {
                    console.error('Error opening offline queue database:', error);
                    reject(error);
                };
            });
        } catch (error) {
            console.error('Error saving word for offline use:', error);
            return false;
        }
    }
    
    // Public API
    return {
        /**
         * Initialize PWA handlers
         * @returns {Object} PWAHandler for chaining
         */
        init: function() {
            // Listen for online/offline events
            window.addEventListener('online', _updateOnlineStatus);
            window.addEventListener('offline', _updateOnlineStatus);
            
            // Check initial online status
            _updateOnlineStatus();
            
            // Listen for beforeinstallprompt event
            window.addEventListener('beforeinstallprompt', _handleInstallPrompt);
            
            // Listen for appinstalled event
            window.addEventListener('appinstalled', _handleAppInstall);
            
            // Set up install button click handler
            if (installButton) {
                installButton.addEventListener('click', () => {
                    // Hide the banner
                    if (installBanner) {
                        installBanner.classList.remove('show');
                    }
                    
                    // Show the prompt
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        
                        // Wait for user response
                        deferredPrompt.userChoice.then(choiceResult => {
                            if (choiceResult.outcome === 'accepted') {
                                console.log('User accepted the install prompt');
                                _handleAppInstall();
                            } else {
                                console.log('User dismissed the install prompt');
                            }
                            
                            // Clear the saved prompt
                            deferredPrompt = null;
                        });
                    }
                });
            }
            
            // Set up close button for install banner
            if (closeInstallButton) {
                closeInstallButton.addEventListener('click', () => {
                    if (installBanner) {
                        installBanner.classList.remove('show');
                    }
                });
            }
            
            // Set up reload button for offline page
            if (reloadButton) {
                reloadButton.addEventListener('click', () => {
                    window.location.reload();
                });
            }
            
            // Check for iOS-specific install prompt
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            
            if (isIOS && !isStandalone) {
                setTimeout(() => {
                    _showIOSInstallInstructions();
                }, 5000);
            }
            
            // Listen for service worker update found
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    _showUpdateNotification();
                });
            }
            
            // Register with EventBus if available
            if (window.EventBus && typeof window.EventBus.subscribe === 'function') {
                // Subscribe to word added event to save for offline
                window.EventBus.subscribe('wordAdded', data => {
                    if (data && data.word) {
                        _saveWordForOffline(data.word, data.imageUrl);
                    }
                });
            }
            
            console.log('PWA Handlers initialized');
            return this;
        },
        
        /**
         * Check if the app is offline
         * @returns {boolean} Whether the app is offline
         */
        isOffline: function() {
            return isOffline;
        },
        
        /**
         * Check if the app is installed as a PWA
         * @returns {boolean} Whether the app is installed
         */
        isInstalled: function() {
            return isAppInstalled || window.matchMedia('(display-mode: standalone)').matches;
        },
        
        /**
         * Save data for offline use
         * @param {string} word - Word to save
         * @param {string} imageUrl - Associated image URL
         * @returns {Promise<boolean>} Success status
         */
        saveForOffline: function(word, imageUrl) {
            return _saveWordForOffline(word, imageUrl);
        },
        
        /**
         * Manually trigger sync of offline data
         * @returns {Promise<boolean>} Success status
         */
        syncOfflineData: function() {
            _syncOfflineData();
            return Promise.resolve(true);
        }
    };
})();

// Export the module
window.PWAHandler = PWAHandler;

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    PWAHandler.init();
});
