// popup.js - Controller Ekstensi Zentime (Anti-Slop Craftsmanship & i18n Support)

let currentDomain = "";
let countdownInterval = null;
let otherTimersInterval = null;
let currentLang = "id";
let currentTimerStyle = "ring";

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
    tabAuto: "Batas",
    tabInsights: "Wawasan",
    totalThisWeek: "Total Minggu Ini",
    monitoredUsageOnly: "Total waktu aktif di browser",
    dailyAverage: "Rata-rata / Hari",
    mostActiveDay: "Hari Teraktif",
    last7DaysChart: "Aktivitas 7 Hari Terakhir",
    past7DaysBadge: "7 Hari",
    topSitesTitle: "Situs Teratas Minggu Ini",
    noDataThisWeekTitle: "Belum ada aktivitas minggu ini.",
    noDataThisWeekSub: "Waktu browsing kamu akan tercatat otomatis di sini seiring penggunaan browser.",
    shareOfWeek: "Porsi Mingguan",
    topSiteDay: "Situs Utama",
    totalForDay: "Total",
    activityForDay: "Aktivitas",
    backToWeekBtn: "← 7 Hari",
    noDataForDayTitle: "Tidak ada aktivitas pada hari ini.",
    noDataForDaySub: "Belum ada rekaman waktu browsing untuk hari ini.",
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"],
    perDaySuffix: " / hari",
    todayLabel: "Hari Ini",
    dayNames: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
    dayFullNames: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
    pomoCycleReady: "Siklus 1 dari 4",
    pomoScheduleTitle: "Jadwal Sesi",
    pomoLongBreakNote: "Istirahat panjang 15 menit otomatis setelah 4 siklus.",
    pomoCustomPreset: "Kustom",
    pomoFocusLbl: "Fokus",
    pomoBreakLbl: "Istirahat",
    pomoCyclesLbl: "Siklus",
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
    settingsTitle: "Pengaturan",
    settingsAria: "Pengaturan",
    timerStyleSection: "Gaya Tampilan Timer",
    timerStyleDesc: "Pilih visualisasi progres timer saat berjalan.",
    styleRing: "Lingkaran",
    styleBar: "Garis",
    styleMinimal: "Minimalis",
    toggleStyleTitle: "Ganti tampilan timer (Lingkaran / Garis / Minimal)",
    shortcutsSection: "Pintasan Keyboard",
    shortcutsDesc: "Jalankan fitur Zentime langsung dari tombol keyboard.",
    shortcutOpenPopup: "Buka Popup Zentime",
    shortcutQuickPomo: "Mulai Fokus 25m",
    shortcutQuickPause: "Jeda Sejenak (Breath)",
    customizeShortcutsBtn: "⚙️ Ubah Pintasan di Chrome",
    soundSection: "Suara & Audio",
    soundChimeTitle: "Lonceng Lembut 10 Detik",
    soundChimeDesc: "Mainkan audio harmonik saat sesi selesai.",
    offlineBadge: "100% Offline & Privat",
    aboutText: "Zentime tidak pernah mengumpulkan atau mengirimkan riwayat browsing kamu ke server mana pun.",
  },
  en: {
    brandSubtitle: "Focus",
    detectingTab: "Detecting active tab...",
    unsupportedWarning: "Timer only works on standard websites (http/https).",
    tabManual: "Timer",
    tabPomodoro: "Pomodoro",
    tabAuto: "Limits",
    tabInsights: "Insights",
    totalThisWeek: "Total This Week",
    monitoredUsageOnly: "Total active browser screen time",
    dailyAverage: "Daily Average",
    mostActiveDay: "Most Active Day",
    last7DaysChart: "Last 7 Days Activity",
    past7DaysBadge: "7 Days",
    topSitesTitle: "Top Sites This Week",
    noDataThisWeekTitle: "No weekly activity yet.",
    noDataThisWeekSub: "Your browsing screen time will automatically accumulate here as you browse.",
    shareOfWeek: "Share of Week",
    topSiteDay: "Top Site",
    totalForDay: "Total",
    activityForDay: "Activity",
    backToWeekBtn: "← 7 Days",
    noDataForDayTitle: "No activity on this day.",
    noDataForDaySub: "No browsing activity recorded for this day.",
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    perDaySuffix: " / day",
    todayLabel: "Today",
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dayFullNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    pomoCycleReady: "Cycle 1 of 4",
    pomoScheduleTitle: "Session Schedule",
    pomoLongBreakNote: "15-minute long break automatically after 4 cycles.",
    pomoCustomPreset: "Custom",
    pomoFocusLbl: "Focus",
    pomoBreakLbl: "Break",
    pomoCyclesLbl: "Cycles",
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
    settingsTitle: "Settings",
    settingsAria: "Settings",
    timerStyleSection: "Timer Display Style",
    timerStyleDesc: "Choose how active timer progress is visualized.",
    styleRing: "Ring",
    styleBar: "Bar",
    styleMinimal: "Minimal",
    toggleStyleTitle: "Switch timer display (Ring / Bar / Minimal)",
    shortcutsSection: "Keyboard Shortcuts",
    shortcutsDesc: "Trigger Zentime features directly from your keyboard.",
    shortcutOpenPopup: "Open Zentime Popup",
    shortcutQuickPomo: "Start 25m Focus",
    shortcutQuickPause: "Take a Breath (Pause)",
    customizeShortcutsBtn: "⚙️ Customize in Chrome",
    soundSection: "Audio & Chimes",
    soundChimeTitle: "10-Second Gentle Chime",
    soundChimeDesc: "Play harmonic audio chime when a session finishes.",
    offlineBadge: "100% Offline & Private",
    aboutText: "Zentime never collects or transmits your browsing data to any external server.",
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

// Helper: Format jam dan menit untuk analitik mingguan
function formatHoursMinutes(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "0m";
  if (totalSeconds < 60) return `${totalSeconds}${t("timeSec")}`;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const hrUnit = currentLang === "id" ? "j" : "h";
  const minUnit = "m";

  if (hours === 0) {
    return `${mins}${minUnit}`;
  }
  if (mins === 0) {
    return `${hours}${hrUnit}`;
  }
  return `${hours}${hrUnit} ${mins}${minUnit}`;
}

// Helper: Menghasilkan 7 hari kalender terakhir (dari H-6 sampai Hari Ini)
function getPast7Days() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dy = String(d.getDate()).padStart(2, "0");
    days.push({
      dateKey: `${yr}-${mo}-${dy}`,
      dateObj: d,
      dayOfWeek: d.getDay(),
      isToday: i === 0,
    });
  }
  return days;
}

