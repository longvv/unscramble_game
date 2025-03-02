/**
 * Database Module for Word Scramble Game
 * Handles SQLite database operations for word storage
 */
const DatabaseService = (function() {
    // Private state
    let _db = null;
    let _isInitialized = false;
    
    // Constants
    const DB_NAME = 'word_scramble_db';
    const DB_VERSION = 1;
    
    // Default words and images to populate the database initially
    const DEFAULT_WORDS = [
        'apple', 'banana', 'cat', 'dog', 'elephant', 
        'flower', 'garden', 'house', 'ice cream', 'jungle',
        'kite', 'lion', 'monkey', 'nest', 'orange',
        'penguin', 'queen', 'rabbit', 'sun', 'tree',
        'umbrella', 'violet', 'water', 'xylophone', 'yellow', 'zebra'
    ];
    
    const DEFAULT_WORD_IMAGES = {
        "apple": "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=300",
        "banana": "https://images.unsplash.com/photo-1587132137056-bd0b52f945a0?w=300",
        "cat": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300",
        "dog": "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=300",
        "elephant": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300",
        "flower": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300",
        "garden": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=300",
        "house": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300",
        "ice cream": "https://images.unsplash.com/photo-1576506295286-5cda18df9ef5?w=300",
        "jungle": "https://images.unsplash.com/photo-1536147116438-62679a5e01f2?w=300",
        "kite": "https://images.unsplash.com/photo-1520716963369-9b24de292417?w=300",
        "lion": "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300",
        "monkey": "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=300",
        "nest": "https://images.unsplash.com/photo-1590257003876-56a337eed448?w=300",
        "orange": "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=300",
        "penguin": "https://images.unsplash.com/photo-1517783999520-f068d7431a60?w=300",
        "queen": "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=300",
        "rabbit": "https://images.unsplash.com/photo-1535241749838-299277b6305f?w=300",
        "sun": "https://images.unsplash.com/photo-1548266652-99cf27701ced?w=300",
        "tree": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300",
        "umbrella": "https://images.unsplash.com/photo-1534309466160-70b22cc6252c?w=300",
        "violet": "https://images.unsplash.com/photo-1557968581-06958f0df4f2?w=300",
        "water": "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?w=300",
        "xylophone": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300",
        "yellow": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300",
        "zebra": "https://images.unsplash.com/photo-1526095179574-86e545346ae6?w=300"
    };
    
    // Private methods
    
    /**
     * Initialize the database
     * @returns {Promise} Promise that resolves when the database is initialized
     */
    async function _initDatabase() {
        return new Promise((resolve, reject) => {
            // Check if IndexedDB is supported
            if (!window.indexedDB) {
                console.error("Your browser doesn't support IndexedDB.");
                reject(new Error("IndexedDB not supported"));
                return;
            }
            
            // Open the database
            const request = window.indexedDB.open(DB_NAME, DB_VERSION);
            
            // Handle database upgrade needed (first time or version change)
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                
                // Create words object store
                if (!db.objectStoreNames.contains('words')) {
                    const wordsStore = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
                    wordsStore.createIndex('word', 'word', { unique: true });
                    wordsStore.createIndex('active', 'active', { unique: false });
                    
                    console.log('Words object store created');
                }
                
                // Create word_images object store
                if (!db.objectStoreNames.contains('word_images')) {
                    const imagesStore = db.createObjectStore('word_images', { keyPath: 'word' });
                    imagesStore.createIndex('word', 'word', { unique: true });
                    
                    console.log('Word images object store created');
                }
                
                // Create game_stats object store
                if (!db.objectStoreNames.contains('game_stats')) {
                    const statsStore = db.createObjectStore('game_stats', { keyPath: 'key' });
                    
                    console.log('Game stats object store created');
                }
            };
            
            // Handle success
            request.onsuccess = function(event) {
                _db = event.target.result;
                console.log('Database opened successfully');
                
                // Initialize with default data if needed
                _populateDefaultDataIfNeeded().then(() => {
                    _isInitialized = true;
                    resolve();
                }).catch(error => {
                    console.error('Error populating default data:', error);
                    reject(error);
                });
            };
            
            // Handle error
            request.onerror = function(event) {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Populate database with default data if it's empty
     * @returns {Promise} Promise that resolves when default data is populated
     */
    async function _populateDefaultDataIfNeeded() {
        try {
            // Check if words table has data
            const wordsCount = await _getWordsCount();
            
            if (wordsCount === 0) {
                console.log('No words in database, populating with default data...');
                
                // Add default words
                for (const word of DEFAULT_WORDS) {
                    await _addWord(word.toLowerCase(), true);
                }
                
                // Add default word images
                for (const [word, imageUrl] of Object.entries(DEFAULT_WORD_IMAGES)) {
                    await _addWordImage(word.toLowerCase(), imageUrl);
                }
                
                console.log('Default data populated successfully');
            } else {
                console.log(`Database already has ${wordsCount} words`);
            }
            
            return true;
        } catch (error) {
            console.error('Error checking/populating default data:', error);
            throw error;
        }
    }
    
    /**
     * Get count of words in the database
     * @returns {Promise<number>} Promise that resolves with the count
     */
    function _getWordsCount() {
        return new Promise((resolve, reject) => {
            if (!_db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            try {
                const transaction = _db.transaction(['words'], 'readonly');
                const store = transaction.objectStore('words');
                const countRequest = store.count();
                
                countRequest.onsuccess = function() {
                    resolve(countRequest.result);
                };
                
                countRequest.onerror = function(event) {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Add a word to the database
     * @param {string} word - The word to add
     * @param {boolean} active - Whether the word is active
     * @returns {Promise} Promise that resolves when the word is added
     */
    function _addWord(word, active = true) {
        return new Promise((resolve, reject) => {
            if (!_db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            try {
                const transaction = _db.transaction(['words'], 'readwrite');
                const store = transaction.objectStore('words');
                
                // Prepare the word object
                const wordObj = {
                    word: word.toLowerCase(),
                    active: active,
                    dateAdded: new Date().toISOString()
                };
                
                // Check if word already exists
                const index = store.index('word');
                const getRequest = index.get(word.toLowerCase());
                
                getRequest.onsuccess = function(event) {
                    if (event.target.result) {
                        // Word already exists, update it
                        const existingWord = event.target.result;
                        existingWord.active = active;
                        store.put(existingWord);
                        resolve(existingWord.id);
                    } else {
                        // Word doesn't exist, add it
                        const addRequest = store.add(wordObj);
                        
                        addRequest.onsuccess = function(event) {
                            resolve(event.target.result);
                        };
                        
                        addRequest.onerror = function(event) {
                            reject(event.target.error);
                        };
                    }
                };
                
                getRequest.onerror = function(event) {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Add a word image to the database
     * @param {string} word - The word
     * @param {string} imageUrl - The image URL
     * @returns {Promise} Promise that resolves when the image is added
     */
    function _addWordImage(word, imageUrl) {
        return new Promise((resolve, reject) => {
            if (!_db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            try {
                const transaction = _db.transaction(['word_images'], 'readwrite');
                const store = transaction.objectStore('word_images');
                
                // Prepare the word image object
                const wordImageObj = {
                    word: word.toLowerCase(),
                    imageUrl: imageUrl,
                    dateAdded: new Date().toISOString()
                };
                
                // Add or update the word image
                const request = store.put(wordImageObj);
                
                request.onsuccess = function() {
                    resolve();
                };
                
                request.onerror = function(event) {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Public API
    return {
        /**
         * Initialize the database
         * @returns {Promise} Promise that resolves when initialization is complete
         */
        init: async function() {
            if (_isInitialized) {
                console.log('Database already initialized');
                return Promise.resolve();
            }
            
            try {
                await _initDatabase();
                console.log('Database initialized successfully');
                return Promise.resolve();
            } catch (error) {
                console.error('Failed to initialize database:', error);
                return Promise.reject(error);
            }
        },
        
        /**
         * Check if the database is initialized
         * @returns {boolean} Whether the database is initialized
         */
        isInitialized: function() {
            return _isInitialized;
        },
        
        /**
         * Get all active words
         * @returns {Promise<Array>} Promise that resolves with an array of words
         */
        getWords: function() {
            return new Promise((resolve, reject) => {
                if (!_db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                try {
                    const transaction = _db.transaction(['words'], 'readonly');
                    const store = transaction.objectStore('words');
                    const index = store.index('active');
                    const request = index.getAll(true);
                    
                    request.onsuccess = function() {
                        // Extract just the word strings
                        const words = request.result.map(wordObj => wordObj.word);
                        resolve(words);
                    };
                    
                    request.onerror = function(event) {
                        reject(event.target.error);
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        /**
         * Get all word images
         * @returns {Promise<Object>} Promise that resolves with word to image mapping
         */
        getWordImages: function() {
            return new Promise((resolve, reject) => {
                if (!_db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                try {
                    const transaction = _db.transaction(['word_images'], 'readonly');
                    const store = transaction.objectStore('word_images');
                    const request = store.getAll();
                    
                    request.onsuccess = function() {
                        // Convert to object mapping
                        const wordImages = {};
                        request.result.forEach(imageObj => {
                            wordImages[imageObj.word] = imageObj.imageUrl;
                        });
                        resolve(wordImages);
                    };
                    
                    request.onerror = function(event) {
                        reject(event.target.error);
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        /**
         * Add a word to the database
         * @param {string} word - The word to add
         * @param {boolean} active - Whether the word is active
         * @returns {Promise} Promise that resolves when the word is added
         */
        addWord: function(word, active = true) {
            return _addWord(word, active);
        },
        
        /**
         * Add a word image to the database
         * @param {string} word - The word
         * @param {string} imageUrl - The image URL
         * @returns {Promise} Promise that resolves when the image is added
         */
        addWordImage: function(word, imageUrl) {
            return _addWordImage(word, imageUrl);
        },
        
        /**
         * Delete a word from the database
         * @param {string} word - The word to delete
         * @returns {Promise} Promise that resolves when the word is deleted
         */
        deleteWord: function(word) {
            return new Promise((resolve, reject) => {
                if (!_db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                try {
                    const transaction = _db.transaction(['words'], 'readwrite');
                    const store = transaction.objectStore('words');
                    const index = store.index('word');
                    const getRequest = index.get(word.toLowerCase());
                    
                    getRequest.onsuccess = function(event) {
                        const result = event.target.result;
                        if (result) {
                            // Word exists, delete it
                            const deleteRequest = store.delete(result.id);
                            
                            deleteRequest.onsuccess = function() {
                                resolve();
                            };
                            
                            deleteRequest.onerror = function(event) {
                                reject(event.target.error);
                            };
                        } else {
                            // Word doesn't exist
                            resolve();
                        }
                    };
                    
                    getRequest.onerror = function(event) {
                        reject(event.target.error);
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        /**
         * Deactivate a word in the database
         * @param {string} word - The word to deactivate
         * @returns {Promise} Promise that resolves when the word is deactivated
         */
        deactivateWord: function(word) {
            return new Promise((resolve, reject) => {
                if (!_db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                try {
                    const transaction = _db.transaction(['words'], 'readwrite');
                    const store = transaction.objectStore('words');
                    const index = store.index('word');
                    const getRequest = index.get(word.toLowerCase());
                    
                    getRequest.onsuccess = function(event) {
                        const result = event.target.result;
                        if (result) {
                            // Word exists, update it
                            result.active = false;
                            const updateRequest = store.put(result);
                            
                            updateRequest.onsuccess = function() {
                                resolve();
                            };
                            
                            updateRequest.onerror = function(event) {
                                reject(event.target.error);
                            };
                        } else {
                            // Word doesn't exist
                            resolve();
                        }
                    };
                    
                    getRequest.onerror = function(event) {
                        reject(event.target.error);
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        /**
         * Delete a word image from the database
         * @param {string} word - The word associated with the image
         * @returns {Promise} Promise that resolves when the image is deleted
         */
        deleteWordImage: function(word) {
            return new Promise((resolve, reject) => {
                if (!_db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                try {
                    const transaction = _db.transaction(['word_images'], 'readwrite');
                    const store = transaction.objectStore('word_images');
                    const request = store.delete(word.toLowerCase());
                    
                    request.onsuccess = function() {
                        resolve();
                    };
                    
                    request.onerror = function(event) {
                        reject(event.target.error);
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        /**
         * Get game score from database
         * @returns {Promise<number>} Promise that resolves with the score
         */
        getScore: function() {
            return new Promise((resolve, reject) => {
                if (!_db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                try {
                    const transaction = _db.transaction(['game_stats'], 'readonly');
                    const store = transaction.objectStore('game_stats');
                    const request = store.get('score');
                    
                    request.onsuccess = function() {
                        if (request.result) {
                            resolve(request.result.value);
                        } else {
                            resolve(0);
                        }
                    };
                    
                    request.onerror = function(event) {
                        reject(event.target.error);
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        /**
         * Save game score to database
         * @param {number} score - The score to save
         * @returns {Promise} Promise that resolves when the score is saved
         */
        saveScore: function(score) {
            return new Promise((resolve, reject) => {
                if (!_db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                try {
                    const transaction = _db.transaction(['game_stats'], 'readwrite');
                    const store = transaction.objectStore('game_stats');
                    
                    const scoreObj = {
                        key: 'score',
                        value: score,
                        lastUpdated: new Date().toISOString()
                    };
                    
                    const request = store.put(scoreObj);
                    
                    request.onsuccess = function() {
                        resolve();
                    };
                    
                    request.onerror = function(event) {
                        reject(event.target.error);
                    };
                } catch (error) {
                    reject(error);
                }
            });
        },
        
        /**
         * Clear all data from the database
         * @returns {Promise} Promise that resolves when all data is cleared
         */
        clearAllData: function() {
            return new Promise((resolve, reject) => {
                if (!_db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                
                try {
                    const stores = ['words', 'word_images', 'game_stats'];
                    let completedStores = 0;
                    
                    for (const storeName of stores) {
                        const transaction = _db.transaction([storeName], 'readwrite');
                        const store = transaction.objectStore(storeName);
                        const request = store.clear();
                        
                        request.onsuccess = function() {
                            completedStores++;
                            if (completedStores === stores.length) {
                                resolve();
                            }
                        };
                        
                        request.onerror = function(event) {
                            reject(event.target.error);
                        };
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }
    };
})();

// Export the module
window.DatabaseService = DatabaseService;
