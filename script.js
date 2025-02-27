// Game state variables
let words = [];
let wordImages = {};
let currentWord = '';
let currentImageUrl = '';
let scrambledWord = '';
let score = 0;
let hintUsed = false;

// Predefined image URLs for common words
const defaultWordImages = {
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

// Global variables for words and images
let tempImageData = null; // Store image data temporarily while adding a word

// DOM elements
let wordImageElement, dropArea, scrambledWordElement, scoreElement, 
    correctSound, wrongSound, dragSound, hintSound, pronunciationAudio, clappingSound, whistleSound,
    celebrationOverlay, checkBtn, nextBtn, hintBtn, saveWordsBtn, pronounceBtn;

// Word manager elements
let newWordInput, addWordBtn, imageUploadArea, imageUpload, imagePreview, wordItems;

// Initialize the game
function initGame() {
    // Get DOM elements
    wordImageElement = document.getElementById('word-image');
    dropArea = document.getElementById('drop-area');
    scrambledWordElement = document.getElementById('scrambled-word');
    scoreElement = document.getElementById('score');
    
    // Get sound elements
    correctSound = document.getElementById('correct-sound');
    wrongSound = document.getElementById('wrong-sound');
    dragSound = document.getElementById('drag-sound');
    hintSound = document.getElementById('hint-sound');
    pronunciationAudio = document.getElementById('pronunciation');
    clappingSound = document.getElementById('clapping-sound');
    whistleSound = document.getElementById('whistle-sound');
    
    // Preload and check sounds
    if (clappingSound) {
        clappingSound.load();
        console.log("Clapping sound loaded:", clappingSound);
    } else {
        console.error("Clapping sound element not found!");
    }
    
    if (whistleSound) {
        whistleSound.load();
        console.log("Whistle sound loaded:", whistleSound);
    } else {
        console.error("Whistle sound element not found!");
    }
    
    celebrationOverlay = document.getElementById('celebration-overlay');
    
    // Get buttons and word manager elements
    checkBtn = document.getElementById('check-btn');
    nextBtn = document.getElementById('next-btn');
    hintBtn = document.getElementById('hint-btn');
    saveWordsBtn = document.getElementById('save-words-btn');
    pronounceBtn = document.getElementById('pronounce-btn');
    
    // Word manager elements
    newWordInput = document.getElementById('new-word-input');
    addWordBtn = document.getElementById('add-word-btn');
    imageUploadArea = document.getElementById('image-upload-area');
    imageUpload = document.getElementById('image-upload');
    imagePreview = document.getElementById('image-preview');
    wordItems = document.getElementById('word-items');
    
    // Setup image upload functionality
    setupImageUpload(imageUploadArea, imageUpload, imagePreview);
    
    // Add event listener for the add word button
    addWordBtn.addEventListener('click', () => {
        addWordToList(newWordInput, imagePreview, wordItems);
    });
    
    // Add enter key support for adding words
    newWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addWordToList(newWordInput, imagePreview, wordItems);
        }
    });
    
    // Set up event listeners
    checkBtn.addEventListener('click', checkAnswer);
    nextBtn.addEventListener('click', loadNextWord);
    hintBtn.addEventListener('click', showHint);
    saveWordsBtn.addEventListener('click', saveWordList);
    pronounceBtn.addEventListener('click', pronounceWord);
    
    // Set up drag and drop for the drop area
    dropArea.addEventListener('dragover', dragOver);
    dropArea.addEventListener('dragenter', dragEnter);
    dropArea.addEventListener('dragleave', dragLeave);
    dropArea.addEventListener('drop', dropAreaDrop);
    
    // Set up scrambled word area to accept drops too
    scrambledWordElement.addEventListener('dragover', dragOver);
    scrambledWordElement.addEventListener('dragenter', dragEnter);
    scrambledWordElement.addEventListener('dragleave', dragLeave);
    scrambledWordElement.addEventListener('drop', dropOnScrambledArea);
    
    // Add letterbox styles
    addLetterBoxStyles();
    
    // Load saved word data from localStorage
    loadWordData();
    
    // Populate the word list UI
    populateWordList(wordItems);
    
    // Start the game with the first word
    loadNextWord();
}