// Helper: Perbandingan domain yang fleksibel (misal www.youtube.com cocok dengan youtube.com)
function matchDomain(urlDomain, targetDomain) {
  if (!urlDomain || !targetDomain) return false;
  const u = urlDomain.toLowerCase().replace(/^www\./, "");
  const t = targetDomain.toLowerCase().replace(/^www\./, "");
  return u === t || u.endsWith("." + t) || t.endsWith("." + u);
}

// Helper: Cari konfigurasi batas harian yang cocok
function findAutoLimit(domain, autoLimits) {
  if (!domain || !autoLimits) return null;
  if (autoLimits[domain]) return { key: domain, config: autoLimits[domain] };
  for (const key of Object.keys(autoLimits)) {
    if (matchDomain(domain, key)) {
      return { key, config: autoLimits[key] };
    }
  }
  return null;
}

// State untuk kalkulasi real-time Batas Harian detik demi detik
let liveTracker = {
  activeDomain: "",
  activeTimestamp: Date.now(),
  isWindowFocused: true,
  dailyUsage: {},
  autoLimits: {},
};

async function fetchLiveTrackerState() {
  try {
    const res = await chrome.runtime.sendMessage({
      type: "GET_REALTIME_USAGE",
      currentDomain: currentDomain,
    });
    if (res) {
      liveTracker.activeDomain = res.activeDomain || currentDomain || "";
      liveTracker.activeTimestamp = res.activeTimestamp || Date.now();
      liveTracker.isWindowFocused = true;
      liveTracker.dailyUsage = res.dailyUsage || {};
      liveTracker.autoLimits = res.autoLimits || {};
    }
  } catch {
    const data = await chrome.storage.local.get(["dailyUsage", "autoLimits"]);
    liveTracker.dailyUsage = data.dailyUsage || {};
    liveTracker.autoLimits = data.autoLimits || {};
    liveTracker.activeDomain = currentDomain;
    liveTracker.activeTimestamp = Date.now();
    liveTracker.isWindowFocused = true;
  }
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
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const openShortcutsPageBtn = document.getElementById("openShortcutsPageBtn");
const soundToggleCheckbox = document.getElementById("soundToggleCheckbox");

const siteFavicon = document.getElementById("siteFavicon");
const currentDomainEl = document.getElementById("currentDomain");
const unsupportedWarning = document.getElementById("unsupportedWarning");

const tabManualBtn = document.getElementById("tabManualBtn");
const tabPomoBtn = document.getElementById("tabPomoBtn");
const tabAutoBtn = document.getElementById("tabAutoBtn");
const tabInsightsBtn = document.getElementById("tabInsightsBtn");
const tabManualPane = document.getElementById("tab-manual");
const tabPomoPane = document.getElementById("tab-pomodoro");
const tabAutoPane = document.getElementById("tab-auto");
const tabInsightsPane = document.getElementById("tab-insights");

// Mode 1 Elements
const setupView = document.getElementById("setupView");
const activeView = document.getElementById("activeView");
const presetButtons = document.querySelectorAll("#setupView .preset-btn");
const customMinutesInput = document.getElementById("customMinutes");
const stepMinusBtn = document.getElementById("stepMinusBtn");
const stepPlusBtn = document.getElementById("stepPlusBtn");
const startTimerBtn = document.getElementById("startTimerBtn");
const cancelTimerBtn = document.getElementById("cancelTimerBtn");

const timerCardManual = document.getElementById("timerCardManual");
const countdownDisplay = document.getElementById("countdownDisplay");
const timerFillBar = document.getElementById("timerFillBar");
const timerRingFill = document.getElementById("timerRingFill");
const finishTimeText = document.getElementById("finishTimeText");
const toggleStyleBtnManual = document.getElementById("toggleStyleBtnManual");
const activeTimerDomain = document.getElementById("activeTimerDomain");

const otherTimersSection = document.getElementById("otherTimersSection");
const otherTimersCount = document.getElementById("otherTimersCount");
const otherTimersList = document.getElementById("otherTimersList");

// Mode Pomodoro Elements
const pomoSetupView = document.getElementById("pomoSetupView");
const pomoActiveView = document.getElementById("pomoActiveView");
const timerCardPomo = document.getElementById("timerCardPomo");
const pomoCycleLbl = document.getElementById("pomoCycleLbl");
const pomoCycleDots = document.getElementById("pomoCycleDots");
const pomoPresetBtns = document.querySelectorAll(".pomo-presets .preset-btn");
const pomoPresetCustom = document.getElementById("pomoPresetCustom");
const pomoCustomBox = document.getElementById("pomoCustomBox");
const pomoCustomFocus = document.getElementById("pomoCustomFocus");
const pomoCustomBreak = document.getElementById("pomoCustomBreak");
const pomoCustomCycles = document.getElementById("pomoCustomCycles");
const pomoScheduleText = document.getElementById("pomoScheduleText");
const pomoLongBreakNote = document.getElementById("pomoLongBreakNote");
const startPomoBtn = document.getElementById("startPomoBtn");
const pomoPhaseBadge = document.getElementById("pomoPhaseBadge");
const pomoActiveCycleText = document.getElementById("pomoActiveCycleText");
const pomoCountdownDisplay = document.getElementById("pomoCountdownDisplay");
const pomoTimerFillBar = document.getElementById("pomoTimerFillBar");
const pomoRingFill = document.getElementById("pomoRingFill");
const pomoTargetText = document.getElementById("pomoTargetText");
const toggleStyleBtnPomo = document.getElementById("toggleStyleBtnPomo");
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

// Mode 4 (Wawasan / 7-Day Screen Time Insights) Elements
const insightsTotalLabel = document.getElementById("insightsTotalLabel");
const insightsTotalWeek = document.getElementById("insightsTotalWeek");
const insightsSubtext = document.getElementById("insightsSubtext");
const insightsMetric2Label = document.getElementById("insightsMetric2Label");
const insightsDailyAvg = document.getElementById("insightsDailyAvg");
const insightsMetric3Label = document.getElementById("insightsMetric3Label");
const insightsPeakDay = document.getElementById("insightsPeakDay");
const insightsChartTitle = document.getElementById("insightsChartTitle");
const insightsChartBadge = document.getElementById("insightsChartBadge");
const insightsBarChart = document.getElementById("insightsBarChart");
const insightsSitesTitle = document.getElementById("insightsSitesTitle");
const insightsSitesList = document.getElementById("insightsSitesList");
const insightsSitesCount = document.getElementById("insightsSitesCount");
const insightsEmptyMsg = document.getElementById("insightsEmptyMsg");
const insightsEmptyMain = document.getElementById("insightsEmptyMain");
const insightsEmptySub = document.getElementById("insightsEmptySub");

let selectedInsightsDateKey = null; // null = 7 days weekly mode, or "YYYY-MM-DD" for single day drilldown

// -------------------------------------------------------------
// Inisialisasi
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  await initLanguage();
  initTheme();
  await initTimerStyle();
  setupTabs();
  setupSettingsControls();
  setupTimerStyleControls();
  setupPresets();
  setupPomoControls();
  setupAutoModeControls();

  await detectCurrentSite();
  await refreshUI();

  // Loop update realtime UI saat popup sedang dibuka (1 detik sekali)
  let loopCounter = 0;
  setInterval(async () => {
    loopCounter++;
    // Setiap 5 detik, sinkronisasi data dari background
    if (loopCounter % 5 === 0) {
      await fetchLiveTrackerState();
    }
    renderMode2();
    await renderPomodoro();
    renderMode4Insights();
  }, 1000);

  // Sync terakhir saat popup ditutup
  window.addEventListener("pagehide", () => {
    chrome.runtime.sendMessage({ type: "POPUP_CLOSED" }).catch(() => {});
  });

  startTimerBtn.addEventListener("click", handleStartTimer);
  cancelTimerBtn.addEventListener("click", handleCancelTimer);

  if (insightsChartBadge) {
    insightsChartBadge.addEventListener("click", () => {
      if (selectedInsightsDateKey) {
        selectedInsightsDateKey = null;
        renderMode4Insights();
      }
    });
  }
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

  // Update elements with data-i18n-title
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (key && I18N[lang]?.[key]) {
      el.setAttribute("title", I18N[lang][key]);
    }
  });

  // Update aria-labels
  if (themeToggleBtn) themeToggleBtn.setAttribute("aria-label", t("themeAria"));
  if (settingsBtn) {
    settingsBtn.setAttribute("aria-label", t("settingsAria"));
    settingsBtn.setAttribute("title", t("settingsTitle"));
  }
  if (toggleStyleBtnManual) toggleStyleBtnManual.setAttribute("title", t("toggleStyleTitle"));
  if (toggleStyleBtnPomo) toggleStyleBtnPomo.setAttribute("title", t("toggleStyleTitle"));
  if (stepMinusBtn) stepMinusBtn.setAttribute("aria-label", t("stepMinusAria"));
  if (stepPlusBtn) stepPlusBtn.setAttribute("aria-label", t("stepPlusAria"));

  if (typeof updatePomoScheduleInfo === "function") {
    updatePomoScheduleInfo();
  }

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
// 3. Navigasi Tab (Apple Segmented Control 4 Tab)
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

  if (tabInsightsBtn) {
    tabInsightsBtn.addEventListener("click", () => {
      switchTab("tab-insights");
      chrome.storage.local.set({ activePopupTab: "tab-insights" });
      renderMode4Insights();
    });
  }
}

