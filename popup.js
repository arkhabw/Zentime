// popup.js - Controller Ekstensi Zentime (Anti-Slop Craftsmanship & i18n Support)

let currentDomain = "";
let countdownInterval = null;
let otherTimersInterval = null;
let currentLang = "id";

// -------------------------------------------------------------
// Kamus Bahasa (i18n Dictionary)
// -------------------------------------------------------------
const I18N = {
  id: {
    brandSubtitle: "Fokus",
    detectingTab: "Mendeteksi tab...",
    unsupportedWarning: "Timer hanya aktif pada alamat web reguler (http/https).",
    tabManual: "Timer",
    tabPomodoro: "Pomodoro",
    tabAuto: "Batas Harian",
    pomoCycleReady: "Siklus 1 dari 4",
    pomoScheduleTitle: "Jadwal Sesi",
    pomoLongBreakNote: "Istirahat panjang 15 menit otomatis setelah 4 siklus.",
    startPomo: "Mulai Sesi Pomodoro",
    stopPomo: "Hentikan",
    pomoSkipPhase: "Lewati ke Istirahat",
    pomoSkipBreak: "Lewati Istirahat & Fokus",
    pomoFocusPhase: "🍅 Sesi Fokus",
    pomoBreakPhase: "☕ Istirahat Santai",
    pomoFocusWord: "Fokus",
    pomoBreakWord: "Istirahat",
    cycleLabel: "Siklus",
    ofWord: "dari",
    customDuration: "Durasi kustom",
    minutesUnit: "menit",
    startTimer: "Mulai Timer",
    stopTimer: "Hentikan Timer",
    targetFinished: "Target selesai:",
    otherWebsites: "Website Lain yang Berjalan",
    todayUsage: "Penggunaan Hari Ini",
    statusSafe: "Aman",
    statusWarning: "Hampir Habis",
    statusDanger: "Batas Tercapai",
    remainingTime: "tersisa",
    limitReachedText: "(Batas tercapai)",
    editLimit: "Ubah Batas",
    deleteLimit: "Hapus",
    dailyLimitTitle: "Batas Harian Situs Ini",
    dailyLimitDesc: "Otomatis jeda saat beralih ke tab atau jendela lain.",
    maxPerDay: "Batas harian",
    setLimitBtn: "Pasang Batas Harian",
    monitoredListTitle: "Daftar Batas Website",
    emptyLimitsMain: "Belum ada website yang dibatasi.",
    emptyLimitsSub: "Atur batas waktu untuk membatasi media sosial dan situs yang memicu distraksi.",
    noActiveTab: "Tidak ada tab aktif",
    internalPage: "Halaman internal browser",
    unsupportedPage: "Halaman tidak didukung",
    timeSec: "d",
    timeMin: "m",
    langAria: "Pilihan bahasa",
    themeAria: "Ganti mode tema",
    stepMinusAria: "Kurang 5 menit",
    stepPlusAria: "Tambah 5 menit",
    langSliderTitle: "Ganti Bahasa (ID / EN)",
  },
  en: {
    brandSubtitle: "Focus",
    detectingTab: "Detecting active tab...",
    unsupportedWarning: "Timer only works on standard websites (http/https).",
    tabManual: "Timer",
    tabPomodoro: "Pomodoro",
    tabAuto: "Daily Limits",
    pomoCycleReady: "Cycle 1 of 4",
    pomoScheduleTitle: "Session Schedule",
    pomoLongBreakNote: "15-minute long break automatically after 4 cycles.",
    startPomo: "Start Pomodoro",
    stopPomo: "Cancel",
    pomoSkipPhase: "Skip to Break",
    pomoSkipBreak: "Skip Break & Focus",
    pomoFocusPhase: "🍅 Focus Session",
    pomoBreakPhase: "☕ Mindful Break",
    pomoFocusWord: "Focus",
    pomoBreakWord: "Break",
    cycleLabel: "Cycle",
    ofWord: "of",
    customDuration: "Custom duration",
    minutesUnit: "minutes",
    startTimer: "Start Timer",
    stopTimer: "Stop Timer",
    targetFinished: "Target completion:",
    otherWebsites: "Other Active Websites",
    todayUsage: "Today's Screen Time",
    statusSafe: "Safe",
    statusWarning: "Near Limit",
    statusDanger: "Limit Reached",
    remainingTime: "remaining",
    limitReachedText: "(Limit reached)",
    editLimit: "Edit Limit",
    deleteLimit: "Delete",
    dailyLimitTitle: "Daily Limit for This Site",
    dailyLimitDesc: "Automatically pauses when you switch tabs or windows.",
    maxPerDay: "Daily quota",
    setLimitBtn: "Set Daily Limit",
    monitoredListTitle: "Monitored Websites",
    emptyLimitsMain: "No websites monitored yet.",
    emptyLimitsSub: "Set daily time limits to curb distracting websites.",
    noActiveTab: "No active tab",
    internalPage: "Internal browser page",
    unsupportedPage: "Unsupported page",
    timeSec: "s",
    timeMin: "m",
    langAria: "Language selection",
    themeAria: "Toggle theme",
    stepMinusAria: "Decrease 5 minutes",
    stepPlusAria: "Increase 5 minutes",
    langSliderTitle: "Switch Language (ID / EN)",
  },
};