// Set up image upload with drag and drop
function setupImageUpload(uploadArea, fileInput, previewElement) {
    // Click the hidden file input when the upload area is clicked
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', () => {
        handleImageFile(fileInput.files[0], previewElement);
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length) {
            handleImageFile(e.dataTransfer.files[0], previewElement);
        }
    });
}

// Handle the selected image file
function handleImageFile(file, previewElement) {
    if (!file || !file.type.match('image.*')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        // Store the image data temporarily
        tempImageData = e.target.result;
        
        // Show the preview
        previewElement.style.display = 'block';
        previewElement.innerHTML = `<img src="${tempImageData}" alt="Preview">`;
        
        // Hide the upload area once we have an image
        const uploadArea = document.getElementById('image-upload-area');
        uploadArea.style.display = 'none';
    };
    
    reader.readAsDataURL(file);
}

// Add a word to the list
function addWordToList(wordInput, imagePreview, wordItemsContainer) {
    const word = wordInput.value.trim();
    
    if (!word) {
        alert('Please enter a word');
        return;
    }
    
    // Check if word already exists
    if (words.includes(word.toLowerCase())) {
        alert('This word already exists in your list');
        return;
    }
    
    // Add to our global words array
    words.push(word.toLowerCase());
    
    // If an image was uploaded, store it
    if (tempImageData) {
        defaultWordImages[word.toLowerCase()] = tempImageData;
    }
    
    // Create a word item element
    const wordItem = document.createElement('div');
    wordItem.className = 'word-item';
    wordItem.dataset.word = word.toLowerCase();
    
    // Word image thumbnail (if available)
    const hasImage = tempImageData !== null;
    const imageHtml = hasImage ? 
        `<div class="word-image"><img src="${tempImageData}" alt="${word}"></div>` : 
        '';
    
    // Add the content
    wordItem.innerHTML = `
        ${imageHtml}
        <div class="word-text">${word}</div>
        <div class="word-actions">
            <button class="delete-word" title="Delete word">✖</button>
        </div>
    `;
    
    // Add delete functionality
    wordItem.querySelector('.delete-word').addEventListener('click', () => {
        removeWord(wordItem, word.toLowerCase());
    });
    
    // Add to the container
    wordItemsContainer.appendChild(wordItem);
    
    // Reset the form
    wordInput.value = '';
    imagePreview.style.display = 'none';
    imagePreview.innerHTML = '';
    tempImageData = null;
    
    // Show the upload area again
    const uploadArea = document.getElementById('image-upload-area');
    uploadArea.style.display = 'flex';
    
    // Save the updated word data
    saveWordData();
}

// Remove a word from the list
function removeWord(wordItem, word) {
    // Remove from the DOM
    wordItem.remove();
    
    // Remove from the arrays
    const index = words.indexOf(word);
    if (index !== -1) {
        words.splice(index, 1);
    }
    
    // Remove any image data
    if (defaultWordImages[word]) {
        delete defaultWordImages[word];
    }
    
    // Save the updated word data
    saveWordData();
}

// Save word data to localStorage
function saveWordData() {
    // Save words and images
    localStorage.setItem('gameWords', JSON.stringify(words));
    localStorage.setItem('gameWordImages', JSON.stringify(defaultWordImages));
}

// Load word data from localStorage
function loadWordData() {
    const savedWords = localStorage.getItem('gameWords');
    const savedImages = localStorage.getItem('gameWordImages');
    
    if (savedWords) {
        words = JSON.parse(savedWords);
    } else {
        // Default words if none are saved
        words = [
            'apple', 'banana', 'cat', 'dog', 'elephant', 
            'flower', 'garden', 'house', 'ice cream', 'jungle',
            'kite', 'lion', 'monkey', 'nest', 'orange', 'penguin'
        ];
    }
    
    if (savedImages) {
        defaultWordImages = JSON.parse(savedImages);
    }
}