function switchTab(tabId) {
  const isManual = tabId === "tab-manual";
  const isPomo = tabId === "tab-pomodoro";
  const isAuto = tabId === "tab-auto";
  const isInsights = tabId === "tab-insights";

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

  if (tabInsightsBtn && tabInsightsPane) {
    tabInsightsBtn.classList.toggle("active", isInsights);
    tabInsightsBtn.setAttribute("aria-selected", isInsights ? "true" : "false");
    tabInsightsPane.classList.toggle("active", isInsights);
    tabInsightsPane.classList.toggle("hidden", !isInsights);
    if (isInsights) {
      renderMode4Insights();
    }
  }
}

// -------------------------------------------------------------
// 3B. Setup Settings Modal & Shortcuts (Phase 3)
// -------------------------------------------------------------
function setupSettingsControls() {
  if (!settingsBtn || !settingsModal) return;

  // 1. Sync Audio Switch
  chrome.storage.local.get("soundEnabled", (data) => {
    if (soundToggleCheckbox) {
      soundToggleCheckbox.checked = data.soundEnabled !== false;
    }
  });

  if (soundToggleCheckbox) {
    soundToggleCheckbox.addEventListener("change", () => {
      chrome.storage.local.set({ soundEnabled: soundToggleCheckbox.checked });
    });
  }

  // 2. Open / Close Modal
  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
    loadRegisteredShortcuts();
  });

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", () => {
      settingsModal.classList.add("hidden");
    });
  }

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !settingsModal.classList.contains("hidden")) {
      settingsModal.classList.add("hidden");
    }
  });

  // 3. Customize Shortcuts Button -> Opens chrome://extensions/shortcuts
  if (openShortcutsPageBtn) {
    openShortcutsPageBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    });
  }
}

