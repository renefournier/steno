<script lang="ts">
  import { onMount } from "svelte";
  import Button from "$lib/ui/Button.svelte";
  import { AudioCapture } from "$lib/audio/capture";
  import {
    loadModel,
    transcribe,
    isModelLoaded,
  } from "$lib/transcription/whisper";
  import {
    detectScriptures,
    formatScripture,
    isSameScripture,
  } from "$lib/transcription/scripture-detector";
  import type {
    TranscriptEntry,
    ScriptureReference,
    RecordingState,
    AppSettings,
  } from "$lib/types";
  import {
    getTranscript,
    saveTranscript,
    getScriptures,
    saveScriptures,
    clearTranscript,
    clearScriptures,
    getSettings,
    saveSettings,
  } from "$lib/storage/store";
  import {
    exportTranscript,
    copyToClipboard,
    formatAsMarkdown,
  } from "$lib/utils/export";

  // State
  let isLoading = $state(true);
  let loadingMessage = $state("Initializing...");
  let recordingState: RecordingState = $state("idle");
  let transcripts: TranscriptEntry[] = $state([]);
  let scriptures: ScriptureReference[] = $state([]);
  let settings: AppSettings = $state({
    modelLoaded: false,
    language: "en",
    autoStart: false,
    showTimestamps: true,
    audioSensitivity: 50,
    theme: "light",
    exportFormat: "markdown",
  });

  let audioCapture: AudioCapture | null = null;
  let accumulatedAudio: Float32Array[] = [];
  let transcriptionTimer: number | null = null;
  const TRANSCRIPTION_INTERVAL = 10000; // Transcribe every 10 seconds

  onMount(async () => {
    // Ensure we're in the browser
    if (typeof window === "undefined") return;

    try {
      // Load saved data
      loadingMessage = "Loading saved data...";
      const [savedTranscripts, savedScriptures, savedSettings] =
        await Promise.all([getTranscript(), getScriptures(), getSettings()]);

      transcripts = savedTranscripts;
      scriptures = savedScriptures;
      settings = savedSettings;

      // Load Whisper model (always reload for now to avoid caching issues)
      loadingMessage = "Loading AI model (this may take a moment)...";
      try {
        await loadModel((progress) => {
          if (progress.status === "progress" && progress.progress > 0) {
            loadingMessage = `Loading model: ${Math.round(progress.progress)}%`;
          } else if (progress.status) {
            loadingMessage = `Loading model: ${progress.status}...`;
          }
        });
        settings.modelLoaded = true;
        await saveSettings(settings);
      } catch (modelError) {
        console.error("Model loading error:", modelError);
        // Don't throw error - allow app to continue without AI model
        // The app can still function for basic transcription features
        console.warn(
          "AI model failed to load, but app will continue without it"
        );
        settings.modelLoaded = false;
        await saveSettings(settings);
      }

      isLoading = false;
    } catch (error) {
      console.error("Initialization error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      loadingMessage = `Error: ${errorMsg}. Check browser console for details.`;
      // Keep showing loading overlay with error message
    }
  });

  async function handleStart() {
    try {
      if (!audioCapture) {
        audioCapture = new AudioCapture();
        await audioCapture.initialize();
        audioCapture.setDataCallback((audioData) => {
          accumulatedAudio.push(audioData);
        });
      }

      audioCapture.start();
      recordingState = "recording";

      // Start periodic transcription
      transcriptionTimer = window.setInterval(
        performTranscription,
        TRANSCRIPTION_INTERVAL
      );
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Failed to start recording. Please check microphone permissions.");
    }
  }

  function handlePause() {
    if (audioCapture) {
      audioCapture.pause();
      recordingState = "paused";
      if (transcriptionTimer) {
        clearInterval(transcriptionTimer);
      }
    }
  }

  function handleResume() {
    if (audioCapture) {
      audioCapture.resume();
      recordingState = "recording";
      transcriptionTimer = window.setInterval(
        performTranscription,
        TRANSCRIPTION_INTERVAL
      );
    }
  }

  async function handleStop() {
    if (audioCapture) {
      audioCapture.stop();
      recordingState = "idle";
      if (transcriptionTimer) {
        clearInterval(transcriptionTimer);
      }
      // Final transcription
      await performTranscription();
    }
  }

  async function performTranscription() {
    if (accumulatedAudio.length === 0) return;

    try {
      // Combine accumulated audio chunks
      const totalLength = accumulatedAudio.reduce(
        (sum, chunk) => sum + chunk.length,
        0
      );
      const combinedAudio = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of accumulatedAudio) {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
      }

      // Clear accumulated audio
      accumulatedAudio = [];

      // Transcribe
      const result = await transcribe(combinedAudio);

      if (result.text.trim()) {
        // Add to transcripts
        const entry: TranscriptEntry = {
          id: `transcript-${Date.now()}`,
          timestamp: new Date(),
          text: result.text.trim(),
          confidence: result.confidence,
        };
        transcripts = [...transcripts, entry];
        await saveTranscript(transcripts);

        // Detect scriptures
        const detectedScriptures = detectScriptures(result.text);
        if (detectedScriptures.length > 0) {
          // Filter out duplicates
          const newScriptures = detectedScriptures.filter(
            (detected) =>
              !scriptures.some((existing) =>
                isSameScripture(detected, existing)
              )
          );
          if (newScriptures.length > 0) {
            scriptures = [...scriptures, ...newScriptures];
            await saveScriptures(scriptures);
          }
        }
      }
    } catch (error) {
      console.error("Transcription error:", error);
    }
  }

  async function handleClear() {
    if (confirm("Clear all transcripts and scriptures?")) {
      transcripts = [];
      scriptures = [];
      await clearTranscript();
      await clearScriptures();
    }
  }

  async function handleCopy() {
    try {
      const content = formatAsMarkdown(
        transcripts,
        scriptures,
        settings.showTimestamps
      );
      await copyToClipboard(content);
      alert("Copied to clipboard!");
    } catch (error) {
      alert("Failed to copy to clipboard");
    }
  }

  function handleExport() {
    exportTranscript(
      transcripts,
      scriptures,
      settings.exportFormat,
      settings.showTimestamps
    );
  }

  function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString();
  }
