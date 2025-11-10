import { pipeline, env } from '@xenova/transformers';

// Configure environment
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber: any = null;

// Listen for messages from the main thread
self.onmessage = async (event) => {
	const { type, data } = event.data;

	try {
		switch (type) {
			case 'load':
				if (!transcriber) {
					console.log('[Worker] Loading Whisper model...');
					transcriber = await pipeline(
						'automatic-speech-recognition',
						'Xenova/whisper-tiny.en',
						{
							quantized: true,
							progress_callback: (progress: any) => {
								self.postMessage({
									type: 'progress',
									data: progress
								});
							}
						}
					);
					console.log('[Worker] Model loaded successfully');
				}
				self.postMessage({ type: 'loaded' });
				break;

			case 'transcribe':
				if (!transcriber) {
					throw new Error('Model not loaded');
				}
				
				const result = await transcriber(data.audioData, {
					language: 'english',
					task: 'transcribe',
					return_timestamps: false
				});

				self.postMessage({
					type: 'result',
					data: {
						text: result.text || '',
						confidence: result.chunks?.[0]?.score
					}
				});
				break;

			case 'dispose':
				transcriber = null;
				self.postMessage({ type: 'disposed' });
				break;

			default:
				throw new Error(`Unknown message type: ${type}`);
		}
	} catch (error: any) {
		self.postMessage({
			type: 'error',
			data: {
				message: error.message,
				stack: error.stack
			}
		});
	}
};