function t(key) {
  return I18N[currentLang]?.[key] || I18N.id[key] || key;
}

// Helper: Format tanggal hari ini (YYYY-MM-DD)
function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format menit dan detik yang konsisten
function formatMinutesSeconds(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const minUnit = t("timeMin");
  const secUnit = t("timeSec");

  if (mins === 0) return `${secs}${secUnit}`;
  if (secs === 0) return `${mins}${minUnit}`;
  return `${mins}${minUnit} ${secs}${secUnit}`;
}

// -------------------------------------------------------------
// DOM Elements
// -------------------------------------------------------------
const langSlider = document.getElementById("langSlider");
const langBtnId = document.getElementById("langBtnId");
const langBtnEn = document.getElementById("langBtnEn");

const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIconDark = document.getElementById("themeIconDark");
const themeIconLight = document.getElementById("themeIconLight");

const siteFavicon = document.getElementById("siteFavicon");
const currentDomainEl = document.getElementById("currentDomain");
const unsupportedWarning = document.getElementById("unsupportedWarning");

const tabManualBtn = document.getElementById("tabManualBtn");
const tabPomoBtn = document.getElementById("tabPomoBtn");
const tabAutoBtn = document.getElementById("tabAutoBtn");
const tabManualPane = document.getElementById("tab-manual");
const tabPomoPane = document.getElementById("tab-pomodoro");
const tabAutoPane = document.getElementById("tab-auto");

// Mode 1 Elements
const setupView = document.getElementById("setupView");
const activeView = document.getElementById("activeView");
const presetButtons = document.querySelectorAll("#setupView .preset-btn");
const customMinutesInput = document.getElementById("customMinutes");
const stepMinusBtn = document.getElementById("stepMinusBtn");
const stepPlusBtn = document.getElementById("stepPlusBtn");
const startTimerBtn = document.getElementById("startTimerBtn");
const cancelTimerBtn = document.getElementById("cancelTimerBtn");

const countdownDisplay = document.getElementById("countdownDisplay");
const timerFillBar = document.getElementById("timerFillBar");
const finishTimeText = document.getElementById("finishTimeText");

const otherTimersSection = document.getElementById("otherTimersSection");
const otherTimersCount = document.getElementById("otherTimersCount");
const otherTimersList = document.getElementById("otherTimersList");

// Mode Pomodoro Elements
const pomoSetupView = document.getElementById("pomoSetupView");
const pomoActiveView = document.getElementById("pomoActiveView");
const pomoCycleLbl = document.getElementById("pomoCycleLbl");
const pomoPresetBtns = document.querySelectorAll(".pomo-presets .preset-btn");
const pomoScheduleText = document.getElementById("pomoScheduleText");
const startPomoBtn = document.getElementById("startPomoBtn");
const pomoPhaseBadge = document.getElementById("pomoPhaseBadge");
const pomoActiveCycleText = document.getElementById("pomoActiveCycleText");
const pomoCountdownDisplay = document.getElementById("pomoCountdownDisplay");
const pomoTimerFillBar = document.getElementById("pomoTimerFillBar");
const pomoTargetText = document.getElementById("pomoTargetText");
const skipPomoPhaseBtn = document.getElementById("skipPomoPhaseBtn");
const cancelPomoBtn = document.getElementById("cancelPomoBtn");