// Populate the word list UI
function populateWordList(wordItemsContainer) {
    // Clear the container first
    wordItemsContainer.innerHTML = '';
    
    // Add each word as an item
    words.forEach(word => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.dataset.word = word;
        
        // Check if the word has an associated image
        const hasImage = defaultWordImages[word] !== undefined;
        const imageHtml = hasImage ? 
            `<div class="word-image"><img src="${defaultWordImages[word]}" alt="${word}"></div>` : 
            '';
        
        // Add the content
        wordItem.innerHTML = `
            ${imageHtml}
            <div class="word-text">${word}</div>
            <div class="word-actions">
                <button class="delete-word" title="Delete word">✖</button>
            </div>
        `;
        
        // Add delete functionality
        wordItem.querySelector('.delete-word').addEventListener('click', () => {
            removeWord(wordItem, word);
        });
        
        // Add to the container
        wordItemsContainer.appendChild(wordItem);
    });
}

// Save word list (when the Save Changes button is clicked)
function saveWordList() {
    saveWordData();
    
    // Reload the game with the updated words
    loadNextWord();
    
    // Give feedback
    alert('Your word list has been saved!');
}

// Process the word list
function processWordList() {
    const wordListText = wordListInput.value.trim();
    if (wordListText) {
        // Split by new line and filter out empty strings
        const wordList = wordListText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        words = [];
        
        // Process each line - allow for "word:imageURL" format
        wordList.forEach(line => {
            // Check if line contains image URL (word:imageURL format)
            if (line.includes(':')) {
                const [word, imageURL] = line.split(':').map(part => part.trim());
                if (word && imageURL) {
                    words.push(word);
                    // Add to custom image dictionary
                    defaultWordImages[word.toLowerCase()] = imageURL;
                } else if (word) {
                    words.push(word);
                }
            } else {
                words.push(line);
            }
        });
        
        // Update the UI to show the format instructions
        const instruction = document.querySelector('.word-list-container .instruction');
        if (instruction) {
            instruction.innerHTML = 'Add your custom words below (one word per line):<br>For custom images, use format: <strong>word:imageURL</strong>';
        }
    } else {
        // Default word list if empty
        words = [
            'apple', 'banana', 'cat', 'dog', 'elephant', 
            'flower', 'garden', 'house', 'ice cream', 'jungle',
            'kite', 'lion', 'monkey', 'nest', 'orange', 'penguin'
        ];
    }
}

// Load next word
function loadNextWord() {
    // Reset hintUsed flag
    hintUsed = false;
    
    // If there are no words left, reset the word list
    if (words.length === 0) {
        processWordList();
    }
    
    // Get a random word from the list
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];
    
    // Remove the selected word from the list to avoid repetition
    words.splice(randomIndex, 1);
    
    // Get image URL for the word
    if (defaultWordImages[currentWord.toLowerCase()]) {
        currentImageUrl = defaultWordImages[currentWord.toLowerCase()];
    } else {
        // Use a generated URL for Unsplash search if no default image exists
        currentImageUrl = `https://source.unsplash.com/300x200/?${encodeURIComponent(currentWord)}`;
    }
    
    // Scramble the word
    scrambledWord = scrambleWord(currentWord);
    
    // Reset the drop area and clear any previous letters
    dropArea.innerHTML = '';
    
    // Create placeholder boxes for each letter of the word
    for (let i = 0; i < currentWord.length; i++) {
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box';
        letterBox.setAttribute('data-position', i);
        dropArea.appendChild(letterBox);
    }
    
    // Setup pronunciation
    setPronunciation(currentWord);
    
    // Display the scrambled word
    displayScrambledWord();
    
    // Display the image for the word
    displayWordImage();
    
    // Add drop event listeners to letter boxes
    setupDropListeners();
}

