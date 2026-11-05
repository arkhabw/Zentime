// audio.js - Synthesized Gentle Audio Chime via Web Audio API (~10s)

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Plays a calming harmonic chime note with gentle exponential decay
function playBellNote(ctx, freq, startTime, duration = 3.2, gainPeak = 0.08) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Pure sine wave for soothing singing-bowl warmth
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);

  // Soft attack (prevents clicks) followed by long exponential release
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
}

// Triggers a 3-stage tranquil chime sequence lasting ~10 seconds
function playTenSecondChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic chords (C-Major pentatonic: 523.25Hz, 659.25Hz, 783.99Hz)
    // 1st chime chord (0.0s - 3.2s)
    playBellNote(ctx, 523.25, now, 3.2, 0.08);
    playBellNote(ctx, 659.25, now + 0.05, 3.0, 0.05);

    // 2nd chime chord (3.4s - 6.6s)
    playBellNote(ctx, 587.33, now + 3.4, 3.2, 0.07);
    playBellNote(ctx, 783.99, now + 3.45, 3.0, 0.05);

    // 3rd resolving chime chord (6.8s - 10.0s)
    playBellNote(ctx, 523.25, now + 6.8, 3.2, 0.06);
    playBellNote(ctx, 659.25, now + 6.85, 3.2, 0.05);
    playBellNote(ctx, 1046.50, now + 6.9, 2.8, 0.02);
  } catch (err) {
    console.error("Failed to play audio chime:", err);
  }
}

// Listen for playback request from background service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PLAY_CHIME") {
    playTenSecondChime();
    sendResponse({ success: true });
  }
  return true;
});