// Helper: Membaca shortcuts yang terdaftar secara dinamis dari Chrome jika didukung
function loadRegisteredShortcuts() {
  if (!chrome.commands || !chrome.commands.getAll) return;
  chrome.commands.getAll((commands) => {
    if (!commands || !commands.length) return;
    commands.forEach((cmd) => {
      if (!cmd.shortcut) return;
      let targetPillContainer = null;
      if (cmd.name === "_execute_action") {
        targetPillContainer = document.querySelector(".shortcut-item:nth-child(1) .shortcut-keys");
      } else if (cmd.name === "quick_start_pomo") {
        targetPillContainer = document.querySelector(".shortcut-item:nth-child(2) .shortcut-keys");
      } else if (cmd.name === "quick_block_break") {
        targetPillContainer = document.querySelector(".shortcut-item:nth-child(3) .shortcut-keys");
      }

      if (targetPillContainer) {
        const parts = cmd.shortcut.split("+").map((s) => s.trim());
        targetPillContainer.innerHTML = parts
          .map((k, idx) => `<kbd>${k}</kbd>${idx < parts.length - 1 ? '<span class="key-sep">+</span>' : ''}`)
          .join("");
      }
    });
  });
}

// -------------------------------------------------------------
// 3C. Timer Display Style (Ring / Bar / Minimal)
// -------------------------------------------------------------
async function initTimerStyle() {
  const data = await chrome.storage.local.get("timerStyle");
  const savedStyle = data.timerStyle || "ring";
  applyTimerStyle(savedStyle, false);
}

function applyTimerStyle(styleName, save = true) {
  const validStyles = ["ring", "bar", "minimal"];
  if (!validStyles.includes(styleName)) styleName = "ring";
  currentTimerStyle = styleName;

  if (timerCardManual) {
    timerCardManual.setAttribute("data-timer-style", styleName);
  }
  if (timerCardPomo) {
    timerCardPomo.setAttribute("data-timer-style", styleName);
  }

  const choiceBtns = document.querySelectorAll(".style-choice-btn");
  choiceBtns.forEach((btn) => {
    const isSelected = btn.getAttribute("data-style") === styleName;
    btn.classList.toggle("active", isSelected);
    btn.setAttribute("aria-checked", isSelected ? "true" : "false");
  });

  if (save) {
    chrome.storage.local.set({ timerStyle: styleName });
  }
}

function setupTimerStyleControls() {
  // Selector buttons in Settings Modal
  const choiceBtns = document.querySelectorAll(".style-choice-btn");
  choiceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const styleName = btn.getAttribute("data-style");
      applyTimerStyle(styleName, true);
    });
  });

  // Cycle button on Active Cards
  const STYLES = ["ring", "bar", "minimal"];
  function cycleTimerStyle() {
    const currentIndex = STYLES.indexOf(currentTimerStyle);
    const nextIndex = (currentIndex + 1) % STYLES.length;
    applyTimerStyle(STYLES[nextIndex], true);
  }

  if (toggleStyleBtnManual) {
    toggleStyleBtnManual.addEventListener("click", cycleTimerStyle);
  }
  if (toggleStyleBtnPomo) {
    toggleStyleBtnPomo.addEventListener("click", cycleTimerStyle);
  }
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
    const limitMatch = findAutoLimit(currentDomain, liveTracker.autoLimits || {});
    if (limitMatch && limitMatch.config) {
      const mins = String(limitMatch.config.dailyLimitMinutes);
      autoMinutesInput.value = mins;
      autoChips.forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-mins") === mins);
      });
    }
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

  await fetchLiveTrackerState();

  const data = await chrome.storage.local.get("manualTimers");
  const manualTimers = data.manualTimers || {};

  renderMode1(manualTimers);
  await renderPomodoro();
  renderMode2();
  renderMode4Insights();
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

  if (activeTimerDomain) {
    activeTimerDomain.textContent = currentDomain ? `● ${currentDomain}` : "";
  }

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
      if (timerRingFill) timerRingFill.style.strokeDashoffset = "452.39px";
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

    // Update Ring Stroke (circumference for r=72 is 452.39)
    if (timerRingFill) {
      const circumference = 452.39;
      const offset = circumference * (1 - fraction);
      timerRingFill.style.strokeDashoffset = `${offset}px`;
      if (percent <= 20) {
        timerRingFill.classList.add("danger");
      } else {
        timerRingFill.classList.remove("danger");
      }
    }

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
let currentPomoPreset = {
  focus: 25,
  break: 5,
  cycles: 4,
  isCustom: false,
};

function setupPomoControls() {
  pomoPresetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      pomoPresetBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (btn.id === "pomoPresetCustom") {
        currentPomoPreset.isCustom = true;
        if (pomoCustomBox) pomoCustomBox.classList.remove("hidden");
        syncFromCustomInputs();
      } else {
        currentPomoPreset.isCustom = false;
        if (pomoCustomBox) pomoCustomBox.classList.add("hidden");
        const focus = parseInt(btn.getAttribute("data-focus"), 10) || 25;
        const brk = parseInt(btn.getAttribute("data-break"), 10) || 5;
        currentPomoPreset.focus = focus;
        currentPomoPreset.break = brk;
        currentPomoPreset.cycles = 4;
        updatePomoScheduleInfo();
      }
    });
  });

  // Event listeners for custom inputs
  [pomoCustomFocus, pomoCustomBreak, pomoCustomCycles].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      if (currentPomoPreset.isCustom) {
        syncFromCustomInputs(false);
      }
    });
    input.addEventListener("change", () => {
      if (currentPomoPreset.isCustom) {
        syncFromCustomInputs(true);
      }
    });
  });

  updatePomoScheduleInfo();

  startPomoBtn.addEventListener("click", handleStartPomo);
  skipPomoPhaseBtn.addEventListener("click", handleSkipPomoPhase);
  cancelPomoBtn.addEventListener("click", handleCancelPomo);
}

