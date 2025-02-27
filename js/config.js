/**
 * Configuration Module for Word Scramble Game
 * This module contains game settings and default values
 */
const GameConfig = (function() {
    // Private configuration settings
    const _config = {
        // Game settings
        scoreIncrement: {
            withoutHint: 10,
            withHint: 5
        },
        
        // Timing settings
        celebrationDuration: 3000, // 3 seconds
        
        // Sound URLs
        sounds: {
            correct: "https://assets.mixkit.co/sfx/preview/mixkit-fairy-arcade-sparkle-866.mp3",
            wrong: "https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3",
            drag: "https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3",
            hint: "https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3",
            clapping: "https://assets.mixkit.co/sfx/preview/mixkit-small-crowd-ovation-437.mp3",
            whistle: "https://assets.mixkit.co/sfx/preview/mixkit-referee-whistle-blow-2317.mp3"
        },
        
        // API endpoints
        apis: {
            textToSpeech: "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q="
        },
        
        // Default words
        defaultWords: [
            'apple', 'banana', 'cat', 'dog', 'elephant', 
            'flower', 'garden', 'house', 'ice cream', 'jungle',
            'kite', 'lion', 'monkey', 'nest', 'orange',
            'penguin', 'queen', 'rabbit', 'sun', 'tree',
            'umbrella', 'violet', 'water', 'xylophone', 'yellow', 'zebra'
        ],
        
        // Default word images
        defaultWordImages: {
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
        },
        
        // Local storage keys
        storage: {
            words: 'gameWords',
            wordImages: 'gameWordImages',
            score: 'gameScore'
        },
        
        // Congratulatory messages for celebrations
        congratsMessages: {
            headings: [
                'Great Job!', 'Well Done!', 'Excellent!', 'Fantastic!', 
                'Amazing!', 'Brilliant!', 'Super!', 'Wonderful!'
            ],
            messages: [
                'You solved the word!', 'Keep up the good work!', 
                'You\'re doing great!', 'You\'re so smart!',
                'Way to go!', 'That\'s correct!', 'Perfect!',
                'You\'re a word wizard!'
            ]
        }
    };
    
    // Public API
    return {
        get: function(key) {
            return _config[key];
        }
    };
})();

// Export the module
window.GameConfig = GameConfig;