// Mode 2 Elements
const siteLimitActiveBox = document.getElementById("siteLimitActiveBox");
const siteLimitFormBox = document.getElementById("siteLimitFormBox");
const limitStatusBadge = document.getElementById("limitStatusBadge");
const limitUsageText = document.getElementById("limitUsageText");
const limitMaxText = document.getElementById("limitMaxText");
const limitRemainingText = document.getElementById("limitRemainingText");
const limitProgressBar = document.getElementById("limitProgressBar");
const editCurrentLimitBtn = document.getElementById("editCurrentLimitBtn");
const deleteCurrentLimitBtn = document.getElementById("deleteCurrentLimitBtn");

const autoChips = document.querySelectorAll("#autoChips .preset-btn");
const autoMinutesInput = document.getElementById("autoMinutesInput");
const saveAutoLimitBtn = document.getElementById("saveAutoLimitBtn");

const allLimitsList = document.getElementById("allLimitsList");
const allLimitsCount = document.getElementById("allLimitsCount");
const emptyLimitsMsg = document.getElementById("emptyLimitsMsg");

// -------------------------------------------------------------
// Inisialisasi
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await initLanguage();
  initTheme();
  setupTabs();
  setupPresets();
  setupPomoControls();
  setupAutoModeControls();

  await detectCurrentSite();
  await refreshUI();

  // Update realtime tampilan batas harian dan pomodoro selama popup sedang dibuka
  setInterval(async () => {
    const data = await chrome.storage.local.get(["dailyUsage", "autoLimits"]);
    renderMode2(data.autoLimits || {}, data.dailyUsage || {});
    await renderPomodoro();
  }, 1000);

  startTimerBtn.addEventListener("click", handleStartTimer);
  cancelTimerBtn.addEventListener("click", handleCancelTimer);
});

// -------------------------------------------------------------
// 1. Language Slider & Localization (i18n)
// -------------------------------------------------------------
async function initLanguage() {
  const data = await chrome.storage.local.get("preferredLanguage");
  if (data.preferredLanguage) {
    currentLang = data.preferredLanguage;
  } else {
    currentLang = navigator.language && navigator.language.startsWith("id") ? "id" : "en";
  }

  applyLanguage(currentLang, false);

  langBtnId.addEventListener("click", (e) => {
    e.stopPropagation();
    setLanguage("id");
  });

  langBtnEn.addEventListener("click", (e) => {
    e.stopPropagation();
    setLanguage("en");
  });

  // Clicking anywhere on slider toggles language
  langSlider.addEventListener("click", () => {
    const nextLang = currentLang === "id" ? "en" : "id";
    setLanguage(nextLang);
  });
}

function setLanguage(lang) {
  if (currentLang === lang) return;
  currentLang = lang;
  chrome.storage.local.set({ preferredLanguage: lang });
  applyLanguage(lang, true);
}

function applyLanguage(lang, shouldRefresh = true) {
  document.documentElement.setAttribute("lang", lang);

  // Update slider thumb & active states
  if (langSlider) {
    langSlider.setAttribute("data-current", lang);
    langSlider.setAttribute("title", t("langSliderTitle"));
  }
  if (langBtnId) {
    const isId = lang === "id";
    langBtnId.classList.toggle("active", isId);
    langBtnId.setAttribute("aria-checked", isId ? "true" : "false");
  }
  if (langBtnEn) {
    const isEn = lang === "en";
    langBtnEn.classList.toggle("active", isEn);
    langBtnEn.setAttribute("aria-checked", isEn ? "true" : "false");
  }

  // Update all static i18n text nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && I18N[lang]?.[key]) {
      el.textContent = I18N[lang][key];
    }
  });

  // Update aria-labels
  if (themeToggleBtn) themeToggleBtn.setAttribute("aria-label", t("themeAria"));
  if (stepMinusBtn) stepMinusBtn.setAttribute("aria-label", t("stepMinusAria"));
  if (stepPlusBtn) stepPlusBtn.setAttribute("aria-label", t("stepPlusAria"));

  if (shouldRefresh) {
    detectCurrentSite();
    refreshUI();
  }
}

