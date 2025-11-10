export interface TranscriptEntry {
	id: string;
	timestamp: Date;
	text: string;
	confidence?: number;
}

export interface ScriptureReference {
	id: string;
	book: string;
	chapter: number;
	verseStart: number;
	verseEnd?: number;
	rawText: string; // Original text as heard
	timestamp: Date;
}

export interface AppSettings {
	modelLoaded: boolean;
	language: string; // Default: 'en'
	autoStart: boolean;
	showTimestamps: boolean;
	audioSensitivity: number; // 0-100
	theme: 'light' | 'dark';
	exportFormat: 'markdown' | 'text' | 'json';
}

export type RecordingState = 'idle' | 'recording' | 'paused';