</script>

{#if isLoading}
  <div class="loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>{loadingMessage}</p>
    </div>
  </div>
{/if}

<div class="app-container">
  <header class="app-header">
    <div
      style="display: flex; justify-content: space-between; align-items: center;"
    >
      <div>
        <h1
          class="title is-4"
          style="margin: 0; display: flex; align-items: center; gap: 0.5rem;"
        >
          <i class="fas fa-microphone"></i>
          Steno
        </h1>
        <p class="subtitle is-6" style="margin: 0; color: #666;">
          Real-time Transcription with Scripture Detection
        </p>
      </div>

      <div class="controls">
        {#if recordingState === "idle"}
          <Button variant="primary" onclick={handleStart}>
            <i class="fas fa-play"></i>
            <span style="margin-left: 0.5rem;">Start</span>
          </Button>
        {:else if recordingState === "recording"}
          <Button variant="secondary" onclick={handlePause}>
            <i class="fas fa-pause"></i>
            <span style="margin-left: 0.5rem;">Pause</span>
          </Button>
          <Button variant="danger" onclick={handleStop}>
            <i class="fas fa-stop"></i>
            <span style="margin-left: 0.5rem;">Stop</span>
          </Button>
        {:else if recordingState === "paused"}
          <Button variant="primary" onclick={handleResume}>
            <i class="fas fa-play"></i>
            <span style="margin-left: 0.5rem;">Resume</span>
          </Button>
          <Button variant="danger" onclick={handleStop}>
            <i class="fas fa-stop"></i>
            <span style="margin-left: 0.5rem;">Stop</span>
          </Button>
        {/if}

        {#if transcripts.length > 0}
          <Button variant="secondary" onclick={handleCopy}>
            <i class="fas fa-copy"></i>
          </Button>
          <Button variant="secondary" onclick={handleExport}>
            <i class="fas fa-download"></i>
          </Button>
          <Button variant="danger" onclick={handleClear}>
            <i class="fas fa-trash"></i>
          </Button>
        {/if}
      </div>
    </div>
  </header>

  <main class="app-main">
    <div class="transcript-panel">
      <div class="panel-header">
        <i class="fas fa-file-alt"></i>
        Transcript
        {#if recordingState === "recording"}
          <span style="margin-left: 0.5rem; color: #f14668;">
            <i
              class="fas fa-circle"
              style="font-size: 0.5rem; animation: pulse 1.5s infinite;"
            ></i>
            Recording
          </span>
        {/if}
      </div>
      <div class="panel-content">
        {#if transcripts.length === 0}
          <div class="empty-state">
            <i class="fas fa-microphone-slash"></i>
            <p>No transcript yet</p>
            <p style="font-size: 0.9rem;">Click Start to begin transcription</p>
          </div>
        {:else}
          {#each transcripts as entry (entry.id)}
            <div class="transcript-entry">
              {#if settings.showTimestamps}
                <div class="transcript-timestamp"
                  >{formatTime(entry.timestamp)}</div
                >
              {/if}
              <div class="transcript-text">{entry.text}</div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <div class="scripture-panel">
      <div class="panel-header">
        <i class="fas fa-book-open"></i>
        Scriptures ({scriptures.length})
      </div>
      <div class="panel-content">
        {#if scriptures.length === 0}
          <div class="empty-state">
            <i class="fas fa-book"></i>
            <p>No scriptures detected</p>
          </div>
        {:else}
          {#each scriptures as scripture (scripture.id)}
            <div class="scripture-item">
              <div class="scripture-ref">{formatScripture(scripture)}</div>
              <div class="scripture-time">{formatTime(scripture.timestamp)}</div
              >
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </main>
</div>

<style>
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
</style>