// -------------------------------------------------------------
// 2. Theme Management (Matte Light & Dark)
// -------------------------------------------------------------
function initTheme() {
  chrome.storage.local.get("preferredTheme", (data) => {
    let theme = data.preferredTheme;
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    applyTheme(theme);
  });

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    chrome.storage.local.set({ preferredTheme: nextTheme });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (theme === "dark") {
    themeIconDark.classList.add("hidden");
    themeIconLight.classList.remove("hidden");
  } else {
    themeIconDark.classList.remove("hidden");
    themeIconLight.classList.add("hidden");
  }
}

// -------------------------------------------------------------
// 3. Navigasi Tab (Apple Segmented Control 3 Tab)
// -------------------------------------------------------------
function setupTabs() {
  chrome.storage.local.get("activePopupTab", (data) => {
    if (data.activePopupTab) {
      switchTab(data.activePopupTab);
    }
  });

  tabManualBtn.addEventListener("click", () => {
    switchTab("tab-manual");
    chrome.storage.local.set({ activePopupTab: "tab-manual" });
  });

  tabPomoBtn.addEventListener("click", () => {
    switchTab("tab-pomodoro");
    chrome.storage.local.set({ activePopupTab: "tab-pomodoro" });
  });

  tabAutoBtn.addEventListener("click", () => {
    switchTab("tab-auto");
    chrome.storage.local.set({ activePopupTab: "tab-auto" });
  });
}

function switchTab(tabId) {
  const isManual = tabId === "tab-manual";
  const isPomo = tabId === "tab-pomodoro";
  const isAuto = tabId === "tab-auto";

  tabManualBtn.classList.toggle("active", isManual);
  tabManualBtn.setAttribute("aria-selected", isManual ? "true" : "false");
  tabManualPane.classList.toggle("active", isManual);
  tabManualPane.classList.toggle("hidden", !isManual);

  tabPomoBtn.classList.toggle("active", isPomo);
  tabPomoBtn.setAttribute("aria-selected", isPomo ? "true" : "false");
  tabPomoPane.classList.toggle("active", isPomo);
  tabPomoPane.classList.toggle("hidden", !isPomo);

  tabAutoBtn.classList.toggle("active", isAuto);
  tabAutoBtn.setAttribute("aria-selected", isAuto ? "true" : "false");
  tabAutoPane.classList.toggle("active", isAuto);
  tabAutoPane.classList.toggle("hidden", !isAuto);
}

// -------------------------------------------------------------
// 4. Preset Durasi & Stepper (Mode 1)
// -------------------------------------------------------------
function setupPresets() {
  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      presetButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      customMinutesInput.value = btn.getAttribute("data-mins");
    });
  });

  customMinutesInput.addEventListener("input", () => {
    const val = customMinutesInput.value;
    presetButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-mins") === val);
    });
  });

  stepMinusBtn.addEventListener("click", () => {
    let current = parseInt(customMinutesInput.value, 10) || 25;
    current = Math.max(1, current - 5);
    customMinutesInput.value = current;
    syncPresetActiveState(current);
  });

  stepPlusBtn.addEventListener("click", () => {
    let current = parseInt(customMinutesInput.value, 10) || 25;
    current = Math.min(720, current + 5);
    customMinutesInput.value = current;
    syncPresetActiveState(current);
  });
}

function syncPresetActiveState(mins) {
  const strMins = String(mins);
  presetButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-mins") === strMins);
  });
}

// -------------------------------------------------------------
// 5. Setup Mode 2 Controls
// -------------------------------------------------------------
function setupAutoModeControls() {
  autoChips.forEach((btn) => {
    btn.addEventListener("click", () => {
      autoChips.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      autoMinutesInput.value = btn.getAttribute("data-mins");
    });
  });

  autoMinutesInput.addEventListener("input", () => {
    const val = autoMinutesInput.value;
    autoChips.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-mins") === val);
    });
  });

  saveAutoLimitBtn.addEventListener("click", handleSaveAutoLimit);
  editCurrentLimitBtn.addEventListener("click", () => {
    siteLimitFormBox.classList.remove("hidden");
    siteLimitActiveBox.classList.add("hidden");
    autoMinutesInput.focus();
    autoMinutesInput.select();
  });
  deleteCurrentLimitBtn.addEventListener("click", handleDeleteCurrentLimit);
}

