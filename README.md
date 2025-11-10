# Steno

**Real-time transcription with Bible scripture detection for religious discourse note-taking**

Steno is a SvelteKit-based web application that uses AI-powered speech recognition (Transformers.js with Whisper Tiny) to transcribe audio in real-time while intelligently detecting and extracting Bible scripture references mentioned during religious talks and sermons.

## Features

- **Real-time Transcription**: Live speech-to-text using Whisper Tiny model via Transformers.js
- **Scripture Detection**: Automatically identifies Bible verse references (e.g., "John 3:16", "1 Corinthians 13:4-7") and displays them in a dedicated panel
- **Markdown Formatting**: Transcriptions are formatted with Markdown for better readability
- **Persistent Storage**: All transcripts and settings saved locally using localforage
- **Full Control**: Start, stop, pause, clear, and reset functionality
- **Copy & Export**: Easy copying to clipboard and export options
- **Timestamps**: Optional timestamps for transcript entries
- **Clean, Monochromatic Design**: Simple, distraction-free interface using Bulma CSS and Font Awesome icons

## Use Case

Perfect for attendees of Bible-based discourses, sermons, Bible studies, and religious meetings who want to:
- Take accurate notes without missing content
- Keep track of all scriptures referenced during a talk
- Review and study the material later
- Export notes for sharing or personal study

## Tech Stack

- **Framework**: SvelteKit
- **AI/ML**: Transformers.js (Whisper Tiny model)
- **Storage**: localforage for offline-first data persistence
- **Styling**: Bulma CSS framework + Font Awesome icons
- **Audio**: Web Audio API for microphone access

## Project Structure

```
steno/
├── app/              # SvelteKit application root
│   ├── src/
│   │   ├── lib/
│   │   │   └── ui/   # Reusable UI components (Button, etc.)
│   │   └── routes/   # SvelteKit pages
│   └── static/       # Static assets
└── README.md         # This file
```

## Getting Started

See `app/` directory for the SvelteKit application.

## Roadmap

- [ ] Core transcription engine with Whisper Tiny
- [ ] Scripture detection and extraction
- [ ] Two-panel layout (transcript + scriptures)
- [ ] Audio controls (start/stop/pause)
- [ ] Settings persistence with localforage
- [ ] Export functionality
- [ ] Future: Automatic scripture lookup and full text display

## License

See [LICENSE](LICENSE) file for details.
