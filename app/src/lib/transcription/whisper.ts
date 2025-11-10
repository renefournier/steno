import WhisperWorker from './whisper.worker?worker';

let worker: Worker | null = null;
let isLoading = false;
let isLoaded = false;

export interface TranscriptionResult {
	text: string;
	confidence?: number;
}

/**
 * Initialize the Web Worker
 */
function initWorker(): Worker {
	if (!worker) {
		worker = new WhisperWorker();
	}
	return worker;
}

/**
 * Load the Whisper Tiny model in the worker
 */
export async function loadModel(
	onProgress?: (progress: { progress: number; status: string }) => void
): Promise<void> {
	if (isLoaded) {
		console.log('Model already loaded');
		return;
	}

	if (isLoading) {
		console.log('Model is currently loading');
		return;
	}

	isLoading = true;

	return new Promise((resolve, reject) => {
		const workerInstance = initWorker();

		const handleMessage = (event: MessageEvent) => {
			const { type, data } = event.data;

			switch (type) {
				case 'progress':
					if (onProgress) {
						onProgress(data);
					}
					break;

				case 'loaded':
					isLoaded = true;
					isLoading = false;
					workerInstance.removeEventListener('message', handleMessage);
					console.log('Whisper model loaded successfully');
					resolve();
					break;

				case 'error':
					isLoading = false;
					workerInstance.removeEventListener('message', handleMessage);
					console.error('Error loading Whisper model:', data);
					reject(new Error(data.message));
					break;
			}
		};

		workerInstance.addEventListener('message', handleMessage);
		workerInstance.postMessage({ type: 'load' });
	});
}

/**
 * Check if the model is loaded
 */
export function isModelLoaded(): boolean {
	return isLoaded;
}

/**
 * Transcribe audio data
 * @param audioData - Float32Array of audio samples (16kHz, mono)
 */
export async function transcribe(audioData: Float32Array): Promise<TranscriptionResult> {
	if (!isLoaded || !worker) {
		throw new Error('Model not loaded. Call loadModel() first.');
	}

	return new Promise((resolve, reject) => {
		const handleMessage = (event: MessageEvent) => {
			const { type, data } = event.data;

			switch (type) {
				case 'result':
					worker!.removeEventListener('message', handleMessage);
					resolve(data);
					break;

				case 'error':
					worker!.removeEventListener('message', handleMessage);
					console.error('Transcription error:', data);
					reject(new Error(data.message));
					break;
			}
		};

		worker.addEventListener('message', handleMessage);
		worker.postMessage({
			type: 'transcribe',
			data: { audioData }
		});
	});
}

/**
 * Dispose of the model to free up memory
 */
export function disposeModel(): void {
	if (worker) {
		worker.postMessage({ type: 'dispose' });
		worker.terminate();
		worker = null;
		isLoaded = false;
		console.log('Whisper model disposed');
	}
}