function syncFromCustomInputs(enforceBounds = false) {
  if (!pomoCustomFocus || !pomoCustomBreak || !pomoCustomCycles) return;

  let focus = parseInt(pomoCustomFocus.value, 10);
  let brk = parseInt(pomoCustomBreak.value, 10);
  let cycles = parseInt(pomoCustomCycles.value, 10);

  if (isNaN(focus) || focus < 1) focus = enforceBounds ? 25 : 1;
  else if (focus > 180) focus = 180;

  if (isNaN(brk) || brk < 1) brk = enforceBounds ? 5 : 1;
  else if (brk > 60) brk = 60;

  if (isNaN(cycles) || cycles < 1) cycles = enforceBounds ? 4 : 1;
  else if (cycles > 12) cycles = 12;

  if (enforceBounds) {
    pomoCustomFocus.value = focus;
    pomoCustomBreak.value = brk;
    pomoCustomCycles.value = cycles;
  }

  currentPomoPreset.focus = focus;
  currentPomoPreset.break = brk;
  currentPomoPreset.cycles = cycles;

  updatePomoScheduleInfo();
}

function updatePomoScheduleInfo() {
  const focus = currentPomoPreset.focus || 25;
  const brk = currentPomoPreset.break || 5;
  const cycles = currentPomoPreset.cycles || 4;

  if (pomoScheduleText) {
    pomoScheduleText.textContent = `${focus}m ${t("pomoFocusWord")} • ${brk}m ${t("pomoBreakWord")}`;
  }
  if (pomoLongBreakNote) {
    pomoLongBreakNote.textContent = currentLang === "en"
      ? `15-minute long break automatically after ${cycles} cycles.`
      : `Istirahat panjang 15 menit otomatis setelah ${cycles} siklus.`;
  }
  if (pomoCycleLbl) {
    pomoCycleLbl.textContent = `${t("cycleLabel")} 1 ${t("ofWord")} ${cycles}`;
  }

  renderCycleDots(1, cycles);
}

function renderCycleDots(activeCycle, totalCycles) {
  if (!pomoCycleDots) return;
  pomoCycleDots.innerHTML = "";
  const count = Math.max(1, totalCycles || 4);
  for (let i = 1; i <= count; i++) {
    const dot = document.createElement("span");
    dot.className = "pomo-dot";
    if (i === activeCycle) dot.classList.add("active");
    else if (i < activeCycle) dot.classList.add("completed");
    pomoCycleDots.appendChild(dot);
  }
}