// -------------------------------------------------------------
// 6. Deteksi Website Aktif
// -------------------------------------------------------------
async function detectCurrentSite() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      setUnsupported(t("noActiveTab"));
      return;
    }

    const url = new URL(tab.url);

    // Deteksi jika tab saat ini sedang membuka halaman istirahat blocked.html
    if (url.protocol === "chrome-extension:" && url.pathname.includes("blocked.html")) {
      const domParam = url.searchParams.get("domain");
      if (domParam) {
        currentDomain = domParam;
        currentDomainEl.textContent = currentDomain;
        unsupportedWarning.classList.add("hidden");

        siteFavicon.src = `https://www.google.com/s2/favicons?domain=${currentDomain}&sz=32`;
        siteFavicon.onerror = () => {
          siteFavicon.src = "icons/icon48.png";
        };

        startTimerBtn.disabled = false;
        startPomoBtn.disabled = false;
        saveAutoLimitBtn.disabled = false;
        return;
      }
    }

    if (!url.protocol.startsWith("http")) {
      setUnsupported(t("internalPage"));
      return;
    }

    currentDomain = url.hostname;
    currentDomainEl.textContent = currentDomain;
    unsupportedWarning.classList.add("hidden");

    siteFavicon.src = `https://www.google.com/s2/favicons?domain=${currentDomain}&sz=32`;
    siteFavicon.onerror = () => {
      siteFavicon.src = "icons/icon48.png";
    };

    startTimerBtn.disabled = false;
    startPomoBtn.disabled = false;
    saveAutoLimitBtn.disabled = false;
  } catch {
    setUnsupported(t("unsupportedPage"));
  }
}

function setUnsupported(label) {
  currentDomain = "";
  currentDomainEl.textContent = label;
  siteFavicon.src = "icons/icon48.png";
  unsupportedWarning.classList.remove("hidden");
  startTimerBtn.disabled = true;
  startPomoBtn.disabled = true;
  saveAutoLimitBtn.disabled = true;
}

// -------------------------------------------------------------
// 7. Refresh UI
// -------------------------------------------------------------
async function refreshUI() {
  clearInterval(countdownInterval);
  clearInterval(otherTimersInterval);

  const data = await chrome.storage.local.get([
    "manualTimers",
    "autoLimits",
    "dailyUsage",
  ]);

  const manualTimers = data.manualTimers || {};
  const autoLimits = data.autoLimits || {};
  const dailyUsage = data.dailyUsage || {};

  renderMode1(manualTimers);
  await renderPomodoro();
  renderMode2(autoLimits, dailyUsage);
}

// -------------------------------------------------------------
// 8. Render Mode 1 (Timer Aktif)
// -------------------------------------------------------------
function renderMode1(manualTimers) {
  const activeTimer = currentDomain ? manualTimers[currentDomain] : null;

  if (activeTimer && activeTimer.endTime > Date.now()) {
    showActiveCountdownView(activeTimer);
  } else {
    setupView.classList.remove("hidden");
    activeView.classList.add("hidden");
  }

  renderOtherTimers(manualTimers);
}

