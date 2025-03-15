# MP3 Files Used in English 4 Kids

This document lists all MP3 files used in the application. All files have been downloaded and stored locally in the `/assets/sounds/` directory.

## Sound Effects

| Sound Type | Purpose | File Path | Audio Element ID |
|------------|---------|-----------|------------------|
| Correct Answer | Played when user correctly solves a word | assets/sounds/correct-sound.mp3 | correct-sound |
| Wrong Answer | Played when user submits an incorrect answer | assets/sounds/wrong-sound.mp3 | wrong-sound |
| Drag Sound | Played when dragging letter tiles | assets/sounds/drag-sound.mp3 | drag-sound |
| Hint Sound | Played when user requests a hint | assets/sounds/hint-sound.mp3 | hint-sound |
| Clapping | Part of the celebration when solving a word | assets/sounds/clapping-sound.mp3 | clapping-sound |
| Whistle | Part of the celebration when solving a word | assets/sounds/whistle-sound.mp3 | whistle-sound |

## Text-to-Speech API

The application uses Google's text-to-speech API for word pronunciation with a local fallback mechanism:

```
https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=[WORD]
```

This is used by the pronunciation feature and is dynamically generated based on the current word.

## Implementation Notes

1. All sound files are now stored locally in the `/assets/sounds/` directory.

2. The HTML and config.js files have been updated to reference the local files instead of the URLs.

3. For the text-to-speech functionality:
   - A fallback mechanism has been implemented in audio.js
   - The app will first check for local pronunciation files in `/assets/sounds/pronunciations/`
   - If a local file is not found, it will fall back to the Google TTS API
   - To add local pronunciations, save MP3 files in the format: `word-name.mp3` in the pronunciations directory

4. This approach provides better offline support while maintaining the convenience of the online TTS API when available.