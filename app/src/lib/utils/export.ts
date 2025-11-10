import type { TranscriptEntry, ScriptureReference } from '../types';
import { formatScripture } from '../transcription/scripture-detector';

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
	try {
		await navigator.clipboard.writeText(text);
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		throw new Error('Failed to copy to clipboard');
	}
}

/**
 * Format transcript as Markdown
 */
export function formatAsMarkdown(
	transcripts: TranscriptEntry[],
	scriptures: ScriptureReference[],
	includeTimestamps: boolean = true
): string {
	let markdown = '# Transcript\n\n';

	if (transcripts.length === 0) {
		markdown += '_No transcript available_\n\n';
	} else {
		for (const entry of transcripts) {
			if (includeTimestamps) {
				const time = new Date(entry.timestamp).toLocaleTimeString();
				markdown += `**[${time}]**\n\n`;
			}
			markdown += `${entry.text}\n\n`;
		}
	}

	markdown += '\n## Scripture References\n\n';

	if (scriptures.length === 0) {
		markdown += '_No scriptures detected_\n\n';
	} else {
		for (const scripture of scriptures) {
			const ref = formatScripture(scripture);
			const time = new Date(scripture.timestamp).toLocaleTimeString();
			markdown += `- **${ref}** _(${time})_\n`;
		}
	}

	return markdown;
}

/**
 * Format transcript as plain text
 */
export function formatAsText(
	transcripts: TranscriptEntry[],
	scriptures: ScriptureReference[],
	includeTimestamps: boolean = true
): string {
	let text = 'TRANSCRIPT\n';
	text += '='.repeat(50) + '\n\n';

	if (transcripts.length === 0) {
		text += 'No transcript available\n\n';
	} else {
		for (const entry of transcripts) {
			if (includeTimestamps) {
				const time = new Date(entry.timestamp).toLocaleTimeString();
				text += `[${time}]\n`;
			}
			text += `${entry.text}\n\n`;
		}
	}

	text += '\n\nSCRIPTURE REFERENCES\n';
	text += '='.repeat(50) + '\n\n';

	if (scriptures.length === 0) {
		text += 'No scriptures detected\n';
	} else {
		for (const scripture of scriptures) {
			const ref = formatScripture(scripture);
			const time = new Date(scripture.timestamp).toLocaleTimeString();
			text += `• ${ref} (${time})\n`;
		}
	}

	return text;
}

/**
 * Format transcript as JSON
 */
export function formatAsJSON(
	transcripts: TranscriptEntry[],
	scriptures: ScriptureReference[]
): string {
	return JSON.stringify(
		{
			transcript: transcripts,
			scriptures: scriptures,
			exportedAt: new Date().toISOString()
		},
		null,
		2
	);
}

/**
 * Download content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Export transcript with the specified format
 */
export function exportTranscript(
	transcripts: TranscriptEntry[],
	scriptures: ScriptureReference[],
	format: 'markdown' | 'text' | 'json',
	includeTimestamps: boolean = true
): void {
	const timestamp = new Date().toISOString().split('T')[0];
	let content: string;
	let filename: string;
	let mimeType: string;

	switch (format) {
		case 'markdown':
			content = formatAsMarkdown(transcripts, scriptures, includeTimestamps);
			filename = `steno-transcript-${timestamp}.md`;
			mimeType = 'text/markdown';
			break;
		case 'text':
			content = formatAsText(transcripts, scriptures, includeTimestamps);
			filename = `steno-transcript-${timestamp}.txt`;
			mimeType = 'text/plain';
			break;
		case 'json':
			content = formatAsJSON(transcripts, scriptures);
			filename = `steno-transcript-${timestamp}.json`;
			mimeType = 'application/json';
			break;
	}

	downloadFile(content, filename, mimeType);
}
