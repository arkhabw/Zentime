// landing.js - Interactive Controller for Zentime Showcase Landing Page
// 100% Vanilla JS, zero dependencies, high performance

(function () {
  "use strict";

  // -------------------------------------------------------------
  // 1. Welcome Entrance Sequence & Hero Choreography
  // -------------------------------------------------------------
  document.documentElement.classList.add("enter-ready");

  const heroSection = document.querySelector(".hero-section");
  const navbar = document.querySelector(".navbar");
  let scrollObserver = null;

  function enterElement(el) {
    if (!el || el.hasAttribute("data-entered")) return;
    el.setAttribute("data-entered", "true");
    if (el.classList && el.classList.contains("scroll-reveal")) {
      el.classList.add("is-revealed");
    }
  }

  function enterElementGroup(container) {
    if (!container) return;
    enterElement(container);
    const enterItems = container.querySelectorAll("[data-enter]");
    enterItems.forEach((item, idx) => {
      if (!item.style.getPropertyValue("--enter-i")) {
        item.style.setProperty("--enter-i", idx);
      }
      enterElement(item);
    });
    const nestedReveals = container.querySelectorAll(".scroll-reveal");
    nestedReveals.forEach((r) => r.classList.add("is-revealed"));
  }

  function resetElement(el) {
    if (!el || !el.hasAttribute("data-entered")) return;
    // Instant reset off-screen without backwards transition lag
    el.style.transition = "none";
    el.removeAttribute("data-entered");
    if (el.classList && el.classList.contains("scroll-reveal")) {
      el.classList.remove("is-revealed");
    }
    void el.offsetHeight;
    el.style.transition = "";
  }

  function resetElementGroup(container) {
    if (!container) return;
    resetElement(container);
    const enterItems = container.querySelectorAll("[data-enter]");
    enterItems.forEach((item) => {
      resetElement(item);
    });
    const nestedReveals = container.querySelectorAll(".scroll-reveal");
    nestedReveals.forEach((r) => r.classList.remove("is-revealed"));
  }

  function revealHeroAndNav() {
    if (navbar) {
      enterElement(navbar);
    }
    if (heroSection) {
      enterElementGroup(heroSection);
    }
    if (scrollObserver) {
      const heroTargets = document.querySelectorAll(".hero-content, .widget-container");
      heroTargets.forEach((el) => scrollObserver.observe(el));
    }
  }

  const welcomeOverlay = document.getElementById("welcomeOverlay");
  if (welcomeOverlay) {
    let dismissed = false;
    const dismissWelcome = () => {
      if (dismissed) return;
      dismissed = true;
      welcomeOverlay.classList.add("is-hidden");
      revealHeroAndNav();
      setTimeout(() => {
        welcomeOverlay.remove();
      }, 750);
    };

    // Auto-dismiss after mindful reveal choreography (2.2s)
    const welcomeTimer = setTimeout(dismissWelcome, 2200);

    // Allow instant dismiss on click or key press
    welcomeOverlay.addEventListener("click", () => {
      clearTimeout(welcomeTimer);
      dismissWelcome();
    });
    window.addEventListener("keydown", () => {
      clearTimeout(welcomeTimer);
      dismissWelcome();
    }, { once: true });
  } else {
    // If no welcome overlay present, reveal immediately
    revealHeroAndNav();
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
      const sunIcon = themeToggleBtn.querySelector(".theme-icon-sun");
      const moonIcon = themeToggleBtn.querySelector(".theme-icon-moon");
      if (sunIcon && moonIcon) {
        if (theme === "dark") {
          sunIcon.style.display = "block";
          moonIcon.style.display = "none";
        } else {
          sunIcon.style.display = "none";
          moonIcon.style.display = "block";
        }
      }
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
  // 3. Taste-Skill Dynamic Stagger Scroll Engine (Bi-directional)
  // -------------------------------------------------------------
  if ("IntersectionObserver" in window) {
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          enterElementGroup(entry.target);
        } else {
          resetElementGroup(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.08
    });

    // Observe section headers, cards, tables, step cards, and footer
    const observeTargets = document.querySelectorAll(
      ".section-header, .bento-card, .step-card, .privacy-table-card, .footer, .scroll-reveal"
    );
    observeTargets.forEach((el) => scrollObserver.observe(el));

    // If welcome overlay has already dismissed or is not present, observe hero targets too
    if (!welcomeOverlay) {
      const heroTargets = document.querySelectorAll(".hero-content, .widget-container");
      heroTargets.forEach((el) => scrollObserver.observe(el));
    }
  } else {
    document.querySelectorAll("[data-enter]").forEach((el) => el.setAttribute("data-entered", "true"));
    document.querySelectorAll(".scroll-reveal").forEach((el) => el.classList.add("is-revealed"));
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
  const heroTimerCard = document.getElementById("heroTimerCard");
  const heroRingSvg = document.getElementById("heroRingSvg");

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

    if (heroTimerCard) {
      heroTimerCard.setAttribute("data-timer-style", style);
    }

    if (style === "ring") {
      if (heroRingSvg) heroRingSvg.style.display = "block";
      if (linearBarEl) linearBarEl.style.display = "none";
      ringWrapper.style.display = "flex";
      ringWrapper.style.width = "150px";
      ringWrapper.style.height = "150px";
      ringWrapper.style.margin = "4px auto 10px";
      if (countdownDigitsEl) {
        countdownDigitsEl.style.position = "relative";
        countdownDigitsEl.style.fontSize = "36px";
        countdownDigitsEl.style.marginBottom = "0";
      }
    } else if (style === "bar") {
      if (heroRingSvg) heroRingSvg.style.display = "none";
      if (linearBarEl) linearBarEl.style.display = "block";
      ringWrapper.style.display = "block";
      ringWrapper.style.width = "100%";
      ringWrapper.style.height = "auto";
      ringWrapper.style.margin = "6px 0 0";
      if (countdownDigitsEl) {
        countdownDigitsEl.style.position = "static";
        countdownDigitsEl.style.fontSize = "42px";
        countdownDigitsEl.style.marginBottom = "6px";
      }
    } else if (style === "minimal") {
      if (heroRingSvg) heroRingSvg.style.display = "none";
      if (linearBarEl) linearBarEl.style.display = "none";
      ringWrapper.style.display = "block";
      ringWrapper.style.width = "100%";
      ringWrapper.style.height = "auto";
      ringWrapper.style.margin = "10px 0 6px";
      if (countdownDigitsEl) {
        countdownDigitsEl.style.position = "static";
        countdownDigitsEl.style.fontSize = "48px";
        countdownDigitsEl.style.marginBottom = "6px";
      }
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

  // -------------------------------------------------------------
  // 4B. Interactive Simulator Mode 4: 7-Day Insights Drilldown
  // -------------------------------------------------------------
  const DUMMY_INSIGHTS = {
    all: {
      label: "TOTAL THIS WEEK",
      total: "5h 39m",
      sub: "Total active browser screen time",
      title: "Top Sites This Week",
      sites: [
        { domain: "www.google.com", time: "2h 40m", pct: 47, color: "#4285F4", icon: "G" },
        { domain: "www.netflix.com", time: "1h 15m", pct: 22, color: "#E50914", icon: "N" },
        { domain: "www.youtube.com", time: "55m", pct: 16, color: "#FF0000", icon: "▶" },
        { domain: "github.com", time: "35m", pct: 10, color: "#24292F", icon: "GH" },
        { domain: "chatgpt.com", time: "14m", pct: 5, color: "#10A37F", icon: "AI" }
      ]
    },
    days: [
      {
        id: "tue",
        name: "Tue",
        height: 15,
        total: "15m",
        sites: [
          { domain: "github.com", time: "15m", pct: 100, color: "#24292F", icon: "GH" }
        ]
      },
      {
        id: "wed",
        name: "Wed",
        height: 25,
        total: "25m",
        sites: [
          { domain: "www.google.com", time: "15m", pct: 60, color: "#4285F4", icon: "G" },
          { domain: "github.com", time: "10m", pct: 40, color: "#24292F", icon: "GH" }
        ]
      },
      {
        id: "thu",
        name: "Thu",
        height: 20,
        total: "20m",
        sites: [
          { domain: "github.com", time: "20m", pct: 100, color: "#24292F", icon: "GH" }
        ]
      },
      {
        id: "fri",
        name: "Fri",
        height: 52,
        total: "1h 10m",
        sites: [
          { domain: "github.com", time: "45m", pct: 64, color: "#24292F", icon: "GH" },
          { domain: "www.google.com", time: "25m", pct: 36, color: "#4285F4", icon: "G" }
        ]
      },
      {
        id: "sat",
        name: "Sat",
        height: 32,
        total: "35m",
        sites: [
          { domain: "www.youtube.com", time: "25m", pct: 71, color: "#FF0000", icon: "▶" },
          { domain: "www.netflix.com", time: "10m", pct: 29, color: "#E50914", icon: "N" }
        ]
      },
      {
        id: "sun",
        name: "Sun",
        height: 20,
        total: "20m",
        sites: [
          { domain: "chatgpt.com", time: "15m", pct: 75, color: "#10A37F", icon: "AI" },
          { domain: "www.google.com", time: "5m", pct: 25, color: "#4285F4", icon: "G" }
        ]
      },
      {
        id: "mon",
        name: "Mon",
        height: 95,
        total: "3h 40m",
        isPeak: true,
        sites: [
          { domain: "www.netflix.com", time: "1h 45m", pct: 48, color: "#E50914", icon: "N" },
          { domain: "www.google.com", time: "1h 05m", pct: 30, color: "#4285F4", icon: "G" },
          { domain: "www.youtube.com", time: "50m", pct: 22, color: "#FF0000", icon: "▶" }
        ]
      }
    ]
  };

  const simChartBarsEl = document.getElementById("simChartBars");
  const simSitesListEl = document.getElementById("simSitesList");
  const simTotalLabelEl = document.getElementById("simTotalLabel");
  const simTotalValEl = document.getElementById("simTotalVal");
  const simTotalSubEl = document.getElementById("simTotalSub");
  const simSitesTitleEl = document.getElementById("simSitesTitle");
  const simSitesCountEl = document.getElementById("simSitesCount");
  const simResetWeekBtn = document.getElementById("simResetWeekBtn");

  let selectedDayId = null;

  function renderSimSites(sites) {
    if (!simSitesListEl) return;
    simSitesListEl.innerHTML = "";
    sites.forEach((site) => {
      const li = document.createElement("li");
      li.className = "sim-site-item";
      li.innerHTML = `
        <div class="sim-site-info">
          <div class="sim-site-left">
            <span class="sim-site-badge" style="background: ${site.color};">${site.icon}</span>
            <span class="sim-site-domain">${site.domain}</span>
          </div>
          <div class="sim-site-meta">
            <span class="sim-site-time">${site.time}</span>
            <span class="sim-site-pct">${site.pct}%</span>
          </div>
        </div>
        <div class="sim-site-track">
          <div class="sim-site-fill" style="width: ${site.pct}%;"></div>
        </div>
      `;
      simSitesListEl.appendChild(li);
    });
  }

  function renderSimInsights() {
    if (!simChartBarsEl) return;
    simChartBarsEl.innerHTML = "";

    const isFiltered = Boolean(selectedDayId);
    if (isFiltered) {
      simChartBarsEl.classList.add("has-selection");
      if (simResetWeekBtn) simResetWeekBtn.classList.add("is-filtered");
    } else {
      simChartBarsEl.classList.remove("has-selection");
      if (simResetWeekBtn) simResetWeekBtn.classList.remove("is-filtered");
    }

    DUMMY_INSIGHTS.days.forEach((day) => {
      const col = document.createElement("div");
      col.className = `sim-bar-col${day.isPeak ? " is-peak" : ""}${selectedDayId === day.id ? " selected" : ""}`;
      col.setAttribute("title", `${day.name}: ${day.total} (Click to filter)`);
      col.innerHTML = `
        <div class="sim-bar-track">
          <div class="sim-bar-fill" style="height: ${day.height}%;"></div>
        </div>
        <span class="sim-bar-day">${day.name}</span>
      `;

      col.addEventListener("click", () => {
        if (selectedDayId === day.id) {
          selectedDayId = null;
        } else {
          selectedDayId = day.id;
        }
        applySimSelection();
      });

      simChartBarsEl.appendChild(col);
    });
  }

  function applySimSelection() {
    if (selectedDayId) {
      const dayData = DUMMY_INSIGHTS.days.find((d) => d.id === selectedDayId);
      if (dayData) {
        if (simTotalLabelEl) simTotalLabelEl.textContent = `TOTAL FOR ${dayData.name.toUpperCase()}`;
        if (simTotalValEl) simTotalValEl.textContent = dayData.total;
        if (simTotalSubEl) simTotalSubEl.textContent = `Daily usage breakdown for ${dayData.name}`;
        if (simSitesTitleEl) simSitesTitleEl.textContent = `Top Sites for ${dayData.name}`;
        if (simSitesCountEl) simSitesCountEl.textContent = dayData.sites.length;
        renderSimSites(dayData.sites);
      }
    } else {
      const allData = DUMMY_INSIGHTS.all;
      if (simTotalLabelEl) simTotalLabelEl.textContent = allData.label;
      if (simTotalValEl) simTotalValEl.textContent = allData.total;
      if (simTotalSubEl) simTotalSubEl.textContent = allData.sub;
      if (simSitesTitleEl) simSitesTitleEl.textContent = allData.title;
      if (simSitesCountEl) simSitesCountEl.textContent = allData.sites.length;
      renderSimSites(allData.sites);
    }
    renderSimInsights();
  }

  if (simResetWeekBtn) {
    simResetWeekBtn.addEventListener("click", () => {
      selectedDayId = null;
      applySimSelection();
    });
  }

  // Initial render of Insights
  applySimSelection();

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