function showActiveCountdownView(timer) {
  setupView.classList.add("hidden");
  activeView.classList.remove("hidden");

  const finishDate = new Date(timer.endTime);
  const finishHours = String(finishDate.getHours()).padStart(2, "0");
  const finishMinutes = String(finishDate.getMinutes()).padStart(2, "0");
  finishTimeText.textContent = `${t("targetFinished")} ${finishHours}:${finishMinutes}`;

  const totalDurationMs = timer.endTime - timer.startTime;

  function updateCountdown() {
    const now = Date.now();
    const remainingMs = timer.endTime - now;

    if (remainingMs <= 0) {
      clearInterval(countdownInterval);
      countdownDisplay.textContent = "00:00";
      timerFillBar.style.width = "0%";
      refreshUI();
      return;
    }

    const totalSeconds = Math.floor(remainingMs / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    countdownDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    const fraction = Math.max(0, Math.min(1, remainingMs / totalDurationMs));
    const percent = fraction * 100;
    timerFillBar.style.width = `${percent}%`;

    if (percent <= 20) {
      timerFillBar.classList.add("danger");
    } else {
      timerFillBar.classList.remove("danger");
    }
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

async function handleStartTimer() {
  if (!currentDomain) return;

  const durationMinutes = parseInt(customMinutesInput.value, 10);
  if (isNaN(durationMinutes) || durationMinutes <= 0) {
    customMinutesInput.focus();
    customMinutesInput.select();
    return;
  }

  const now = Date.now();
  const endTime = now + durationMinutes * 60 * 1000;

  const { manualTimers = {} } = await chrome.storage.local.get("manualTimers");
  manualTimers[currentDomain] = {
    domain: currentDomain,
    durationMinutes: durationMinutes,
    startTime: now,
    endTime: endTime,
  };
  await chrome.storage.local.set({ manualTimers });

  await chrome.alarms.create(`timer_${currentDomain}`, { when: endTime });
  chrome.runtime.sendMessage({ type: "TIMER_UPDATED" });
  await refreshUI();
}

async function handleCancelTimer() {
  if (!currentDomain) return;

  const { manualTimers = {} } = await chrome.storage.local.get("manualTimers");
  delete manualTimers[currentDomain];
  await chrome.storage.local.set({ manualTimers });

  await chrome.alarms.clear(`timer_${currentDomain}`);
  chrome.runtime.sendMessage({ type: "TIMER_UPDATED" });
  await refreshUI();
}

function renderOtherTimers(manualTimers) {
  const otherKeys = Object.keys(manualTimers).filter(
    (domain) => domain !== currentDomain && manualTimers[domain].endTime > Date.now()
  );

  if (otherKeys.length === 0) {
    otherTimersSection.classList.add("hidden");
    return;
  }

  otherTimersSection.classList.remove("hidden");
  otherTimersCount.textContent = otherKeys.length;

  function updateOtherList() {
    otherTimersList.innerHTML = "";
    const now = Date.now();

    otherKeys.forEach((domain) => {
      const timer = manualTimers[domain];
      const remainingMs = timer.endTime - now;

      if (remainingMs > 0) {
        const totalSecs = Math.floor(remainingMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;

        const li = document.createElement("li");
        li.className = "timer-row";
        li.innerHTML = `
          <span class="timer-row-domain" title="${domain}">${domain}</span>
          <span class="timer-row-time">${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}</span>
        `;
        otherTimersList.appendChild(li);
      }
    });
  }

  updateOtherList();
  otherTimersInterval = setInterval(updateOtherList, 1000);
}

// -------------------------------------------------------------
// 8B. Mode Pomodoro Logic & Handlers
// -------------------------------------------------------------
let currentPomoPreset = { focus: 25, break: 5 };

function setupPomoControls() {
  pomoPresetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      pomoPresetBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const focus = parseInt(btn.getAttribute("data-focus"), 10);
      const brk = parseInt(btn.getAttribute("data-break"), 10);
      currentPomoPreset = { focus, break: brk };
      pomoScheduleText.textContent = `${focus}m ${t("pomoFocusWord")} • ${brk}m ${t("pomoBreakWord")}`;
    });
  });

  startPomoBtn.addEventListener("click", handleStartPomo);
  skipPomoPhaseBtn.addEventListener("click", handleSkipPomoPhase);
  cancelPomoBtn.addEventListener("click", handleCancelPomo);
}

