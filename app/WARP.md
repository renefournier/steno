# Steno - Development Guide

## Project Overview

**Steno** is a real-time transcription web application designed for note-taking during Bible-based discourses. It uses Transformers.js with Whisper Tiny to transcribe audio while intelligently detecting and extracting Bible scripture references mentioned by the speaker.

## Tech Stack

- **Framework**: SvelteKit (SSR disabled for client-side AI processing)
- **AI Model**: Transformers.js with Whisper Tiny
- **Storage**: localforage (IndexedDB wrapper)
- **Styling**: Bulma CSS framework + Font Awesome icons
- **Audio**: Web Audio API
- **Language**: JavaScript/TypeScript (prefer TypeScript for type safety)

## Architecture

### Core Components

1. **Audio Capture Module**
   - Uses Web Audio API to access browser microphone
   - Handles audio stream processing and chunking
   - Manages recording state (idle, recording, paused)

2. **Transcription Engine**
   - Integrates Transformers.js Whisper Tiny model
   - Processes audio chunks in real-time
   - Returns transcribed text with confidence scores

3. **Scripture Detection Module**
   - Regex-based pattern matching for Bible references
   - Supports various formats:
     - Single verse: "John 3:16", "1 Corinthians 13:4"
     - Verse ranges: "Matthew 5:3-10", "Psalm 23:1-6"
     - Chapter only: "Genesis 1", "Revelation 22"
   - Extracts and normalizes references for consistency

4. **Storage Layer**
   - localforage for persistent data storage
   - Stores:
     - Transcripts (with timestamps)
     - Detected scriptures
     - User settings/preferences
     - Session history

5. **UI Components** (in `/src/lib/ui/`)
   - `Button.svelte` - Reusable button with hover/active states
   - Additional components as needed (panels, controls, etc.)

### Layout Structure

**Two-Panel Design:**
- **Main Panel**: Live transcription with Markdown formatting
- **Side Panel**: Detected scripture references list

Both panels should be resizable/collapsible for flexible viewing.

## Scripture Detection Patterns

### Regex Patterns to Support

```javascript
// Book name followed by chapter:verse or chapter:verse-verse
// Examples: John 3:16, 1 Corinthians 13:4-7, Genesis 1:1-3
const scripturePattern = /\b((?:\d\s)?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s(\d+):(\d+)(?:-(\d+))?\b/g;

// Books to recognize (include common abbreviations)
const bibleBooks = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
  'Revelation', 'Psalms', 'Proverbs', 'Isaiah', // etc.
];
```

## Data Models

### Transcript Entry
```typescript
interface TranscriptEntry {
  id: string;
  timestamp: Date;
  text: string;
  confidence?: number;
}
```

### Scripture Reference
```typescript
interface ScriptureReference {
  id: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  rawText: string; // Original text as heard
  timestamp: Date;
}
```

### Settings
```typescript
interface AppSettings {
  modelLoaded: boolean;
  language: string; // Default: 'en'
  autoStart: boolean;
  showTimestamps: boolean;
  audioSensitivity: number; // 0-100
  theme: 'light' | 'dark'; // For future
  exportFormat: 'markdown' | 'text' | 'json';
}
```

## localforage Keys

```javascript
const STORAGE_KEYS = {
  CURRENT_TRANSCRIPT: 'steno:current_transcript',
  SCRIPTURE_LIST: 'steno:scriptures',
  SETTINGS: 'steno:settings',
  HISTORY: 'steno:transcript_history',
};
```

## UI/UX Guidelines

### Design Principles
- **Clean & Simple**: Monochromatic color scheme, minimal distractions
- **Accessible**: High contrast, keyboard navigation support
- **Responsive**: Works on desktop and tablet (mobile optional)

### Button Styles (per user rules)
- **Normal**: Subtle appearance with link color text
- **Hover**: Slight lift and zoom effect with shadow
- **Active (Click)**: Depressed inset shadow
- **Selected**: Slightly depressed with subtle glow
- **Text Color**: Use `--link-color` with subtle glow

### Common UI Components (`/src/lib/ui/`)