// Set up drag and drop listeners for letter boxes
function setupDropListeners() {
    // Add event listeners to all letter boxes
    const letterBoxes = dropArea.querySelectorAll('.letter-box');
    letterBoxes.forEach(box => {
        box.addEventListener('dragover', e => {
            e.preventDefault();
            box.classList.add('drag-hover');
        });
        
        box.addEventListener('dragleave', () => {
            box.classList.remove('drag-hover');
        });
        
        box.addEventListener('drop', e => {
            e.preventDefault();
            box.classList.remove('drag-hover');
            
            // Only accept drop if the box is empty
            if (!box.hasChildNodes()) {
                const letter = e.dataTransfer.getData('text');
                const tileId = e.dataTransfer.getData('id');
                const sourceContainer = e.dataTransfer.getData('source-container');
                const draggedTile = document.getElementById(tileId);
                
                if (draggedTile) {
                    // Create a clone of the dragged tile
                    const newTile = draggedTile.cloneNode(true);
                    newTile.id = 'drop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
                    
                    // Make the new tile draggable with proper event listeners
                    newTile.setAttribute('draggable', 'true');
                    newTile.addEventListener('dragstart', dragStart);
                    newTile.addEventListener('dragend', dragEnd);
                    
                    // Add tile to the letter box
                    box.appendChild(newTile);
                    
                    // Remove the original tile from its container
                    draggedTile.remove();
                    
                    // Play sound
                    dragSound.play();
                    
                    // Auto-check answer if all letters are placed
                    const emptyBoxes = Array.from(dropArea.querySelectorAll('.letter-box')).filter(box => !box.hasChildNodes());
                    if (emptyBoxes.length === 0) {
                        // Slight delay to allow the UI to update
                        setTimeout(checkAnswer, 100);
                    }
                }
            }
        });
    });
    
    // Keep the main drop area listener for backwards compatibility
    dropArea.addEventListener('dragover', dragOver);
    dropArea.addEventListener('dragenter', dragEnter);
    dropArea.addEventListener('dragleave', dragLeave);
    dropArea.addEventListener('drop', dropAreaDrop);
}

// Main drop area drop handler
function dropAreaDrop(e) {
    e.preventDefault();
    
    // Find all empty letter boxes
    const emptyBoxes = Array.from(dropArea.querySelectorAll('.letter-box')).filter(box => !box.hasChildNodes());
    
    if (emptyBoxes.length > 0) {
        // Target the first empty box
        const firstEmptyBox = emptyBoxes[0];
        
        const letter = e.dataTransfer.getData('text');
        const tileId = e.dataTransfer.getData('id');
        const sourceContainer = e.dataTransfer.getData('source-container');
        const draggedTile = document.getElementById(tileId);
        
        if (draggedTile) {
            // Create a clone of the dragged tile
            const newTile = draggedTile.cloneNode(true);
            newTile.id = 'drop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
            
            // Make the new tile draggable with proper event listeners
            newTile.setAttribute('draggable', 'true');
            newTile.addEventListener('dragstart', dragStart);
            newTile.addEventListener('dragend', dragEnd);
            
            // Add tile to the first empty letter box
            firstEmptyBox.appendChild(newTile);
            
            // Remove the original tile from its container
            draggedTile.remove();
            
            // Play sound
            dragSound.play();
            
            // Auto-check answer if all letters are placed
            const emptyBoxes = Array.from(dropArea.querySelectorAll('.letter-box')).filter(box => !box.hasChildNodes());
            if (emptyBoxes.length === 0) {
                // Slight delay to allow the UI to update
                setTimeout(checkAnswer, 100);
            }
        }
    }
}

