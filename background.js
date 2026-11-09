// background.js - Service Worker for Zentime (Real-Time Tracking & Mindful Blocker)

let lastDomain = "";
let lastTimestamp = Date.now();
let isWindowFocused = true;
let isPopupOpen = false;
let realtimeInterval = null;

// Helper: Format tanggal hari ini (YYYY-MM-DD)
function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper: Ekstrak domain dari URL
function getDomainFromUrl(rawUrl) {
  if (!rawUrl) return "";
  try {
    const url = new URL(rawUrl);
    if (url.protocol.startsWith("http")) {
      return url.hostname;
    }
  } catch {
    // URL tidak valid atau chrome://
  }
  return "";
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

// Helper: Membersihkan riwayat penggunaan yang lebih lama dari 7 hari (Retensi 7 Hari Rolling)
async function cleanupOldDailyUsage(dailyUsage) {
  if (!dailyUsage || typeof dailyUsage !== "object") return false;

  const validKeys = new Set();
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dy = String(d.getDate()).padStart(2, "0");
    validKeys.add(`${yr}-${mo}-${dy}`);
  }

  let modified = false;
  for (const dateKey of Object.keys(dailyUsage)) {
    if (!validKeys.has(dateKey)) {
      delete dailyUsage[dateKey];
      modified = true;
    }
  }

  return modified;
}

// -------------------------------------------------------------
// 1. Audio Chime Playback (Offscreen Document & Web Audio API)
// -------------------------------------------------------------
async function playGentleChime() {
  try {
    const { soundEnabled = true } = await chrome.storage.local.get("soundEnabled");
    if (!soundEnabled) return;

    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
    });

    if (!existingContexts || existingContexts.length === 0) {
      await chrome.offscreen.createDocument({
        url: "audio.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Play gentle 10s harmonic chime on timer/limit completion",
      });
    }

    chrome.runtime.sendMessage({ type: "PLAY_CHIME" });
  } catch (err) {
    console.warn("Unable to trigger offscreen chime:", err);
  }
}

