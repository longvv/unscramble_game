/**
 * Word Manager Module for Word Scramble Game
 * Handles word list management and image association
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
    function _addWordToList() {
        const wordInput = _elements.newWordInput;
        const word = wordInput.value.trim().toLowerCase();
        
        // Validate word
        if (!word) {
            alert('Please enter a word.');
            return;
        }
        
        // Check if word already exists
        if (_words.includes(word)) {
            alert('This word is already in the list.');
            return;
        }
        
        // Add word to the list
        _words.push(word);
        
        // Associate image with word if uploaded
        if (_tempImageData) {
            _wordImages[word] = _tempImageData;
            _tempImageData = null;
        }
        
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
        
        // Save word data
        _saveWordData();
    }
    
    /**
     * Remove a word from the list
     * @param {HTMLElement} wordItem - Word item element
     * @param {string} word - Word to remove
     */
    function _removeWord(wordItem, word) {
        // Remove from arrays
        const index = _words.indexOf(word);
        if (index !== -1) {
            _words.splice(index, 1);
        }
        
        // Remove image association
        if (_wordImages[word]) {
            delete _wordImages[word];
        }
        
        // Remove from UI
        wordItem.remove();
        
        // Save word data
        _saveWordData();
    }
    
    /**
     * Save word data to localStorage
     */
    function _saveWordData() {
        StorageService.saveWords(_words);
        StorageService.saveWordImages(_wordImages);
    }
    
    /**
     * Load word data from localStorage
     */
    function _loadWordData() {
        _words = StorageService.getWords();
        _wordImages = StorageService.getWordImages();
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
        init: function(elements) {
            // Store DOM elements
            _elements = elements;
            
            // Load saved words
            _loadWordData();
            
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
            
            // Populate word list
            if (_elements.wordList) {
                _populateWordList();
            } else {
                console.error('Missing word list element');
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
         * @returns {boolean} Success status
         */
        addWord: function(word, imageUrl) {
            word = word.trim().toLowerCase();
            
            // Validate
            if (!word || _words.includes(word)) {
                return false;
            }
            
            // Add word
            _words.push(word);
            
            // Associate image if provided
            if (imageUrl) {
                _wordImages[word] = imageUrl;
            }
            
            // Update UI
            const wordItem = window.UIFactory.createWordItem(word, imageUrl, _removeWord);
            _elements.wordList.appendChild(wordItem);
            
            // Save data
            _saveWordData();
            
            return true;
        },
        
        /**
         * Remove a word programmatically
         * @param {string} word - Word to remove
         * @returns {boolean} Success status
         */
        removeWord: function(word) {
            const index = _words.indexOf(word);
            if (index === -1) {
                return false;
            }
            
            // Remove from arrays
            _words.splice(index, 1);
            
            // Remove image association
            if (_wordImages[word]) {
                delete _wordImages[word];
            }
            
            // Update UI
            const wordItem = _elements.wordList.querySelector(`[data-word="${word}"]`);
            if (wordItem) {
                wordItem.remove();
            }
            
            // Save data
            _saveWordData();
            
            return true;
        }
    };
})();

// Export the module
window.WordManager = WordManager;
