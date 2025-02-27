# English Vocabulary Word Scramble Game

A fun and interactive word scramble game designed to help children learn English vocabulary through play. Features images and sound to create a multi-sensory learning experience.

## Features

- **Word Scrambling**: Words are randomly scrambled and displayed for solving
- **Drag and Drop**: Interactive drag and drop interface perfect for kids
- **Visual Learning**: Shows an image representing each word after solving
- **Audio Support**: Includes pronunciation and sound effects
- **Customizable Word List**: Easily add your own words with images to match your child's learning level
- **Score Tracking**: Keeps track of points earned
- **Hint System**: Provides hints when needed (at the cost of points)
- **Local Storage**: Saves your custom word list between sessions

## How to Play

1. The game displays a scrambled word from your word list
2. Drag the letters and drop them into the answer area to form the correct word
3. Click "Check Word" to see if your answer is correct
4. If correct, you earn points (2 points normally, 1 point if hint was used)
5. When correct, an image of the word appears and the pronunciation plays
6. Click "Next Word" to get a new scramble
7. Click "Hint" if you need help (reveals the first letter)
8. Click the sound icon anytime to hear the word pronounced

## Multi-Sensory Learning

The game helps children learn through multiple senses:
- **Visual**: Colorful letter tiles and images of vocabulary words
- **Auditory**: Word pronunciation and fun sound effects
- **Kinesthetic**: Drag and drop interaction engages motor skills

## Customizing the Word List

1. Scroll down to the "Word List" section
2. Edit the list by adding or removing words (format: word|imageURL)
3. To add a custom image for a word, use the format: `word:https://path-to-your-image.jpg`
   Example: `dog:https://example.com/images/dog.jpg`
4. Click "Save Words" to update your list
5. Your word list will be saved for future sessions

## Running the Game

Simply open the `index.html` file in any modern web browser.

## Educational Benefits

- Improves vocabulary recognition
- Enhances spelling skills
- Develops problem-solving abilities
- Builds word familiarity through multiple sensory inputs
- Promotes reading confidence
- Creates associations between words, images, and sounds

Enjoy learning through play!

## 📦 Project Structure

```
word-scramble-game/
├── docs-site/           # Docusaurus documentation
│   ├── docs/            # Markdown documentation files
│   ├── src/             # React components and custom pages
│   ├── static/          # Static assets
│   └── docusaurus.config.js
│
├── js/                  # Game JavaScript modules
│   ├── config.js        # Game configuration
│   ├── storage.js       # Data persistence
│   ├── audio.js         # Sound management
│   ├── ui-factory.js    # UI component creation
│   ├── word-manager.js  # Word list management
│   ├── drag-drop.js     # Drag and drop functionality
│   ├── game-controller.js # Main game logic
│   └── main.js          # Entry point
│
├── index.html           # Main game HTML
├── style.css            # Game styling
└── README.md            # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or Yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/longvv/unscramble_game.git
   cd unscramble_game
   ```

2. Install dependencies:
   ```bash
   # Navigate to the docs-site directory
   cd docs-site
   
   # Install dependencies
   npm install
   # or
   yarn install
   ```

### Development Workflow

#### Running the Documentation Site

```bash
# In the docs-site directory
npm start
# or
yarn start
```

This starts the Docusaurus development server, typically at `http://localhost:3000`.

#### Running the Game

Open `index.html` directly in a web browser.

### Building Documentation

```bash
# In the docs-site directory
npm run build
# or
yarn build
```

### Deployment

The project supports deployment to various platforms:

#### GitHub Pages

```bash
# In the docs-site directory
npm run deploy
# or
yarn deploy
```

## 📖 Documentation

Comprehensive documentation is available in the `docs-site/docs/` directory:

- [User Guide](/docs/user-guide)
- [Developer Guide](/docs/developer-guide)
- [Module Documentation](/docs/modules)
- [Architecture Overview](/docs/architecture)

