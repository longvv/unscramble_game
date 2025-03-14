# Word Pronunciation Files

This directory contains MP3 files for word pronunciations used in the Word Scramble Game.

## Adding Pronunciation Files

To add a local pronunciation file for a word:

1. Create an MP3 file with clear pronunciation of the word
2. Name the file using this format: `word-name.mp3`
   - Convert the word to lowercase
   - Replace spaces with hyphens
   - Example: For "Ice Cream", name the file `ice-cream.mp3`
3. Place the file in this directory

## How It Works

The game will automatically check for local pronunciation files before using the online text-to-speech API. This provides better offline support and faster loading times.

## Benefits

- Works offline when no internet connection is available
- Faster loading times (no API calls)
- Custom pronunciations for specific words
- Better control over audio quality

## Recommended Tools

To create pronunciation files, you can use:

- Text-to-speech services that allow downloading MP3 files
- Voice recording apps with MP3 export
- Audio editing software to trim and optimize the files

Keep files small (under 100KB if possible) for better performance.