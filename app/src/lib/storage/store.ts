import localforage from 'localforage';
import type { TranscriptEntry, ScriptureReference, AppSettings } from '../types';

export const STORAGE_KEYS = {
	CURRENT_TRANSCRIPT: 'steno:current_transcript',
	SCRIPTURE_LIST: 'steno:scriptures',
	SETTINGS: 'steno:settings',
	HISTORY: 'steno:transcript_history'
} as const;

// Configure localforage
localforage.config({
	name: 'Steno',
	storeName: 'steno_db',
	description: 'Steno transcription and scripture storage'
});

// Default settings
const defaultSettings: AppSettings = {
	modelLoaded: false,
	language: 'en',
	autoStart: false,
	showTimestamps: true,
	audioSensitivity: 50,
	theme: 'light',
	exportFormat: 'markdown'
};

// Storage helper functions
export async function getTranscript(): Promise<TranscriptEntry[]> {
	const transcript = await localforage.getItem<any[]>(STORAGE_KEYS.CURRENT_TRANSCRIPT);
	if (!transcript) return [];
	// Convert ISO strings back to Date objects
	return transcript.map(entry => ({
		...entry,
		timestamp: new Date(entry.timestamp)
	}));
}

export async function saveTranscript(entries: TranscriptEntry[]): Promise<void> {
	// Convert Date objects to ISO strings for IndexedDB
	const serialized = entries.map(entry => ({
		...entry,
		timestamp: entry.timestamp.toISOString()
	}));
	await localforage.setItem(STORAGE_KEYS.CURRENT_TRANSCRIPT, serialized);
}

export async function clearTranscript(): Promise<void> {
	await localforage.removeItem(STORAGE_KEYS.CURRENT_TRANSCRIPT);
}

export async function getScriptures(): Promise<ScriptureReference[]> {
	const scriptures = await localforage.getItem<any[]>(STORAGE_KEYS.SCRIPTURE_LIST);
	if (!scriptures) return [];
	// Convert ISO strings back to Date objects
	return scriptures.map(scripture => ({
		...scripture,
		timestamp: new Date(scripture.timestamp)
	}));
}

export async function saveScriptures(scriptures: ScriptureReference[]): Promise<void> {
	// Convert Date objects to ISO strings for IndexedDB
	const serialized = scriptures.map(scripture => ({
		...scripture,
		timestamp: scripture.timestamp.toISOString()
	}));
	await localforage.setItem(STORAGE_KEYS.SCRIPTURE_LIST, serialized);
}

export async function clearScriptures(): Promise<void> {
	await localforage.removeItem(STORAGE_KEYS.SCRIPTURE_LIST);
}

export async function getSettings(): Promise<AppSettings> {
	const settings = await localforage.getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
	return settings || defaultSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
	// Create a plain object to avoid issues with Svelte proxies
	const plainSettings = {
		modelLoaded: settings.modelLoaded,
		language: settings.language,
		autoStart: settings.autoStart,
		showTimestamps: settings.showTimestamps,
		audioSensitivity: settings.audioSensitivity,
		theme: settings.theme,
		exportFormat: settings.exportFormat
	};
	await localforage.setItem(STORAGE_KEYS.SETTINGS, plainSettings);
}

export async function clearAllData(): Promise<void> {
	await localforage.clear();
}