// -------------------------------------------------------------
// 2. Redirect Tab ke Layar Penjedaan (blocked.html) & Pemulihan Tab
// -------------------------------------------------------------
async function redirectToBlockPage(domain, reason = "limit", extraQuery = "") {
  try {
    const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
    const session = pomodoroSessions[domain];

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        const rawUrl = tab.url || tab.pendingUrl || "";
        if (rawUrl && !rawUrl.includes("blocked.html")) {
          const tabDomain = getDomainFromUrl(rawUrl);
          if (matchDomain(tabDomain, domain)) {
            // Simpan URL asli ke sesi Pomodoro jika ada
            if (session && rawUrl.startsWith("http")) {
              session.originalUrl = rawUrl;
              await chrome.storage.local.set({ pomodoroSessions });
            }

            let queryStr = `domain=${encodeURIComponent(domain)}&mode=${encodeURIComponent(reason)}&originalUrl=${encodeURIComponent(rawUrl)}`;
            if (extraQuery) {
              queryStr += `&${extraQuery}`;
            }
            const blockedUrl = chrome.runtime.getURL(`blocked.html?${queryStr}`);
            chrome.tabs.update(tab.id, { url: blockedUrl });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Redirect to block page error:", err);
  }
}

// Helper: Memulihkan tab yang sedang diblokir (blocked.html) kembali ke website aslinya
async function unblockAndRestoreTabs(domain) {
  try {
    const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
    const session = pomodoroSessions[domain];

    const tabs = await chrome.tabs.query({});
    const defaultUrl = domain.startsWith("http://") || domain.startsWith("https://")
      ? domain
      : `https://${domain}`;

    for (const tab of tabs) {
      if (tab.id) {
        const rawUrl = tab.url || tab.pendingUrl || "";
        if (rawUrl && rawUrl.includes("blocked.html")) {
          try {
            const parsed = new URL(rawUrl);
            const domParam = parsed.searchParams.get("domain");
            if (domParam && matchDomain(domParam, domain)) {
              const origParam = parsed.searchParams.get("originalUrl");
              const destUrl = (origParam && origParam.startsWith("http"))
                ? origParam
                : (session && session.originalUrl && session.originalUrl.startsWith("http") ? session.originalUrl : defaultUrl);
              chrome.tabs.update(tab.id, { url: destUrl });
            }
          } catch {
            // Abaikan kesalahan URL
          }
        }
      }
    }
  } catch (err) {
    console.warn("Unblock and restore tabs error:", err);
  }
}

// -------------------------------------------------------------
// 3. Core Engine: Real-Time Tab Tracking & Blocker Enforcement
// -------------------------------------------------------------
async function processTimeElapsed() {
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - lastTimestamp) / 1000);

  // Update timestamp secara bertahap bebas dari drift
  if (elapsedSeconds > 0) {
    lastTimestamp += elapsedSeconds * 1000;
  }

  const todayKey = getTodayKey();
  const data = await chrome.storage.local.get([
    "autoLimits",
    "dailyUsage",
    "snoozedUntil",
  ]);

  const autoLimits = data.autoLimits || {};
  const dailyUsage = data.dailyUsage || {};
  const snoozedUntil = data.snoozedUntil || {};

  const isBrowsingActive = isWindowFocused || isPopupOpen;

  // Hanya hitung waktu jika domain aktif valid dan browser sedang dilihat
  if (elapsedSeconds > 0 && lastDomain && isBrowsingActive && elapsedSeconds < 3600) {
    const limitMatch = findAutoLimit(lastDomain, autoLimits);
    const targetDomain = (limitMatch && limitMatch.config && limitMatch.config.enabled)
      ? limitMatch.key
      : lastDomain;

    if (!dailyUsage[todayKey]) {
      dailyUsage[todayKey] = {};
    }
    if (!dailyUsage[todayKey][targetDomain]) {
      dailyUsage[todayKey][targetDomain] = { spentSeconds: 0, notified: false };
    }

    dailyUsage[todayKey][targetDomain].spentSeconds += elapsedSeconds;

    // Evaluasi aturan limit & blocking jika website ini dibatasi
    if (limitMatch && limitMatch.config && limitMatch.config.enabled) {
      const limitMinutes = limitMatch.config.dailyLimitMinutes;
      const limitSeconds = limitMinutes * 60;
      const currentSpent = dailyUsage[todayKey][targetDomain].spentSeconds;

      const isSnoozed = snoozedUntil[targetDomain] && Date.now() < snoozedUntil[targetDomain];

      // Jika kuota habis
      if (currentSpent >= limitSeconds) {
        // 1. Notifikasi & Suara (hanya sekali per hari saat pertama kali habis)
        if (!dailyUsage[todayKey][targetDomain].notified) {
          dailyUsage[todayKey][targetDomain].notified = true;

          await playGentleChime();

          const { preferredLanguage = "id" } = await chrome.storage.local.get("preferredLanguage");
          const title = preferredLanguage === "en" ? "🛑 Daily Limit Reached!" : "🛑 Batas Harian Tercapai!";
          const message = preferredLanguage === "en"
            ? `You have used ${targetDomain} for ${limitMinutes} minutes today. Time for a mindful break!`
            : `Kamu sudah menggunakan ${targetDomain} selama ${limitMinutes} menit hari ini. Saatnya beristirahat!`;

          chrome.notifications.create(`autolimit_${targetDomain}_${Date.now()}`, {
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: title,
            message: message,
            priority: 2,
            requireInteraction: true,
          });
        }

        // 2. Redirect jika tidak dalam masa perpanjangan darurat (+5m snooze)
        if (!isSnoozed) {
          await redirectToBlockPage(targetDomain, "limit");
        }
      }
    }

    await chrome.storage.local.set({ dailyUsage });
  }

  // Identifikasi domain aktif saat ini
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (activeTab && activeTab.url) {
      const dom = getDomainFromUrl(activeTab.url);
      if (dom) {
        lastDomain = dom;
      }
    }
  } catch {
    // Pertahankan lastDomain jika query gagal
  }

  // Jadwalkan deadline alarm persis untuk presisi detik saat background tertidur
  await scheduleLimitDeadline(lastDomain, autoLimits, dailyUsage, todayKey, snoozedUntil);

  await updateBadge();
}