async function renderPomodoro() {
  if (!currentDomain) return;
  const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
  const session = pomodoroSessions[currentDomain];

  if (!session || session.phase === "idle" || session.phase === "break_ended") {
    pomoSetupView.classList.remove("hidden");
    pomoActiveView.classList.add("hidden");

    const cycle = session ? session.cycle : 1;
    pomoCycleLbl.textContent = `${t("cycleLabel")} ${cycle} ${t("ofWord")} 4`;
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`pomoDot${i}`);
      if (dot) {
        dot.classList.toggle("active", i === cycle);
        dot.classList.toggle("completed", i < cycle);
      }
    }
    return;
  }

  // Active Running View
  pomoSetupView.classList.add("hidden");
  pomoActiveView.classList.remove("hidden");

  const now = Date.now();
  const remainingMs = Math.max(0, session.endTime - now);
  const totalSecs = Math.floor(remainingMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  pomoCountdownDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  // Target end time
  const finishDate = new Date(session.endTime);
  const hours = String(finishDate.getHours()).padStart(2, "0");
  const minutes = String(finishDate.getMinutes()).padStart(2, "0");
  pomoTargetText.textContent = `${t("targetFinished")} ${hours}:${minutes}`;

  // Progress bar
  const totalDurationMs = (session.endTime - session.startTime) || 1;
  const elapsedMs = Math.max(0, now - session.startTime);
  const pct = Math.max(0, Math.min(100, (1 - elapsedMs / totalDurationMs) * 100));
  pomoTimerFillBar.style.width = `${pct}%`;

  pomoActiveCycleText.textContent = `${t("cycleLabel")} ${session.cycle}/4`;

  if (session.phase === "focus") {
    pomoPhaseBadge.className = "status-tag safe";
    pomoPhaseBadge.textContent = t("pomoFocusPhase");
    skipPomoPhaseBtn.textContent = t("pomoSkipPhase");
    pomoTimerFillBar.style.backgroundColor = "var(--fill-bar)";
  } else {
    pomoPhaseBadge.className = "status-tag warning";
    pomoPhaseBadge.textContent = t("pomoBreakPhase");
    skipPomoPhaseBtn.textContent = t("pomoSkipBreak");
    pomoTimerFillBar.style.backgroundColor = "var(--success-text)";
  }
}

async function handleStartPomo() {
  if (!currentDomain) return;
  startPomoBtn.disabled = true;

  let originalUrl = "";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.startsWith("http")) {
      originalUrl = tab.url;
    }
  } catch {
    // Abaikan
  }

  chrome.runtime.sendMessage({
    type: "START_POMODORO",
    domain: currentDomain,
    focusMinutes: currentPomoPreset.focus,
    breakMinutes: currentPomoPreset.break,
    longBreakMinutes: 15,
    cycle: 1,
    originalUrl,
  }, async () => {
    startPomoBtn.disabled = false;
    await refreshUI();
  });
}

async function handleSkipPomoPhase() {
  if (!currentDomain) return;
  skipPomoPhaseBtn.disabled = true;

  let originalUrl = "";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      if (tab.url.startsWith("http")) {
        originalUrl = tab.url;
      } else if (tab.url.includes("blocked.html")) {
        const parsed = new URL(tab.url);
        originalUrl = parsed.searchParams.get("originalUrl") || "";
      }
    }
  } catch {
    // Abaikan
  }

  chrome.runtime.sendMessage({
    type: "SKIP_POMODORO_PHASE",
    domain: currentDomain,
    originalUrl,
  }, async () => {
    skipPomoPhaseBtn.disabled = false;
    await refreshUI();
  });
}

async function handleCancelPomo() {
  if (!currentDomain) return;
  chrome.runtime.sendMessage({
    type: "CANCEL_POMODORO",
    domain: currentDomain,
  }, async () => {
    await refreshUI();
  });
}