// Set up the pronunciation for a word
function setPronunciation(word) {
    // Use the Google Text-to-Speech API
    const wordForUrl = encodeURIComponent(word);
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${wordForUrl}&tl=en&client=tw-ob`;
    pronunciationAudio.src = ttsUrl;
}

// Pronounce the current word
function pronounceWord() {
    if (currentWord) {
        try {
            pronunciationAudio.play();
        } catch (error) {
            console.error('Error playing pronunciation:', error);
        }
    }
}

// Scramble a word
function scrambleWord(word) {
    // Convert word to array, shuffle, and join back
    const wordArray = word.split('');
    
    // Fisher-Yates shuffle
    for (let i = wordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    
    // Make sure the scrambled word is different
    let scrambled = wordArray.join('');
    if (scrambled === word && word.length > 1) {
        return scrambleWord(word); // Try again if it's the same as original
    }
    
    return scrambled;
}

// Display the scrambled word
function displayScrambledWord() {
    // Clear the scrambled word area
    scrambledWordElement.innerHTML = '';
    
    // Create letter tiles
    for (const letter of scrambledWord) {
        const letterTile = createLetterTile(letter);
        scrambledWordElement.appendChild(letterTile);
    }
}

// Create a draggable letter tile
function createLetterTile(letter) {
    const tile = document.createElement('div');
    tile.className = 'letter-tile';
    tile.textContent = letter;
    tile.draggable = true;
    tile.id = 'tile-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    
    // Add drag event listeners
    tile.addEventListener('dragstart', dragStart);
    tile.addEventListener('dragend', dragEnd);
    
    return tile;
}

// Display the image for the current word
function displayWordImage() {
    if (currentImageUrl) {
        wordImageElement.innerHTML = `<img src="${currentImageUrl}" alt="${currentWord}" />`;
    } else {
        // If no image is available, just show the word
        wordImageElement.innerHTML = `<p>${currentWord}</p>`;
    }
}

// Check if the answer is correct
function checkAnswer() {
    // Get the letters from the drop area
    const letterBoxes = dropArea.querySelectorAll('.letter-box');
    const userAnswer = Array.from(letterBoxes)
        .map(box => box.querySelector('.letter-tile')?.textContent || '')
        .join('');
    
    // Check if the answer is correct and all boxes are filled
    if (userAnswer.toLowerCase() === currentWord.toLowerCase() && 
        userAnswer.length === currentWord.length) {
        // Play correct sound
        correctSound.play();
        
        // Get celebratory elements
        const congratsHeading = celebrationOverlay.querySelector('.congrats-message h2');
        const congratsMessage = celebrationOverlay.querySelector('.congrats-message p');
        
        // Array of fun celebration messages for kids
        const celebrationHeadings = [
            "Great Job!", 
            "Awesome!", 
            "Wow!", 
            "Amazing!", 
            "You Did It!", 
            "Super Star!",
            "Fantastic!",
            "Brilliant!",
            "Hooray!"
        ];
        
        // Array of fun messages
        const celebrationMessages = [
            `You solved the word "${currentWord}"!`,
            `"${currentWord}" is correct! You're so smart!`,
            `Yay! "${currentWord}" is right!`,
            `You found the word "${currentWord}"! Keep going!`,
            `Excellent! "${currentWord}" is perfect!`
        ];
        
        // Choose random messages for variety
        const randomHeading = celebrationHeadings[Math.floor(Math.random() * celebrationHeadings.length)];
        const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
        
        // Update the messages
        congratsHeading.textContent = randomHeading;
        congratsMessage.textContent = randomMessage;
        
        // Show celebration overlay
        celebrationOverlay.classList.add('active');
        
        // Play whistle sound immediately
        try {
            whistleSound.currentTime = 0;
            whistleSound.play().catch(e => console.error("Error playing whistle sound:", e));
        } catch (error) {
            console.error("Error with whistle sound:", error);
        }
        
        // Then clapping after a short delay
        setTimeout(() => {
            try {
                clappingSound.currentTime = 0;
                clappingSound.play().catch(e => console.error("Error playing clapping sound:", e));
            } catch (error) {
                console.error("Error with clapping sound:", error);
            }
        }, 700);
        
        // Pronounce the word
        setTimeout(() => {
            pronounceWord();
        }, 1500);
        
        // Increase score
        score += hintUsed ? 1 : 2;  // Less points if hint was used
        scoreElement.textContent = score;
        
        // Visual feedback
        dropArea.classList.add('correct-answer');
        
        // Hide celebration after a few seconds and load next word
        setTimeout(() => {
            celebrationOverlay.classList.remove('active');
            dropArea.classList.remove('correct-answer');
            loadNextWord();
        }, 4500);
    } else {
        // Play wrong sound
        wrongSound.play();
        
        // Visual feedback for wrong answer
        dropArea.classList.add('wrong-answer');
        setTimeout(() => {
            dropArea.classList.remove('wrong-answer');
        }, 500);
    }
}