async function scheduleLimitDeadline(domain, autoLimits, dailyUsage, todayKey, snoozedUntil) {
  await chrome.alarms.clear("autolimit_deadline");
  if (!domain || (!isWindowFocused && !isPopupOpen)) return;

  const limitMatch = findAutoLimit(domain, autoLimits);
  if (!limitMatch || !limitMatch.config || !limitMatch.config.enabled) return;

  const targetDomain = limitMatch.key;
  const isSnoozed = snoozedUntil[targetDomain] && Date.now() < snoozedUntil[targetDomain];
  if (isSnoozed) return;

  const spentSecs = dailyUsage[todayKey]?.[targetDomain]?.spentSeconds || 0;
  const limitSecs = limitMatch.config.dailyLimitMinutes * 60;
  const remainingSecs = limitSecs - spentSecs;

  if (remainingSecs <= 0) {
    await redirectToBlockPage(targetDomain, "limit");
  } else {
    chrome.alarms.create("autolimit_deadline", {
      when: Date.now() + remainingSecs * 1000,
    });
  }
}

// -------------------------------------------------------------
// 4. Loop Real-Time (Detik-ke-Detik Presisi)
// -------------------------------------------------------------
function startRealtimeLoop() {
  if (!realtimeInterval) {
    lastTimestamp = Date.now();
    realtimeInterval = setInterval(async () => {
      if (isWindowFocused || isPopupOpen) {
        await processTimeElapsed();
      }
    }, 1000);
  }
}

startRealtimeLoop();

// Lifecycle Handlers: Cleanup retensi data saat ekstensi diaktifkan atau browser dibuka
chrome.runtime.onInstalled.addListener(async () => {
  const { dailyUsage = {} } = await chrome.storage.local.get("dailyUsage");
  const cleaned = await cleanupOldDailyUsage(dailyUsage);
  if (cleaned) {
    await chrome.storage.local.set({ dailyUsage });
  }
  startRealtimeLoop();
  setupContextMenus();
});

chrome.runtime.onStartup.addListener(async () => {
  const { dailyUsage = {} } = await chrome.storage.local.get("dailyUsage");
  const cleaned = await cleanupOldDailyUsage(dailyUsage);
  if (cleaned) {
    await chrome.storage.local.set({ dailyUsage });
  }
  startRealtimeLoop();
  setupContextMenus();
});

// -------------------------------------------------------------
// 5. Event Listeners Pergantian Tab & Navigasi
// -------------------------------------------------------------
chrome.tabs.onActivated.addListener(async () => {
  await processTimeElapsed();
  if (lastDomain) {
    await checkTabLimitOnNavigation(lastDomain);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    const domain = getDomainFromUrl(tab.url);
    if (domain) {
      await checkTabLimitOnNavigation(domain, tabId);
    }
    await processTimeElapsed();
  }
});

async function checkTabLimitOnNavigation(domain, tabId = null) {
  const todayKey = getTodayKey();
  const data = await chrome.storage.local.get([
    "autoLimits",
    "dailyUsage",
    "snoozedUntil",
  ]);

  const autoLimits = data.autoLimits || {};
  const dailyUsage = data.dailyUsage || {};
  const snoozedUntil = data.snoozedUntil || {};

  const limitMatch = findAutoLimit(domain, autoLimits);
  if (limitMatch && limitMatch.config && limitMatch.config.enabled) {
    const targetDomain = limitMatch.key;
    const isSnoozed = snoozedUntil[targetDomain] && Date.now() < snoozedUntil[targetDomain];
    const spentSecs = dailyUsage[todayKey]?.[targetDomain]?.spentSeconds || 0;
    const limitSecs = limitMatch.config.dailyLimitMinutes * 60;

    if (spentSecs >= limitSecs && !isSnoozed) {
      const blockedUrl = chrome.runtime.getURL(
        `blocked.html?domain=${encodeURIComponent(targetDomain)}&mode=limit`
      );
      if (tabId) {
        chrome.tabs.update(tabId, { url: blockedUrl });
      } else {
        await redirectToBlockPage(targetDomain, "limit");
      }
    }
  }
}

// Ketika jendela browser di-minimize atau kehilangan fokus
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await processTimeElapsed();
    // Di Chrome, membuka popup extension menghasilkan WINDOW_ID_NONE.
    // Jika popup sedang terbuka, jangan matikan status fokus browser.
    if (!isPopupOpen) {
      isWindowFocused = false;
    }
  } else {
    isWindowFocused = true;
    lastTimestamp = Date.now();
    await processTimeElapsed();
  }
});