#### Button.svelte
```svelte
<script>
  export let variant = 'primary'; // primary, secondary, danger, success
  export let size = 'normal'; // small, normal, large
  export let disabled = false;
  export let active = false; // For selected state
</script>

<button
  class="button is-{variant} is-{size}"
  class:is-active={active}
  {disabled}
  on:click
>
  <slot />
</button>

<style>
  /* Hover: lift and zoom with shadow */
  /* Active: depressed inset shadow */
  /* Selected: subtle glow */
</style>
```

## Audio Processing

### Whisper Model Setup
```javascript
import { pipeline } from '@xenova/transformers';

let transcriber;

async function loadModel() {
  transcriber = await pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-tiny.en', // English-only for faster performance
    { quantized: true } // Smaller model size
  );
}
```

### Audio Chunking Strategy
- Process audio in 5-10 second chunks
- Overlap chunks by 1-2 seconds to avoid missing words at boundaries
- Use Web Audio API's ScriptProcessorNode or AudioWorklet

## Features Implementation Priority

### Phase 1 - Core Functionality
1. ✅ Setup SvelteKit project
2. Initialize Transformers.js with Whisper Tiny
3. Implement microphone access and audio capture
4. Basic real-time transcription display
5. localforage integration for transcript persistence

### Phase 2 - Scripture Detection
1. Implement regex-based scripture detection
2. Create scripture side panel
3. Link detected scriptures to transcript timestamps
4. Persist scripture list separately

### Phase 3 - Controls & Settings
1. Start/Stop/Pause controls
2. Clear transcript functionality
3. Settings panel with persistence
4. Audio sensitivity controls

### Phase 4 - Export & Polish
1. Copy to clipboard functionality
2. Export as Markdown/Text/JSON
3. Timestamp toggle
4. UI polish and error handling

### Future Enhancements
- Automatic scripture lookup (fetch full verse text from API)
- Speaker detection/diarization
- Multi-language support
- Session management (save/load multiple transcripts)
- Offline PWA support

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Linting
npm run lint
```

## Key Dependencies

```json
{
  "dependencies": {
    "@xenova/transformers": "^2.x",
    "localforage": "^1.x",
    "bulma": "^0.9.x",
    "@fortawesome/fontawesome-free": "^6.x"
  }
}
```

## Browser Requirements

- Modern browser with:
  - Web Audio API support
  - IndexedDB support
  - WebAssembly support (for Transformers.js)
  - Microphone permissions
- Recommended: Chrome 90+, Firefox 88+, Safari 14+

## Performance Considerations

- Whisper Tiny chosen for speed/accuracy balance
- Quantized model for smaller download size
- localforage for fast, async storage
- Debounce scripture detection to avoid excessive processing
- Consider Web Workers for heavy processing

## Security & Privacy

- **No server upload**: All processing happens in-browser
- **Local storage only**: Data never leaves user's device
- **Microphone permission**: Explicitly requested from user
- **No telemetry**: Completely private note-taking

## Testing Strategy

- Unit tests for scripture detection regex
- Integration tests for audio → transcription flow
- E2E tests for full user workflows
- Test with various accents and audio quality levels

## Accessibility

- Keyboard shortcuts for all controls
- ARIA labels for screen readers
- High contrast mode support
- Focus management for keyboard navigation

## File Structure

```
app/
├── src/
│   ├── lib/
│   │   ├── ui/
│   │   │   ├── Button.svelte
│   │   │   └── ...
│   │   ├── audio/
│   │   │   ├── capture.js
│   │   │   └── processor.js
│   │   ├── transcription/
│   │   │   ├── whisper.js
│   │   │   └── scripture-detector.js
│   │   ├── storage/
│   │   │   └── localforage-config.js
│   │   └── utils/
│   │       └── markdown.js
│   ├── routes/
│   │   ├── +page.svelte (main app)
│   │   └── +layout.svelte
│   └── app.html
├── static/
│   └── fonts/ (Font Awesome)
├── svelte.config.js
├── vite.config.js
└── WARP.md (this file)
```

## Notes

- Keep UI components in `/src/lib/ui/` per user preference
- Use Bulma CSS classes consistently
- Follow user's button styling rules for all interactive elements
- Markdown formatting should be applied to transcript display
- Always persist state changes to localforage immediately
