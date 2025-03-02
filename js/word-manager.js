/**
 * Word Manager Module for Word Scramble Game
 * Handles word list management and image association
 * Modified to use DatabaseService instead of StorageService
 */
const WordManager = (function() {
    // Private state
    let _words = [];
    let _wordImages = {};
    let _tempImageData = null;
    
    // DOM elements
    let _elements = {
        newWordInput: null,
        addWordBtn: null,
        imageUploadArea: null,
        imageUpload: null,
        imagePreview: null,
        wordList: null,
        saveWordsBtn: null
    };
    
    // Private methods
    
    /**
     * Handle image file upload
     * @param {File} file - Image file
     * @param {HTMLElement} previewElement - Element to show preview
     */
    function _handleImageFile(file, previewElement) {
        // Validate file is an image
        if (!file.type.match('image.*')) {
            alert('Please upload an image file.');
            return;
        }
        
        // Read file as data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            _tempImageData = e.target.result;
            window.UIFactory.createImagePreview(_tempImageData, previewElement);
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * Set up image upload with drag and drop
     * @param {HTMLElement} uploadArea - Upload area element
     * @param {HTMLElement} fileInput - File input element
     * @param {HTMLElement} previewElement - Preview element
     */
    function _setupImageUpload(uploadArea, fileInput, previewElement) {
        // Handle click on upload area
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                _handleImageFile(e.target.files[0], previewElement);
            }
        });
        
        // Handle drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                _handleImageFile(e.dataTransfer.files[0], previewElement);
            }
        });
    }
    
    /**
     * Add a word to the list
     */
    async function _addWordToList() {
        const wordInput = _elements.newWordInput;
        const word = wordInput.value.trim().toLowerCase();
        
        // Validate word
        if (!word) {
            alert('Please enter a word.');
            return;
        }
        
        // Check if word already exists in database
        if (_words.includes(word)) {
            alert('This word is already in the list.');
            return;
        }
        
        try {
            // Add word to the database
            await window.DatabaseService.addWord(word, true);
            
            // Associate image with word if uploaded
            if (_tempImageData) {
                await window.DatabaseService.addWordImage(word, _tempImageData);
                _tempImageData = null;
            }
            
            // Refresh our local cache of words
            _words = await window.DatabaseService.getWords();
            _wordImages = await window.DatabaseService.getWordImages();
            
            // Create word item in UI
            const wordItem = window.UIFactory.createWordItem(
                word, 
                _wordImages[word] || null,
                _removeWord
            );
            
            _elements.wordList.appendChild(wordItem);
            
            // Clear input and preview
            wordInput.value = '';
            window.UIFactory.resetImagePreview(_elements.imagePreview);
            
            // Publish event if EventBus is available
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('wordAdded', { word });
            }
        } catch (error) {
            console.error('Error adding word:', error);
            alert('Failed to add word. Please try again.');
        }
    }
    
    /**
     * Remove a word from the list
     * @param {HTMLElement} wordItem - Word item element
     * @param {string} word - Word to remove
     */
    async function _removeWord(wordItem, word) {
        try {
            // Remove word from database
            await window.DatabaseService.deleteWord(word);
            
            // Remove word image from database
            await window.DatabaseService.deleteWordImage(word);
            
            // Remove from UI
            wordItem.remove();
            
            // Update local cache
            const index = _words.indexOf(word);
            if (index !== -1) {
                _words.splice(index, 1);
            }
            
            if (_wordImages[word]) {
                delete _wordImages[word];
            }
            
            // Publish event if EventBus is available
            if (window.EventBus && typeof window.EventBus.publish === 'function') {
                window.EventBus.publish('wordRemoved', { word });
            }
        } catch (error) {
            console.error('Error removing word:', error);
            alert('Failed to remove word. Please try again.');
        }
    }
    
    /**
     * Load word data from database
     */
    async function _loadWordData() {
        try {
            // Check if database is initialized
            if (!window.DatabaseService || !window.DatabaseService.isInitialized()) {
                console.error('Database service not initialized');
                return false;
            }
            
            // Load words from database
            _words = await window.DatabaseService.getWords();
            
            // Load word images from database
            _wordImages = await window.DatabaseService.getWordImages();
            
            return true;
        } catch (error) {
            console.error('Error loading word data from database:', error);
            
            // Fall back to localStorage if database fails
            if (window.StorageService) {
                console.log('Falling back to localStorage for word data');
                _words = window.StorageService.getWords();
                _wordImages = window.StorageService.getWordImages();
                return true;
            }
            
            return false;
        }
    }
    
    /**
     * Populate the word list UI
     */
    function _populateWordList() {
        // Clear existing items
        _elements.wordList.innerHTML = '';
        
        // Add each word to the UI
        _words.forEach(word => {
            const imageUrl = _wordImages[word] || null;
            const wordItem = window.UIFactory.createWordItem(word, imageUrl, _removeWord);
            _elements.wordList.appendChild(wordItem);
        });
    }
    
    // Public API
    return {
        /**
         * Initialize word manager
         * @param {Object} elements - DOM elements
         * @returns {Object} WordManager for chaining
         */
        init: async function(elements) {
            // Store DOM elements
            _elements = elements;
            
            // Setup image upload
            if (_elements.imageUploadArea && _elements.imageUpload && _elements.imagePreview) {
                _setupImageUpload(_elements.imageUploadArea, _elements.imageUpload, _elements.imagePreview);
            } else {
                console.error('Missing required elements for image upload');
            }
            
            // Setup add word button
            if (_elements.addWordBtn && _elements.newWordInput) {
                _elements.addWordBtn.addEventListener('click', _addWordToList);
                
                // Add on enter key in input
                _elements.newWordInput.addEventListener('keyup', function(event) {
                    if (event.key === 'Enter') {
                        _addWordToList();
                    }
                });
            }
            
            // Load saved words from database
            try {
                await _loadWordData();
                
                // Populate word list
                if (_elements.wordList) {
                    _populateWordList();
                } else {
                    console.error('Missing word list element');
                }
                
                // Publish event if EventBus is available
                if (window.EventBus && typeof window.EventBus.publish === 'function') {
                    window.EventBus.publish('wordManagerInitialized', { wordCount: _words.length });
                }
            } catch (error) {
                console.error('Error initializing WordManager:', error);
            }
            
            return this;
        },
        
        /**
         * Get all words
         * @returns {Array} Array of words
         */
        getWords: function() {
            return [..._words]; // Return a copy
        },
        
        /**
         * Get image URL for a word
         * @param {string} word - Word to get image for
         * @returns {string|null} Image URL or null
         */
        getWordImage: function(word) {
            return _wordImages[word] || null;
        },
        
        /**
         * Add a new word programmatically
         * @param {string} word - Word to add
         * @param {string} imageUrl - Image URL (optional)
         * @returns {Promise<boolean>} Success status
         */
        addWord: async function(word, imageUrl) {
            word = word.trim().toLowerCase();
            
            // Validate
            if (!word || _words.includes(word)) {
                return false;
            }
            
            try {
                // Add word to database
                await window.DatabaseService.addWord(word, true);
                
                // Associate image if provided
                if (imageUrl) {
                    await window.DatabaseService.addWordImage(word, imageUrl);
                }
                
                // Update local cache
                _words = await window.DatabaseService.getWords();
                _wordImages = await window.DatabaseService.getWordImages();
                
                // Update UI if word list element exists
                if (_elements.wordList) {
                    const wordItem = window.UIFactory.createWordItem(word, imageUrl, _removeWord);
                    _elements.wordList.appendChild(wordItem);
                }
                
                // Publish event if EventBus is available
                if (window.EventBus && typeof window.EventBus.publish === 'function') {
                    window.EventBus.publish('wordAdded', { word });
                }
                
                return true;
            } catch (error) {
                console.error('Error adding word programmatically:', error);
                return false;
            }
        },
        
        /**
         * Remove a word programmatically
         * @param {string} word - Word to remove
         * @returns {Promise<boolean>} Success status
         */
        removeWord: async function(word) {
            try {
                // Remove word from database
                await window.DatabaseService.deleteWord(word);
                
                // Remove word image from database
                await window.DatabaseService.deleteWordImage(word);
                
                // Update UI if word list element exists
                if (_elements.wordList) {
                    const wordItem = _elements.wordList.querySelector(`[data-word="${word}"]`);
                    if (wordItem) {
                        wordItem.remove();
                    }
                }
                
                // Update local cache
                const index = _words.indexOf(word);
                if (index !== -1) {
                    _words.splice(index, 1);
                }
                
                if (_wordImages[word]) {
                    delete _wordImages[word];
                }
                
                // Publish event if EventBus is available
                if (window.EventBus && typeof window.EventBus.publish === 'function') {
                    window.EventBus.publish('wordRemoved', { word });
                }
                
                return true;
            } catch (error) {
                console.error('Error removing word programmatically:', error);
                return false;
            }
        },
        
        /**
         * Refresh word data from database
         * @returns {Promise<boolean>} Success status
         */
        refreshData: async function() {
            try {
                await _loadWordData();
                if (_elements.wordList) {
                    _populateWordList();
                }
                return true;
            } catch (error) {
                console.error('Error refreshing word data:', error);
                return false;
            }
        }
    };
})();

// Export the module
window.WordManager = WordManager;