chrome.alarms.create("tracker_heartbeat", { periodInMinutes: 1 });

// -------------------------------------------------------------
// 6. Alarm Handler (Mode 1 Manual Timer Selesai)
// -------------------------------------------------------------
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith("timer_")) {
    const domain = alarm.name.replace("timer_", "");
    const { manualTimers = {} } = await chrome.storage.local.get("manualTimers");
    const timerInfo = manualTimers[domain];

    delete manualTimers[domain];
    await chrome.storage.local.set({ manualTimers });

    // 1. Mainkan audio chime lembut ~10 detik
    await playGentleChime();

    // 2. Tampilkan notifikasi desktop
    const { preferredLanguage = "id" } = await chrome.storage.local.get("preferredLanguage");
    const title = preferredLanguage === "en" ? "⏰ Time's Up!" : "⏰ Waktu Habis!";
    const message = preferredLanguage === "en"
      ? `Your time for ${domain} (${timerInfo?.durationMinutes || ''} min) is up!`
      : `Waktu kamu untuk ${domain} (${timerInfo?.durationMinutes || ''} menit) sudah selesai!`;

    chrome.notifications.create(`alarm_${domain}_${Date.now()}`, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: title,
      message: message,
      priority: 2,
      requireInteraction: true,
    });

    // 3. PENTING: Redirect tab aktif/terkait ke layar "Saatnya Beristirahat" / Sesi Selesai!
    await redirectToBlockPage(domain, "timer");

    await updateBadge();
  } else if (alarm.name.startsWith("pomo_focus_")) {
    const domain = alarm.name.replace("pomo_focus_", "");
    const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
    const session = pomodoroSessions[domain];

    if (session) {
      const totalCycles = session.totalCycles || 4;
      const isLongBreak = (session.cycle % totalCycles === 0);
      const breakMins = isLongBreak ? (session.longBreakMinutes || 15) : (session.breakMinutes || 5);

      session.phase = "break";
      session.startTime = Date.now();
      session.endTime = Date.now() + breakMins * 60 * 1000;
      session.currentBreakMinutes = breakMins;
      session.isLongBreak = isLongBreak;

      pomodoroSessions[domain] = session;
      await chrome.storage.local.set({ pomodoroSessions });

      // 1. Mainkan lonceng lembut ~10 detik
      await playGentleChime();

      // 2. Notifikasi desktop
      const { preferredLanguage = "id" } = await chrome.storage.local.get("preferredLanguage");
      const title = preferredLanguage === "en" ? "🍅 Pomodoro Focus Complete!" : "🍅 Sesi Fokus Selesai!";
      const message = preferredLanguage === "en"
        ? `Cycle ${session.cycle}/${totalCycles} complete! Take a ${breakMins}-minute break to recharge.`
        : `Siklus ${session.cycle}/${totalCycles} selesai! Saatnya istirahat selama ${breakMins} menit untuk menyegarkan pikiran.`;

      chrome.notifications.create(`pomo_${domain}_${Date.now()}`, {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: title,
        message: message,
        priority: 2,
        requireInteraction: true,
      });

      // 3. Pasang alarm waktu istirahat
      await chrome.alarms.create(`pomo_break_${domain}`, { delayInMinutes: breakMins });

      // 4. Redirect tab ke layar istirahat
      await redirectToBlockPage(domain, "pomodoro", `cycle=${session.cycle}&totalCycles=${totalCycles}&breakMinutes=${breakMins}`);

      await updateBadge();
    }
  } else if (alarm.name.startsWith("pomo_break_")) {
    const domain = alarm.name.replace("pomo_break_", "");
    const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
    const session = pomodoroSessions[domain];

    if (session) {
      const totalCycles = session.totalCycles || 4;
      const nextCycle = (session.cycle >= totalCycles) ? 1 : session.cycle + 1;
      session.phase = "break_ended";
      session.cycle = nextCycle;
      session.startTime = Date.now();
      session.endTime = Date.now();

      pomodoroSessions[domain] = session;
      await chrome.storage.local.set({ pomodoroSessions });

      // 1. Mainkan lonceng lembut
      await playGentleChime();

      // 2. Notifikasi desktop
      const { preferredLanguage = "id" } = await chrome.storage.local.get("preferredLanguage");
      const title = preferredLanguage === "en" ? "☕ Break Complete!" : "☕ Waktu Istirahat Selesai!";
      const message = preferredLanguage === "en"
        ? `Break complete! Ready to start focus cycle ${nextCycle}/${totalCycles}?`
        : `Waktu istirahat telah selesai. Siap lanjut ke siklus fokus ke-${nextCycle}/${totalCycles}?`;

      chrome.notifications.create(`pomo_break_${domain}_${Date.now()}`, {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: title,
        message: message,
        priority: 2,
        requireInteraction: true,
      });

      chrome.runtime.sendMessage({
        type: "POMODORO_BREAK_ENDED",
        domain,
        nextCycle,
      }).catch(() => {});

      await updateBadge();
    }
  } else if (alarm.name === "tracker_heartbeat" || alarm.name === "autolimit_deadline") {
    const { dailyUsage = {} } = await chrome.storage.local.get("dailyUsage");
    const cleaned = await cleanupOldDailyUsage(dailyUsage);
    if (cleaned) {
      await chrome.storage.local.set({ dailyUsage });
    }
    await processTimeElapsed();
  }
});

