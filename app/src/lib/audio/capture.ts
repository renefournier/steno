import type { RecordingState } from '../types';

const SAMPLE_RATE = 16000; // Whisper expects 16kHz audio
const BUFFER_SIZE = 8192;

export class AudioCapture {
	private audioContext: AudioContext | null = null;
	private mediaStream: MediaStream | null = null;
	private source: MediaStreamAudioSourceNode | null = null;
	private processor: ScriptProcessorNode | null = null;
	private recordingState: RecordingState = 'idle';
	private audioChunks: Float32Array[] = [];
	private onDataCallback: ((audioData: Float32Array) => void) | null = null;

	/**
	 * Initialize audio capture and request microphone permission
	 */
	async initialize(): Promise<void> {
		try {
			// Request microphone access
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1, // Mono
					sampleRate: SAMPLE_RATE,
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true
				}
			});

			// Create audio context
			this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });

			// Create audio source from stream
			this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

			// Create script processor for audio data
			this.processor = this.audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

			// Set up audio processing
			this.processor.onaudioprocess = (e) => {
				if (this.recordingState !== 'recording') return;

				const inputData = e.inputBuffer.getChannelData(0);
				const audioData = new Float32Array(inputData);

				// Store chunk
				this.audioChunks.push(audioData);

				// Call the callback with the new audio data
				if (this.onDataCallback) {
					this.onDataCallback(audioData);
				}
			};

			// Connect the nodes
			this.source.connect(this.processor);
			this.processor.connect(this.audioContext.destination);

			console.log('Audio capture initialized');
		} catch (error) {
			console.error('Error initializing audio capture:', error);
			throw new Error('Failed to access microphone. Please grant permission and try again.');
		}
	}

	/**
	 * Start recording audio
	 */
	start(): void {
		if (!this.audioContext || !this.processor) {
			throw new Error('Audio capture not initialized');
		}

		this.recordingState = 'recording';
		this.audioChunks = [];
		console.log('Recording started');
	}

	/**
	 * Pause recording
	 */
	pause(): void {
		this.recordingState = 'paused';
		console.log('Recording paused');
	}

	/**
	 * Resume recording
	 */
	resume(): void {
		if (!this.audioContext || !this.processor) {
			throw new Error('Audio capture not initialized');
		}

		this.recordingState = 'recording';
		console.log('Recording resumed');
	}

	/**
	 * Stop recording and clean up
	 */
	stop(): void {
		this.recordingState = 'idle';
		console.log('Recording stopped');
	}

	/**
	 * Get all recorded audio chunks combined
	 */
	getRecordedAudio(): Float32Array {
		if (this.audioChunks.length === 0) {
			return new Float32Array(0);
		}

		// Calculate total length
		const totalLength = this.audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);

		// Combine all chunks into one array
		const combined = new Float32Array(totalLength);
		let offset = 0;

		for (const chunk of this.audioChunks) {
			combined.set(chunk, offset);
			offset += chunk.length;
		}

		return combined;
	}

	/**
	 * Get the last N seconds of audio
	 */
	getRecentAudio(seconds: number): Float32Array {
		const samplesNeeded = SAMPLE_RATE * seconds;
		const allAudio = this.getRecordedAudio();

		if (allAudio.length <= samplesNeeded) {
			return allAudio;
		}

		return allAudio.slice(allAudio.length - samplesNeeded);
	}

	/**
	 * Set callback for incoming audio data
	 */
	setDataCallback(callback: (audioData: Float32Array) => void): void {
		this.onDataCallback = callback;
	}

	/**
	 * Get current recording state
	 */
	getState(): RecordingState {
		return this.recordingState;
	}

	/**
	 * Clean up resources
	 */
	dispose(): void {
		if (this.processor) {
			this.processor.disconnect();
			this.processor = null;
		}

		if (this.source) {
			this.source.disconnect();
			this.source = null;
		}

		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach((track) => track.stop());
			this.mediaStream = null;
		}

		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}

		this.audioChunks = [];
		this.recordingState = 'idle';
		console.log('Audio capture disposed');
	}
}
