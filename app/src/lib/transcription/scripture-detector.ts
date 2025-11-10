import type { ScriptureReference } from '../types';

// Comprehensive list of Bible books (66 books + common variations)
const BIBLE_BOOKS = [
	// Old Testament
	'Genesis',
	'Exodus',
	'Leviticus',
	'Numbers',
	'Deuteronomy',
	'Joshua',
	'Judges',
	'Ruth',
	'1 Samuel',
	'2 Samuel',
	'1 Kings',
	'2 Kings',
	'1 Chronicles',
	'2 Chronicles',
	'Ezra',
	'Nehemiah',
	'Esther',
	'Job',
	'Psalm',
	'Psalms',
	'Proverbs',
	'Ecclesiastes',
	'Song of Solomon',
	'Song of Songs',
	'Isaiah',
	'Jeremiah',
	'Lamentations',
	'Ezekiel',
	'Daniel',
	'Hosea',
	'Joel',
	'Amos',
	'Obadiah',
	'Jonah',
	'Micah',
	'Nahum',
	'Habakkuk',
	'Zephaniah',
	'Haggai',
	'Zechariah',
	'Malachi',
	// New Testament
	'Matthew',
	'Mark',
	'Luke',
	'John',
	'Acts',
	'Romans',
	'1 Corinthians',
	'2 Corinthians',
	'Galatians',
	'Ephesians',
	'Philippians',
	'Colossians',
	'1 Thessalonians',
	'2 Thessalonians',
	'1 Timothy',
	'2 Timothy',
	'Titus',
	'Philemon',
	'Hebrews',
	'James',
	'1 Peter',
	'2 Peter',
	'1 John',
	'2 John',
	'3 John',
	'Jude',
	'Revelation'
];

// Create regex pattern for book names
const bookPattern = BIBLE_BOOKS.map((book) => book.replace(/\s/g, '\\s+')).join('|');

// Main scripture detection pattern
// Matches: "John 3:16", "1 Corinthians 13:4-7", "Genesis 1:1-3", "Psalm 23:1"
const scripturePattern = new RegExp(
	`\\b(${bookPattern})\\s+(\\d+):(\\d+)(?:-(\\d+))?\\b`,
	'gi'
);

/**
 * Detects Bible scripture references in text
 * @param text - The text to search for scripture references
 * @returns Array of detected scripture references
 */
export function detectScriptures(text: string): ScriptureReference[] {
	const scriptures: ScriptureReference[] = [];
	const matches = text.matchAll(scripturePattern);

	for (const match of matches) {
		const [rawText, book, chapter, verseStart, verseEnd] = match;

		scriptures.push({
			id: generateId(),
			book: normalizeBookName(book),
			chapter: parseInt(chapter, 10),
			verseStart: parseInt(verseStart, 10),
			verseEnd: verseEnd ? parseInt(verseEnd, 10) : undefined,
			rawText: rawText.trim(),
			timestamp: new Date()
		});
	}

	return scriptures;
}

/**
 * Normalizes book names (e.g., "psalms" -> "Psalm")
 */
function normalizeBookName(book: string): string {
	const normalized = book.trim();
	// Handle special cases
	if (normalized.toLowerCase() === 'psalms') return 'Psalm';
	if (normalized.toLowerCase() === 'song of solomon') return 'Song of Songs';
	return normalized;
}

/**
 * Generates a unique ID for scripture references
 */
function generateId(): string {
	return `scripture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats a scripture reference as a readable string
 */
export function formatScripture(scripture: ScriptureReference): string {
	const verseRange = scripture.verseEnd
		? `${scripture.verseStart}-${scripture.verseEnd}`
		: scripture.verseStart.toString();

	return `${scripture.book} ${scripture.chapter}:${verseRange}`;
}

/**
 * Checks if two scripture references are the same
 */
export function isSameScripture(a: ScriptureReference, b: ScriptureReference): boolean {
	return (
		a.book === b.book &&
		a.chapter === b.chapter &&
		a.verseStart === b.verseStart &&
		a.verseEnd === b.verseEnd
	);
}