// -------------------------------------------------------------
// 7. Update Toolbar Badge
// -------------------------------------------------------------
async function updateBadge() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const domain = tab ? getDomainFromUrl(tab.url) : "";

    if (!domain) {
      chrome.action.setBadgeText({ text: "" });
      return;
    }

    const { manualTimers = {}, autoLimits = {}, dailyUsage = {}, pomodoroSessions = {} } =
      await chrome.storage.local.get(["manualTimers", "autoLimits", "dailyUsage", "pomodoroSessions"]);

    // Mode Pomodoro
    const pomo = pomodoroSessions[domain];
    if (pomo && (pomo.phase === "focus" || pomo.phase === "break") && pomo.endTime > Date.now()) {
      const remainingMs = pomo.endTime - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60000);
      chrome.action.setBadgeBackgroundColor({
        color: pomo.phase === "focus" ? "#D70015" : "#248A3D",
      });
      chrome.action.setBadgeText({ text: remainingMins <= 1 ? "<1m" : `${remainingMins}m` });
      return;
    }

    // Mode 1: Timer Manual
    const manual = manualTimers[domain];
    if (manual && manual.endTime > Date.now()) {
      const remainingMs = manual.endTime - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60000);

      chrome.action.setBadgeBackgroundColor({ color: "#D70015" });
      chrome.action.setBadgeText({ text: remainingMins <= 1 ? "<1m" : `${remainingMins}m` });
      return;
    }

    // Mode 2: Batas Harian
    const limitMatch = findAutoLimit(domain, autoLimits);
    if (limitMatch && limitMatch.config && limitMatch.config.enabled) {
      const targetDomain = limitMatch.key;
      const todayKey = getTodayKey();
      const usage = dailyUsage[todayKey]?.[targetDomain];
      const spentSecs = usage ? usage.spentSeconds : 0;
      const limitSecs = limitMatch.config.dailyLimitMinutes * 60;
      const remainingSecs = Math.max(0, limitSecs - spentSecs);
      const remainingMins = Math.ceil(remainingSecs / 60);

      if (remainingSecs <= 0) {
        chrome.action.setBadgeBackgroundColor({ color: "#D70015" });
        chrome.action.setBadgeText({ text: "0m" });
      } else if (remainingMins <= 5) {
        chrome.action.setBadgeBackgroundColor({ color: "#B25000" });
        chrome.action.setBadgeText({ text: `${remainingMins}m` });
      } else {
        chrome.action.setBadgeBackgroundColor({ color: "#1D1D1F" });
        chrome.action.setBadgeText({ text: `${remainingMins}m` });
      }
      return;
    }

    chrome.action.setBadgeText({ text: "" });
  } catch (err) {
    console.error("Badge update error:", err);
  }
}

