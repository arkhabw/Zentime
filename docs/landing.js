// landing.js - Interactive Controller for Zentime Showcase Landing Page
// 100% Vanilla JS, zero dependencies, high performance

(function () {
  "use strict";

  // -------------------------------------------------------------
  // 1. Welcome Entrance Sequence
  // -------------------------------------------------------------
  const welcomeOverlay = document.getElementById("welcomeOverlay");
  if (welcomeOverlay) {
    const dismissWelcome = () => {
      welcomeOverlay.classList.add("is-hidden");
      setTimeout(() => {
        welcomeOverlay.remove();
      }, 800);
    };

    // Auto-dismiss after gentle breathing animation
    setTimeout(dismissWelcome, 1300);

    // Allow instant dismiss on click or key press
    welcomeOverlay.addEventListener("click", dismissWelcome);
    window.addEventListener("keydown", dismissWelcome, { once: true });
  }

  // -------------------------------------------------------------
  // 2. Dual-Theme Toggle (Obsidian Dark / Matte Light)
  // -------------------------------------------------------------
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const storedTheme = localStorage.getItem("zentime_theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("zentime_theme", theme);
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
      themeToggleBtn.setAttribute("aria-label", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
    }
  }

  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  // -------------------------------------------------------------
  // 3. Scroll Reveal Animations (Apple-style Stagger)
  // -------------------------------------------------------------
  const revealElements = document.querySelectorAll(".scroll-reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-revealed"));
  }

  // -------------------------------------------------------------
  // 4. Interactive Hero Widget Simulator
  // -------------------------------------------------------------
  let timerDuration = 25 * 60; // 25 mins in seconds
  let timerRemaining = 24 * 60 + 57; // 24:57 initial
  let isTimerRunning = true;
  let timerInterval = null;
  let activeStyle = "ring"; // "ring" | "bar" | "minimal"
  const STYLES = ["ring", "bar", "minimal"];

  const countdownDigitsEl = document.getElementById("heroCountdownDigits");
  const ringFillEl = document.getElementById("heroRingFill");
  const linearBarEl = document.getElementById("heroLinearBar");
  const linearFillEl = document.getElementById("heroLinearFill");
  const toggleActionBtn = document.getElementById("heroTimerActionBtn");
  const switchStyleBtn = document.getElementById("heroSwitchStyleBtn");
  const presetChips = document.querySelectorAll(".widget-presets .preset-chip");
  const segmentedBtns = document.querySelectorAll(".widget-segmented .seg-btn");

  const modeViews = {
    timer: document.getElementById("widgetModeTimer"),
    pomodoro: document.getElementById("widgetModePomodoro"),
    limits: document.getElementById("widgetModeLimits"),
    insights: document.getElementById("widgetModeInsights"),
  };

  const RING_CIRCUMFERENCE = 452.39; // 2 * pi * 72

  function updateTimerDisplay() {
    const mins = Math.floor(timerRemaining / 60);
    const secs = timerRemaining % 60;
    const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (countdownDigitsEl) {
      countdownDigitsEl.textContent = timeStr;
    }

    // Update Ring progress
    if (ringFillEl) {
      const progress = Math.max(0, Math.min(1, timerRemaining / timerDuration));
      const offset = RING_CIRCUMFERENCE * (1 - progress);
      ringFillEl.style.strokeDashoffset = offset;
    }

    // Update Linear Bar progress
    if (linearFillEl) {
      const pct = Math.max(0, Math.min(100, (timerRemaining / timerDuration) * 100));
      linearFillEl.style.width = `${pct}%`;
    }
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    isTimerRunning = true;
    if (toggleActionBtn) {
      toggleActionBtn.textContent = "Stop Timer";
      toggleActionBtn.className = "widget-action-btn btn-stop";
    }

    timerInterval = setInterval(() => {
      if (timerRemaining > 0) {
        timerRemaining--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        isTimerRunning = false;
        if (toggleActionBtn) {
          toggleActionBtn.textContent = "Start Timer";
          toggleActionBtn.className = "widget-action-btn btn-start";
        }
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    isTimerRunning = false;
    if (toggleActionBtn) {
      toggleActionBtn.textContent = "Resume Timer";
      toggleActionBtn.className = "widget-action-btn btn-start";
    }
  }

  if (toggleActionBtn) {
    toggleActionBtn.addEventListener("click", () => {
      if (isTimerRunning) {
        stopTimer();
      } else {
        startTimer();
      }
    });
  }

  // Presets click
  presetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      presetChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const mins = parseInt(chip.dataset.mins || "25", 10);
      timerDuration = mins * 60;
      timerRemaining = timerDuration;
      updateTimerDisplay();
      startTimer();
    });
  });

  // Switch Style Button (Ring -> Bar -> Minimal)
  if (switchStyleBtn) {
    switchStyleBtn.addEventListener("click", () => {
      const nextIdx = (STYLES.indexOf(activeStyle) + 1) % STYLES.length;
      activeStyle = STYLES[nextIdx];
      applyWidgetStyle(activeStyle);
    });
  }

  function applyWidgetStyle(style) {
    const ringWrapper = document.getElementById("heroRingWrapper");
    if (!ringWrapper) return;

    if (style === "ring") {
      ringWrapper.style.display = "flex";
      if (linearBarEl) linearBarEl.style.display = "none";
      countdownDigitsEl.style.position = "absolute";
    } else if (style === "bar") {
      ringWrapper.style.display = "none";
      if (linearBarEl) linearBarEl.style.display = "block";
      countdownDigitsEl.style.position = "static";
      countdownDigitsEl.style.marginBottom = "14px";
    } else if (style === "minimal") {
      ringWrapper.style.display = "none";
      if (linearBarEl) linearBarEl.style.display = "none";
      countdownDigitsEl.style.position = "static";
      countdownDigitsEl.style.marginBottom = "8px";
    }
  }

  // Segmented Tabs Switcher
  segmentedBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      segmentedBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.dataset.tab;
      Object.keys(modeViews).forEach((key) => {
        if (modeViews[key]) {
          modeViews[key].style.display = key === target ? "block" : "none";
        }
      });
    });
  });

  // Initial timer tick
  updateTimerDisplay();
  startTimer();

  // -------------------------------------------------------------
  // 5. Mindful Break Modal Simulation
  // -------------------------------------------------------------
  const triggerSimBtn = document.getElementById("triggerBreakSimBtn");
  const modalOverlay = document.getElementById("breakModalOverlay");
  const modalCloseBtns = document.querySelectorAll(".js-close-modal");

  if (triggerSimBtn && modalOverlay) {
    triggerSimBtn.addEventListener("click", () => {
      modalOverlay.classList.add("is-active");
    });

    modalCloseBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        modalOverlay.classList.remove("is-active");
      });
    });

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove("is-active");
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains("is-active")) {
        modalOverlay.classList.remove("is-active");
      }
    });
  }

  // -------------------------------------------------------------
  // 6. Synthesized Harmonic Tibetan Chime via Web Audio API
  // -------------------------------------------------------------
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

  function playBellNote(ctx, freq, startTime, duration = 3.2, gainPeak = 0.08) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  const playChimeBtn = document.getElementById("playChimeBtn");
  const waveBars = document.querySelectorAll(".wave-bar");

  if (playChimeBtn) {
    playChimeBtn.addEventListener("click", () => {
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        // Animate Wave bars
        waveBars.forEach((bar) => bar.classList.add("playing"));
        playChimeBtn.disabled = true;
        playChimeBtn.textContent = "Playing Chime...";

        // Chord 1 (0.0s)
        playBellNote(ctx, 523.25, now, 3.2, 0.08);
        playBellNote(ctx, 659.25, now + 0.05, 3.0, 0.05);

        // Chord 2 (3.2s)
        playBellNote(ctx, 587.33, now + 3.2, 3.2, 0.07);
        playBellNote(ctx, 783.99, now + 3.25, 3.0, 0.05);

        // Chord 3 (6.4s)
        playBellNote(ctx, 523.25, now + 6.4, 3.2, 0.06);
        playBellNote(ctx, 659.25, now + 6.45, 3.2, 0.05);
        playBellNote(ctx, 1046.50, now + 6.5, 2.8, 0.02);

        setTimeout(() => {
          waveBars.forEach((bar) => bar.classList.remove("playing"));
          playChimeBtn.disabled = false;
          playChimeBtn.textContent = "🔔 Play 10s Harmonic Bell";
        }, 9800);
      } catch (err) {
        console.warn("Unable to trigger Web Audio chime:", err);
      }
    });
  }

  // -------------------------------------------------------------
  // 7. 1-Click Clipboard Copy
  // -------------------------------------------------------------
  const copyBtn = document.getElementById("copyExtPathBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("chrome://extensions/").then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 1800);
      });
    });
  }
})();