// Show a hint (first letter)
function showHint() {
    if (dropArea.querySelectorAll('.letter-tile').length > 0) {
        // If there are already letters in the drop area, don't show hint
        return;
    }
    
    // Play hint sound
    hintSound.play();
    
    hintUsed = true;
    
    // Find the first letter tile with the correct first letter
    const firstLetter = currentWord.charAt(0);
    const letterTiles = scrambledWordElement.querySelectorAll('.letter-tile');
    
    for (const tile of letterTiles) {
        if (tile.textContent.toLowerCase() === firstLetter.toLowerCase()) {
            // Create a clone of the tile
            const clonedTile = tile.cloneNode(true);
            clonedTile.draggable = true;
            clonedTile.addEventListener('dragstart', dragStart);
            clonedTile.addEventListener('dragend', dragEnd);
            
            // Add to drop area
            if (dropArea.querySelector('p')) {
                dropArea.innerHTML = '';
            }
            dropArea.appendChild(clonedTile);
            
            // Remove the original tile
            tile.remove();
            break;
        }
    }
}

// Drag and drop functions
function dragStart(e) {
    e.dataTransfer.setData('text', e.target.textContent);
    e.dataTransfer.setData('id', e.target.id);
    e.dataTransfer.setData('source-container', e.target.closest('.letter-box') ? 'letter-box' : 'scrambled-word');
    e.target.classList.add('dragging');
    
    // Play drag sound
    dragSound.play();
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    if (e.currentTarget === dropArea) {
        dropArea.classList.add('highlight');
    } else if (e.currentTarget === scrambledWordElement) {
        scrambledWordElement.classList.add('highlight');
    }
}

function dragLeave(e) {
    if (e.currentTarget === dropArea) {
        dropArea.classList.remove('highlight');
    } else if (e.currentTarget === scrambledWordElement) {
        scrambledWordElement.classList.remove('highlight');
    }
}

function dropOnScrambledArea(e) {
    e.preventDefault();
    scrambledWordElement.classList.remove('highlight');
    
    // Get the letter data
    const letter = e.dataTransfer.getData('text');
    const sourceContainer = e.dataTransfer.getData('source-container');
    const tileId = e.dataTransfer.getData('id');
    const draggedTile = document.getElementById(tileId);
    
    // Only process if coming from drop area letter box
    if (sourceContainer === 'letter-box' && draggedTile) {
        // Create a new letter tile
        const newTile = createLetterTile(letter);
        
        // Add to scrambled word area
        scrambledWordElement.appendChild(newTile);
        
        // Remove the original tile from its parent container (letter box)
        draggedTile.remove();
        
        // Play sound
        dragSound.play();
    }
}

// Get the element after which to insert the dragged element (for reordering)
function getDragAfterElement(container, y) {
    // Get all draggable elements that are not being dragged
    const draggableElements = [...container.querySelectorAll('.letter-tile:not(.dragging)')];
    
    // Find the element after which to drop (the one with the smallest offset)
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        // If the offset is negative (mouse above the element) but greater
        // than the current closest, update closest
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Check if the scrambled word area is empty
function checkScrambledWordEmpty() {
    if (scrambledWordElement.children.length === 0) {
        // All letters have been used, enable check button
        checkBtn.disabled = false;
    }
}

// Check if drop area is empty and add placeholder message if needed
function checkDropAreaEmpty() {
    if (dropArea.children.length === 0 || (dropArea.children.length === 1 && dropArea.firstChild.nodeName === 'P')) {
        dropArea.innerHTML = '<p>Drop letters here to form the word</p>';
    }
}

// Add CSS styles for the letter boxes
function addLetterBoxStyles() {
    // Check if the style already exists
    if (!document.getElementById('letter-box-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'letter-box-styles';
        styleElement.textContent = `
            .letter-box {
                width: 50px;
                height: 50px;
                border: 2px dashed #5f27cd;
                border-radius: 10px;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                margin: 5px;
                background-color: rgba(95, 39, 205, 0.1);
            }
            
            .letter-box .letter-tile {
                margin: 0;
                position: relative !important;
                left: 0 !important;
                top: 0 !important;
            }
            
            .letter-box.drag-hover {
                background-color: rgba(95, 39, 205, 0.3);
                border: 2px solid #5f27cd;
                transform: scale(1.05);
                transition: all 0.2s ease;
            }
        `;
        document.head.appendChild(styleElement);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