async function renderPomodoro() {
  if (!currentDomain) return;
  const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
  const session = pomodoroSessions[currentDomain];

  if (!session || session.phase === "idle" || session.phase === "break_ended") {
    pomoSetupView.classList.remove("hidden");
    pomoActiveView.classList.add("hidden");

    const totalCycles = session?.totalCycles || currentPomoPreset.cycles || 4;
    const cycle = session ? session.cycle : 1;
    if (pomoCycleLbl) {
      pomoCycleLbl.textContent = `${t("cycleLabel")} ${cycle} ${t("ofWord")} ${totalCycles}`;
    }
    renderCycleDots(cycle, totalCycles);
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

  // Progress bar & Ring
  const totalDurationMs = (session.endTime - session.startTime) || 1;
  const elapsedMs = Math.max(0, now - session.startTime);
  const fraction = Math.max(0, Math.min(1, 1 - elapsedMs / totalDurationMs));
  const pct = fraction * 100;
  pomoTimerFillBar.style.width = `${pct}%`;

  if (pomoRingFill) {
    const circumference = 452.39;
    const offset = circumference * (1 - fraction);
    pomoRingFill.style.strokeDashoffset = `${offset}px`;
  }

  const totalCycles = session.totalCycles || 4;
  pomoActiveCycleText.textContent = `${t("cycleLabel")} ${session.cycle}/${totalCycles}`;

  if (session.phase === "focus") {
    pomoPhaseBadge.className = "status-tag safe";
    pomoPhaseBadge.textContent = t("pomoFocusPhase");
    skipPomoPhaseBtn.textContent = t("pomoSkipPhase");
    pomoTimerFillBar.style.backgroundColor = "var(--fill-bar)";
    if (pomoRingFill) pomoRingFill.style.stroke = "var(--fill-bar)";
  } else {
    pomoPhaseBadge.className = "status-tag warning";
    pomoPhaseBadge.textContent = t("pomoBreakPhase");
    skipPomoPhaseBtn.textContent = t("pomoSkipBreak");
    pomoTimerFillBar.style.backgroundColor = "var(--success-text)";
    if (pomoRingFill) pomoRingFill.style.stroke = "var(--success-text)";
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
    totalCycles: currentPomoPreset.cycles || 4,
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
function renderMode2() {
  const todayKey = getTodayKey();
  const autoLimits = liveTracker.autoLimits || {};
  const dailyUsage = liveTracker.dailyUsage || {};
  const limitMatch = findAutoLimit(currentDomain, autoLimits);
  const currentLimit = limitMatch ? limitMatch.config : null;
  const targetDomain = limitMatch ? limitMatch.key : currentDomain;

  if (currentLimit && currentLimit.enabled) {
    siteLimitFormBox.classList.add("hidden");
    siteLimitActiveBox.classList.remove("hidden");

    let spentSecs = dailyUsage[todayKey]?.[targetDomain]?.spentSeconds || 0;

    // Real-time live offset jika website saat ini sedang dibuka di tab aktif
    const isActiveTab = matchDomain(currentDomain, liveTracker.activeDomain) ||
      matchDomain(targetDomain, liveTracker.activeDomain) ||
      (liveTracker.activeDomain === "" && currentDomain);

    if (isActiveTab) {
      const liveOffset = Math.max(0, Math.floor((Date.now() - liveTracker.activeTimestamp) / 1000));
      spentSecs += liveOffset;
    }

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
      chrome.runtime.sendMessage({ type: "SYNC_REALTIME_USAGE" }).catch(() => {});
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
    // Tidak menimpa autoMinutesInput.value agar preset / input pengguna tidak ter-reset
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

  // Periksa apakah DOM perlu di-rebuild (jika daftar domain berubah)
  const existingItems = allLimitsList.querySelectorAll(".limit-feed-item");
  const existingDomains = Array.from(existingItems).map((el) => el.getAttribute("data-domain"));
  const needsRebuild = existingDomains.length !== domains.length ||
    domains.some((d, idx) => existingDomains[idx] !== d);

  if (needsRebuild) {
    allLimitsList.innerHTML = "";
    domains.forEach((dom) => {
      const item = autoLimits[dom];
      let spentSecs = dailyUsage[todayKey]?.[dom]?.spentSeconds || 0;
      const isItemActive = matchDomain(dom, liveTracker.activeDomain) || matchDomain(dom, currentDomain);
      if (isItemActive) {
        const liveOffset = Math.max(0, Math.floor((Date.now() - liveTracker.activeTimestamp) / 1000));
        spentSecs += liveOffset;
      }
      const limitSecs = item.dailyLimitMinutes * 60;
      const percent = Math.min(100, Math.round((spentSecs / limitSecs) * 100));

      let barClass = "limit-fill";
      if (percent >= 100) barClass += " danger";
      else if (percent >= 70) barClass += " warning";

      const li = document.createElement("li");
      li.className = "limit-feed-item";
      li.setAttribute("data-domain", dom);
      li.innerHTML = `
        <div class="feed-row-top">
          <span class="feed-domain" title="${dom}">${dom}</span>
          <button class="feed-del-btn" data-domain="${dom}" title="${t("deleteLimit")} ${dom}">${t("deleteLimit")}</button>
        </div>
        <div class="limit-track">
          <div class="${barClass}" style="width: ${percent}%;"></div>
        </div>
        <div class="feed-row-bottom">
          <span class="feed-spent-txt">${formatMinutesSeconds(spentSecs)} / ${item.dailyLimitMinutes}m</span>
          <span class="feed-pct-txt">${percent}%</span>
        </div>
      `;

      li.querySelector(".feed-del-btn").addEventListener("click", async (e) => {
        const domainToDelete = e.currentTarget.getAttribute("data-domain");
        await removeAutoLimit(domainToDelete);
      });

      allLimitsList.appendChild(li);
    });
  } else {
    // In-place updates agar animasi detik berjalan mulus tanpa re-render DOM
    existingItems.forEach((li) => {
      const dom = li.getAttribute("data-domain");
      const item = autoLimits[dom];
      if (!item) return;

      let spentSecs = dailyUsage[todayKey]?.[dom]?.spentSeconds || 0;
      const isItemActive = matchDomain(dom, liveTracker.activeDomain) || matchDomain(dom, currentDomain);
      if (isItemActive) {
        const liveOffset = Math.max(0, Math.floor((Date.now() - liveTracker.activeTimestamp) / 1000));
        spentSecs += liveOffset;
      }
      const limitSecs = item.dailyLimitMinutes * 60;
      const percent = Math.min(100, Math.round((spentSecs / limitSecs) * 100));

      const bar = li.querySelector(".limit-track > div");
      if (bar) {
        bar.className = "limit-fill" + (percent >= 100 ? " danger" : (percent >= 70 ? " warning" : ""));
        bar.style.width = `${percent}%`;
      }

      const spentTxt = li.querySelector(".feed-spent-txt");
      if (spentTxt) {
        spentTxt.textContent = `${formatMinutesSeconds(spentSecs)} / ${item.dailyLimitMinutes}m`;
      }

      const pctTxt = li.querySelector(".feed-pct-txt");
      if (pctTxt) {
        pctTxt.textContent = `${percent}%`;
      }
    });
  }
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
  const limitMatch = findAutoLimit(currentDomain, autoLimits);
  const saveKey = limitMatch ? limitMatch.key : currentDomain;

  autoLimits[saveKey] = {
    domain: saveKey,
    dailyLimitMinutes: minutes,
    enabled: true,
  };

  await chrome.storage.local.set({ autoLimits });
  chrome.runtime.sendMessage({ type: "AUTO_LIMIT_UPDATED" });
  await refreshUI();
}

async function handleDeleteCurrentLimit() {
  if (!currentDomain) return;
  const { autoLimits = {} } = await chrome.storage.local.get("autoLimits");
  const limitMatch = findAutoLimit(currentDomain, autoLimits);
  const keyToDelete = limitMatch ? limitMatch.key : currentDomain;
  await removeAutoLimit(keyToDelete);
}

async function removeAutoLimit(domain) {
  const { autoLimits = {} } = await chrome.storage.local.get("autoLimits");
  delete autoLimits[domain];
  for (const key of Object.keys(autoLimits)) {
    if (matchDomain(domain, key)) {
      delete autoLimits[key];
    }
  }
  await chrome.storage.local.set({ autoLimits });

  chrome.runtime.sendMessage({ type: "AUTO_LIMIT_UPDATED" });
  await refreshUI();
}

// -------------------------------------------------------------
// 10. Mode 4: Kalkulasi & Render Wawasan (7-Day Screen Time)
// -------------------------------------------------------------
function calculate7DayAnalytics() {
  const days = getPast7Days();
  const autoLimits = liveTracker.autoLimits || {};
  const dailyUsage = liveTracker.dailyUsage || {};

  // Hitung live offset untuk situs aktif saat popup sedang terbuka
  let activeLiveOffset = 0;
  let activeTargetDomain = "";
  if (liveTracker.activeDomain) {
    const limitMatch = findAutoLimit(liveTracker.activeDomain, autoLimits);
    activeTargetDomain = (limitMatch && limitMatch.config && limitMatch.config.enabled)
      ? limitMatch.key
      : liveTracker.activeDomain;
    activeLiveOffset = Math.max(0, Math.floor((Date.now() - liveTracker.activeTimestamp) / 1000));
  }

  let totalWeeklySeconds = 0;
  let maxDaySeconds = 0;
  let peakDay = null;
  const domainTotals = {};

  const dayStats = days.map((day) => {
    const usageForDay = dailyUsage[day.dateKey] || {};
    let daySeconds = 0;
    const dayDomainTotals = {};

    for (const [dom, record] of Object.entries(usageForDay)) {
      let s = record.spentSeconds || 0;
      if (day.isToday && dom === activeTargetDomain) {
        s += activeLiveOffset;
      }
      if (s > 0) {
        daySeconds += s;
        dayDomainTotals[dom] = s;
        domainTotals[dom] = (domainTotals[dom] || 0) + s;
      }
    }

    if (day.isToday && activeTargetDomain && !usageForDay[activeTargetDomain] && activeLiveOffset > 0) {
      daySeconds += activeLiveOffset;
      dayDomainTotals[activeTargetDomain] = activeLiveOffset;
      domainTotals[activeTargetDomain] = (domainTotals[activeTargetDomain] || 0) + activeLiveOffset;
    }

    const dayTopSites = Object.entries(dayDomainTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([domain, seconds]) => ({
        domain,
        seconds,
        percentOfTotal: daySeconds > 0 ? Math.round((seconds / daySeconds) * 100) : 0,
      }));

    totalWeeklySeconds += daySeconds;
    if (daySeconds > maxDaySeconds) {
      maxDaySeconds = daySeconds;
      peakDay = {
        dateKey: day.dateKey,
        dayOfWeek: day.dayOfWeek,
        seconds: daySeconds,
      };
    }

    return {
      ...day,
      seconds: daySeconds,
      topSites: dayTopSites,
    };
  });

  const dailyAverageSeconds = Math.round(totalWeeklySeconds / 7);

  const topSites = Object.entries(domainTotals)
    .filter(([_, sec]) => sec > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([domain, seconds]) => ({
      domain,
      seconds,
      percentOfTotal: totalWeeklySeconds > 0 ? Math.round((seconds / totalWeeklySeconds) * 100) : 0,
    }));

  return {
    dayStats,
    totalWeeklySeconds,
    dailyAverageSeconds,
    maxDaySeconds,
    peakDay,
    topSites,
  };
}

function renderMode4Insights() {
  if (!tabInsightsPane) return;

  const {
    dayStats,
    totalWeeklySeconds,
    dailyAverageSeconds,
    maxDaySeconds,
    peakDay,
    topSites,
  } = calculate7DayAnalytics();

  // Cari apakah hari yang dipilih masih valid dalam 7 hari terakhir
  let selectedDay = null;
  if (selectedInsightsDateKey) {
    selectedDay = dayStats.find((d) => d.dateKey === selectedInsightsDateKey) || null;
    if (!selectedDay) {
      selectedInsightsDateKey = null;
    }
  }

  const isDayFiltered = selectedDay !== null;

  // 1. Weekly & Day-Filtered Summary Cards
  if (isDayFiltered) {
    const dayFullName = t("dayFullNames")[selectedDay.dayOfWeek] || "";
    const dayMonth = t("monthsShort")[selectedDay.dateObj.getMonth()];
    const dayNum = selectedDay.dateObj.getDate();
    const dateHuman = currentLang === "id" ? `${dayNum} ${dayMonth}` : `${dayMonth} ${dayNum}`;
    const dayTopSite = selectedDay.topSites[0]?.domain || "-";
    const shareOfWeek = totalWeeklySeconds > 0 ? Math.round((selectedDay.seconds / totalWeeklySeconds) * 100) : 0;

    if (insightsTotalLabel) insightsTotalLabel.textContent = `${t("totalForDay")} ${dayFullName}`;
    if (insightsTotalWeek) insightsTotalWeek.textContent = formatHoursMinutes(selectedDay.seconds);
    if (insightsSubtext) insightsSubtext.textContent = selectedDay.isToday ? `${dateHuman} • ${t("todayLabel")}` : dateHuman;

    if (insightsMetric2Label) insightsMetric2Label.textContent = t("shareOfWeek");
    if (insightsDailyAvg) insightsDailyAvg.textContent = `${shareOfWeek}%`;

    if (insightsMetric3Label) insightsMetric3Label.textContent = t("topSiteDay");
    if (insightsPeakDay) insightsPeakDay.textContent = dayTopSite;

    if (insightsChartBadge) {
      insightsChartBadge.textContent = t("backToWeekBtn");
      insightsChartBadge.classList.add("is-filtered");
      insightsChartBadge.setAttribute("title", t("backToWeekBtn"));
    }
    if (insightsSitesTitle) {
      insightsSitesTitle.textContent = `${t("activityForDay")} ${dayFullName}`;
    }
    if (insightsEmptyMain) insightsEmptyMain.textContent = t("noDataForDayTitle");
    if (insightsEmptySub) insightsEmptySub.textContent = t("noDataForDaySub");
  } else {
    // Tampilan Mingguan Standar (7 Hari)
    if (insightsTotalLabel) insightsTotalLabel.textContent = t("totalThisWeek");
    if (insightsTotalWeek) insightsTotalWeek.textContent = formatHoursMinutes(totalWeeklySeconds);
    if (insightsSubtext) insightsSubtext.textContent = t("monitoredUsageOnly");

    if (insightsMetric2Label) insightsMetric2Label.textContent = t("dailyAverage");
    if (insightsDailyAvg) insightsDailyAvg.textContent = `${formatHoursMinutes(dailyAverageSeconds)}${t("perDaySuffix")}`;

    if (insightsMetric3Label) insightsMetric3Label.textContent = t("mostActiveDay");
    if (insightsPeakDay) {
      if (peakDay && peakDay.seconds > 0) {
        const dayName = t("dayNames")[peakDay.dayOfWeek] || "";
        insightsPeakDay.textContent = `${dayName} (${formatHoursMinutes(peakDay.seconds)})`;
      } else {
        insightsPeakDay.textContent = "-";
      }
    }

    if (insightsChartBadge) {
      insightsChartBadge.textContent = t("past7DaysBadge");
      insightsChartBadge.classList.remove("is-filtered");
      insightsChartBadge.setAttribute("title", t("past7DaysBadge"));
    }
    if (insightsSitesTitle) {
      insightsSitesTitle.textContent = t("topSitesTitle");
    }
    if (insightsEmptyMain) insightsEmptyMain.textContent = t("noDataThisWeekTitle");
    if (insightsEmptySub) insightsEmptySub.textContent = t("noDataThisWeekSub");
  }

  // 2. 7-Day Vertical Bar Chart (In-Place / Stable DOM with Selection Support)
  if (insightsBarChart) {
    insightsBarChart.classList.toggle("has-selection", isDayFiltered);

    const existingCols = insightsBarChart.querySelectorAll(".chart-col");
    const needsFullRebuild = existingCols.length !== 7 ||
      existingCols[6]?.getAttribute("data-day") !== dayStats[6]?.dateKey;

    if (needsFullRebuild) {
      insightsBarChart.innerHTML = "";
      dayStats.forEach((day) => {
        const pct = maxDaySeconds > 0 ? Math.max(6, Math.round((day.seconds / maxDaySeconds) * 100)) : 0;
        const dayFullName = t("dayFullNames")[day.dayOfWeek] || "";
        const dayShortName = t("dayNames")[day.dayOfWeek] || "";
        const formattedTime = formatHoursMinutes(day.seconds);
        const tooltipText = `${dayFullName}: ${formattedTime}`;
        const isSelected = selectedInsightsDateKey === day.dateKey;

        const col = document.createElement("div");
        col.className = `chart-col${day.isToday ? " is-today" : ""}${isSelected ? " selected" : ""}`;
        col.setAttribute("data-day", day.dateKey);
        col.setAttribute("tabindex", "0");
        col.setAttribute("role", "button");
        col.setAttribute("aria-label", tooltipText);

        col.innerHTML = `
          <span class="chart-tooltip">${tooltipText}</span>
          <div class="chart-track">
            <div class="chart-fill" style="height: ${day.seconds > 0 ? pct + "%" : "0px"};"></div>
          </div>
          <span class="chart-label">${dayShortName}</span>
        `;

        col.addEventListener("click", () => {
          if (selectedInsightsDateKey === day.dateKey) {
            selectedInsightsDateKey = null;
          } else {
            selectedInsightsDateKey = day.dateKey;
          }
          renderMode4Insights();
        });

        insightsBarChart.appendChild(col);
      });
    } else {
      existingCols.forEach((col, idx) => {
        const day = dayStats[idx];
        if (!day) return;

        const pct = maxDaySeconds > 0 ? Math.max(6, Math.round((day.seconds / maxDaySeconds) * 100)) : 0;
        const dayFullName = t("dayFullNames")[day.dayOfWeek] || "";
        const dayShortName = t("dayNames")[day.dayOfWeek] || "";
        const formattedTime = formatHoursMinutes(day.seconds);
        const tooltipText = `${dayFullName}: ${formattedTime}`;
        const isSelected = selectedInsightsDateKey === day.dateKey;

        col.classList.toggle("selected", isSelected);
        col.setAttribute("aria-label", tooltipText);

        const tooltip = col.querySelector(".chart-tooltip");
        if (tooltip) tooltip.textContent = tooltipText;

        const fill = col.querySelector(".chart-fill");
        if (fill) fill.style.height = day.seconds > 0 ? `${pct}%` : "0px";

        const lbl = col.querySelector(".chart-label");
        if (lbl) lbl.textContent = dayShortName;
      });
    }
  }

  // 3. Top Monitored Sites Breakdown (Filtered by selected day or full week)
  const activeSitesList = isDayFiltered ? selectedDay.topSites : topSites;

  if (insightsSitesList && insightsEmptyMsg && insightsSitesCount) {
    insightsSitesCount.textContent = activeSitesList.length;

    if (activeSitesList.length === 0) {
      insightsSitesList.innerHTML = "";
      insightsEmptyMsg.classList.remove("hidden");
    } else {
      insightsEmptyMsg.classList.add("hidden");

      const existingItems = insightsSitesList.querySelectorAll(".top-site-item");
      const currentKeys = Array.from(existingItems).map((el) => el.getAttribute("data-domain"));
      const newKeys = activeSitesList.map((s) => s.domain);
      const isStructureSame = currentKeys.length === newKeys.length &&
        currentKeys.every((key, i) => key === newKeys[i]);

      if (!isStructureSame) {
        insightsSitesList.innerHTML = "";
        activeSitesList.forEach((site) => {
          const li = document.createElement("li");
          li.className = "top-site-item";
          li.setAttribute("data-domain", site.domain);
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(site.domain)}&sz=32`;

          li.innerHTML = `
            <div class="top-site-meta">
              <div class="top-site-info">
                <img class="top-site-favicon" src="${faviconUrl}" alt="">
                <span class="top-site-domain" title="${site.domain}">${site.domain}</span>
              </div>
              <div class="top-site-stats">
                <span class="top-site-time">${formatHoursMinutes(site.seconds)}</span>
                <span class="top-site-pct">${site.percentOfTotal}%</span>
              </div>
            </div>
            <div class="top-site-track">
              <div class="top-site-fill" style="width: ${site.percentOfTotal}%;"></div>
            </div>
          `;

          const faviconImg = li.querySelector(".top-site-favicon");
          if (faviconImg) {
            faviconImg.addEventListener("error", () => {
              faviconImg.src = "icons/icon16.png";
            });
          }

          insightsSitesList.appendChild(li);
        });
      } else {
        existingItems.forEach((li, idx) => {
          const site = activeSitesList[idx];
          if (!site) return;

          const timeEl = li.querySelector(".top-site-time");
          if (timeEl) timeEl.textContent = formatHoursMinutes(site.seconds);

          const pctEl = li.querySelector(".top-site-pct");
          if (pctEl) pctEl.textContent = `${site.percentOfTotal}%`;

          const fillEl = li.querySelector(".top-site-fill");
          if (fillEl) fillEl.style.width = `${site.percentOfTotal}%`;
        });
      }
    }
  }
}