// -------------------------------------------------------------
// 8. Pesan Runtime (Popup & Blocked Page)
// -------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TIMER_UPDATED" || message.type === "AUTO_LIMIT_UPDATED") {
    processTimeElapsed().then(() => {
      sendResponse({ success: true });
    });
    return true;
  } else if (message.type === "SNOOZE_SITE") {
    sendResponse({ success: true });
    return true;
  } else if (message.type === "GET_REALTIME_USAGE") {
    (async () => {
      isPopupOpen = true;
      isWindowFocused = true;
      if (message.currentDomain && !lastDomain) {
        lastDomain = message.currentDomain;
      }
      await processTimeElapsed();
      const todayKey = getTodayKey();
      const data = await chrome.storage.local.get([
        "autoLimits",
        "dailyUsage",
        "snoozedUntil",
      ]);
      sendResponse({
        activeDomain: lastDomain || message.currentDomain || "",
        activeTimestamp: lastTimestamp,
        isWindowFocused: true,
        dailyUsage: data.dailyUsage || {},
        autoLimits: data.autoLimits || {},
        snoozedUntil: data.snoozedUntil || {},
      });
    })();
    return true;
  } else if (message.type === "POPUP_CLOSED" || message.type === "SYNC_REALTIME_USAGE") {
    (async () => {
      await processTimeElapsed();
      if (message.type === "POPUP_CLOSED") {
        isPopupOpen = false;
      }
      sendResponse({ success: true });
    })();
    return true;
  } else if (message.type === "START_POMODORO") {
    (async () => {
      const { domain, focusMinutes, breakMinutes, longBreakMinutes, totalCycles, cycle, originalUrl } = message;
      const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
      const prevSession = pomodoroSessions[domain];
      const startTime = Date.now();
      const endTime = startTime + focusMinutes * 60 * 1000;

      await chrome.alarms.clear(`pomo_focus_${domain}`);
      await chrome.alarms.clear(`pomo_break_${domain}`);

      pomodoroSessions[domain] = {
        phase: "focus",
        cycle: cycle || 1,
        totalCycles: totalCycles || prevSession?.totalCycles || 4,
        focusMinutes: focusMinutes || 25,
        breakMinutes: breakMinutes || 5,
        longBreakMinutes: longBreakMinutes || 15,
        startTime,
        endTime,
        originalUrl: (originalUrl && originalUrl.startsWith("http")) ? originalUrl : (prevSession?.originalUrl || ""),
      };

      await chrome.storage.local.set({ pomodoroSessions });
      await chrome.alarms.create(`pomo_focus_${domain}`, { delayInMinutes: focusMinutes });
      await unblockAndRestoreTabs(domain);
      await updateBadge();
      sendResponse({ success: true });
    })();
    return true;
  } else if (message.type === "SKIP_POMODORO_PHASE") {
    (async () => {
      const { domain, originalUrl } = message;
      const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
      const session = pomodoroSessions[domain];

      if (session) {
        if (originalUrl && originalUrl.startsWith("http")) {
          session.originalUrl = originalUrl;
        }
        const total = session.totalCycles || 4;
        if (session.phase === "focus") {
          await chrome.alarms.clear(`pomo_focus_${domain}`);
          const isLong = (session.cycle % total === 0);
          const breakMins = isLong ? (session.longBreakMinutes || 15) : (session.breakMinutes || 5);
          session.phase = "break";
          session.startTime = Date.now();
          session.endTime = Date.now() + breakMins * 60 * 1000;
          session.currentBreakMinutes = breakMins;
          session.isLongBreak = isLong;
          await chrome.storage.local.set({ pomodoroSessions });
          await chrome.alarms.create(`pomo_break_${domain}`, { delayInMinutes: breakMins });
          await redirectToBlockPage(domain, "pomodoro", `cycle=${session.cycle}&totalCycles=${total}&breakMinutes=${breakMins}`);
        } else {
          await chrome.alarms.clear(`pomo_break_${domain}`);
          const nextCycle = (session.cycle >= total) ? 1 : session.cycle + 1;
          const startTime = Date.now();
          const endTime = startTime + session.focusMinutes * 60 * 1000;
          session.phase = "focus";
          session.cycle = nextCycle;
          session.startTime = startTime;
          session.endTime = endTime;
          await chrome.storage.local.set({ pomodoroSessions });
          await chrome.alarms.create(`pomo_focus_${domain}`, { delayInMinutes: session.focusMinutes });
          await unblockAndRestoreTabs(domain);
        }
        await updateBadge();
      }
      sendResponse({ success: true });
    })();
    return true;
  } else if (message.type === "CANCEL_POMODORO") {
    (async () => {
      const { domain } = message;
      await chrome.alarms.clear(`pomo_focus_${domain}`);
      await chrome.alarms.clear(`pomo_break_${domain}`);
      const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
      delete pomodoroSessions[domain];
      await chrome.storage.local.set({ pomodoroSessions });
      await unblockAndRestoreTabs(domain);
      await updateBadge();
      sendResponse({ success: true });
    })();
    return true;
  }
  return true;
});