// -------------------------------------------------------------
// 9. Render Mode 2 (Batas Harian)
// -------------------------------------------------------------
function renderMode2(autoLimits, dailyUsage) {
  const todayKey = getTodayKey();
  const currentLimit = currentDomain ? autoLimits[currentDomain] : null;

  if (currentLimit && currentLimit.enabled) {
    siteLimitFormBox.classList.add("hidden");
    siteLimitActiveBox.classList.remove("hidden");

    const spentSecs = dailyUsage[todayKey]?.[currentDomain]?.spentSeconds || 0;
    const limitSecs = currentLimit.dailyLimitMinutes * 60;
    const remainingSecs = Math.max(0, limitSecs - spentSecs);

    limitUsageText.textContent = formatMinutesSeconds(spentSecs);
    limitMaxText.textContent = `${currentLimit.dailyLimitMinutes}m`;

    if (remainingSecs <= 0) {
      limitRemainingText.textContent = t("limitReachedText");
      limitStatusBadge.className = "status-tag danger";
      limitStatusBadge.textContent = t("statusDanger");
      limitProgressBar.className = "limit-fill danger";
      limitProgressBar.style.width = "100%";
    } else {
      limitRemainingText.textContent = `(${formatMinutesSeconds(remainingSecs)} ${t("remainingTime")})`;

      const percent = Math.min(100, (spentSecs / limitSecs) * 100);
      limitProgressBar.style.width = `${percent}%`;

      if (percent >= 70) {
        limitStatusBadge.className = "status-tag warning";
        limitStatusBadge.textContent = t("statusWarning");
        limitProgressBar.className = "limit-fill warning";
      } else {
        limitStatusBadge.className = "status-tag safe";
        limitStatusBadge.textContent = t("statusSafe");
        limitProgressBar.className = "limit-fill";
      }
    }
  } else {
    siteLimitActiveBox.classList.add("hidden");
    siteLimitFormBox.classList.remove("hidden");
    if (currentDomain) {
      autoMinutesInput.value = "30";
    }
  }

  renderAllLimitsFeed(autoLimits, dailyUsage, todayKey);
}

function renderAllLimitsFeed(autoLimits, dailyUsage, todayKey) {
  const domains = Object.keys(autoLimits);
  allLimitsCount.textContent = domains.length;

  if (domains.length === 0) {
    emptyLimitsMsg.classList.remove("hidden");
    allLimitsList.innerHTML = "";
    return;
  }

  emptyLimitsMsg.classList.add("hidden");
  allLimitsList.innerHTML = "";

  domains.forEach((dom) => {
    const item = autoLimits[dom];
    const spentSecs = dailyUsage[todayKey]?.[dom]?.spentSeconds || 0;
    const limitSecs = item.dailyLimitMinutes * 60;
    const percent = Math.min(100, Math.round((spentSecs / limitSecs) * 100));

    let barClass = "limit-fill";
    if (percent >= 100) barClass += " danger";
    else if (percent >= 70) barClass += " warning";

    const li = document.createElement("li");
    li.className = "limit-feed-item";
    li.innerHTML = `
      <div class="feed-row-top">
        <span class="feed-domain" title="${dom}">${dom}</span>
        <button class="feed-del-btn" data-domain="${dom}" title="${t("deleteLimit")} ${dom}">${t("deleteLimit")}</button>
      </div>
      <div class="limit-track">
        <div class="${barClass}" style="width: ${percent}%;"></div>
      </div>
      <div class="feed-row-bottom">
        <span>${formatMinutesSeconds(spentSecs)} / ${item.dailyLimitMinutes}m</span>
        <span>${percent}%</span>
      </div>
    `;

    li.querySelector(".feed-del-btn").addEventListener("click", async (e) => {
      const domainToDelete = e.currentTarget.getAttribute("data-domain");
      await removeAutoLimit(domainToDelete);
    });

    allLimitsList.appendChild(li);
  });
}

async function handleSaveAutoLimit() {
  if (!currentDomain) return;

  const minutes = parseInt(autoMinutesInput.value, 10);
  if (isNaN(minutes) || minutes <= 0) {
    autoMinutesInput.focus();
    autoMinutesInput.select();
    return;
  }

  const { autoLimits = {} } = await chrome.storage.local.get("autoLimits");
  autoLimits[currentDomain] = {
    domain: currentDomain,
    dailyLimitMinutes: minutes,
    enabled: true,
  };

  await chrome.storage.local.set({ autoLimits });
  chrome.runtime.sendMessage({ type: "AUTO_LIMIT_UPDATED" });
  await refreshUI();
}

async function handleDeleteCurrentLimit() {
  if (!currentDomain) return;
  await removeAutoLimit(currentDomain);
}

async function removeAutoLimit(domain) {
  const { autoLimits = {} } = await chrome.storage.local.get("autoLimits");
  delete autoLimits[domain];
  await chrome.storage.local.set({ autoLimits });

  chrome.runtime.sendMessage({ type: "AUTO_LIMIT_UPDATED" });
  await refreshUI();
}