// -------------------------------------------------------------
// 9. Context Menus & Global Keyboard Shortcuts (Phase 3)
// -------------------------------------------------------------
function setupContextMenus() {
  if (!chrome.contextMenus) return;
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "zentime_quick_pomo",
      title: "🍅 Mulai Fokus 25m di Website Ini",
      contexts: ["page"],
    });
    chrome.contextMenus.create({
      id: "zentime_open_limits",
      title: "🛑 Pasang Batas Harian...",
      contexts: ["page"],
    });
    chrome.contextMenus.create({
      id: "zentime_open_insights",
      title: "📊 Buka Wawasan Layar (7 Hari)",
      contexts: ["page", "action"],
    });
  });
}

// Mulai Pomodoro Cepat dari Shortcut atau Context Menu
async function startQuickPomodoro(domain, originalUrl = "") {
  if (!domain) return;
  const focusMinutes = 25;
  const breakMinutes = 5;
  const totalCycles = 4;
  const longBreakMinutes = 15;
  const startTime = Date.now();
  const endTime = startTime + focusMinutes * 60 * 1000;

  await chrome.alarms.clear(`pomo_focus_${domain}`);
  await chrome.alarms.clear(`pomo_break_${domain}`);

  const { pomodoroSessions = {} } = await chrome.storage.local.get("pomodoroSessions");
  pomodoroSessions[domain] = {
    phase: "focus",
    cycle: 1,
    totalCycles,
    focusMinutes,
    breakMinutes,
    longBreakMinutes,
    startTime,
    endTime,
    originalUrl: (originalUrl && originalUrl.startsWith("http")) ? originalUrl : "",
  };

  await chrome.storage.local.set({ pomodoroSessions });
  await chrome.alarms.create(`pomo_focus_${domain}`, { delayInMinutes: focusMinutes });
  await unblockAndRestoreTabs(domain);
  await updateBadge();

  // Desktop notification
  const { preferredLanguage = "id" } = await chrome.storage.local.get("preferredLanguage");
  const title = preferredLanguage === "en" ? "🍅 25m Focus Session Started!" : "🍅 Sesi Fokus 25m Dimulai!";
  const message = preferredLanguage === "en"
    ? `Pomodoro focus session is now active on ${domain} (25 min). Stay mindful!`
    : `Sesi fokus 25 menit aktif di ${domain}. Fokus dan selesaikan tugasmu!`;

  chrome.notifications.create(`quick_pomo_${domain}_${Date.now()}`, {
    type: "basic",
    iconUrl: "icons/icon128.png",
    title,
    message,
    priority: 1,
  });
}

// Handler Klik Context Menu
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab || !tab.url) return;
    const domain = getDomainFromUrl(tab.url);

    if (info.menuItemId === "zentime_quick_pomo") {
      if (domain) {
        await startQuickPomodoro(domain, tab.url);
      }
    } else if (info.menuItemId === "zentime_open_limits") {
      await chrome.storage.local.set({ activePopupTab: "tab-auto" });
      chrome.action.openPopup?.().catch(() => {});
    } else if (info.menuItemId === "zentime_open_insights") {
      await chrome.storage.local.set({ activePopupTab: "tab-insights" });
      chrome.action.openPopup?.().catch(() => {});
    }
  });
}

// Handler Keyboard Shortcuts (chrome.commands)
if (chrome.commands && chrome.commands.onCommand) {
  chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) return;
    const domain = getDomainFromUrl(tab.url);

    if (command === "quick_start_pomo") {
      if (domain) {
        await startQuickPomodoro(domain, tab.url);
      }
    } else if (command === "quick_block_break") {
      if (domain) {
        await redirectToBlockPage(domain, "pause", `manual=true`);
      }
    }
  });
}
