// background.js - Service Worker for Zentime (Real-Time Tracking & Mindful Blocker)

let lastDomain = "";
let lastTimestamp = Date.now();
let isWindowFocused = true;
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

// -------------------------------------------------------------
// 1. Audio Chime Playback (Offscreen Document & Web Audio API)
// -------------------------------------------------------------
async function playGentleChime() {
  try {
    // Cek apakah offscreen document sudah aktif
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

    // Kirim pesan untuk memicu audio chime
    chrome.runtime.sendMessage({ type: "PLAY_CHIME" });
  } catch (err) {
    console.warn("Unable to trigger offscreen chime:", err);
  }
}

// -------------------------------------------------------------
// 2. Core Engine: Real-Time Tab Tracking & Blocker Enforcement
// -------------------------------------------------------------
async function processTimeElapsed() {
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - lastTimestamp) / 1000);

  if (elapsedSeconds <= 0) {
    return;
  }

  // Update timestamp secara inkremental agar bebas dari drift
  lastTimestamp += elapsedSeconds * 1000;

  // Hanya hitung waktu jika domain aktif valid dan browser sedang dilihat
  if (lastDomain && isWindowFocused && elapsedSeconds < 3600) {
    const todayKey = getTodayKey();
    const data = await chrome.storage.local.get([
      "autoLimits",
      "dailyUsage",
      "snoozedUntil",
    ]);

    const autoLimits = data.autoLimits || {};
    const dailyUsage = data.dailyUsage || {};
    const snoozedUntil = data.snoozedUntil || {};

    if (autoLimits[lastDomain] && autoLimits[lastDomain].enabled) {
      if (!dailyUsage[todayKey]) {
        dailyUsage[todayKey] = {};
      }
      if (!dailyUsage[todayKey][lastDomain]) {
        dailyUsage[todayKey][lastDomain] = { spentSeconds: 0, notified: false };
      }

      dailyUsage[todayKey][lastDomain].spentSeconds += elapsedSeconds;

      const limitMinutes = autoLimits[lastDomain].dailyLimitMinutes;
      const limitSeconds = limitMinutes * 60;
      const currentSpent = dailyUsage[todayKey][lastDomain].spentSeconds;

      const isSnoozed = snoozedUntil[lastDomain] && Date.now() < snoozedUntil[lastDomain];

      // Jika kuota habis
      if (currentSpent >= limitSeconds) {
        // 1. Notifikasi & Suara (hanya sekali per hari saat pertama kali habis)
        if (!dailyUsage[todayKey][lastDomain].notified) {
          dailyUsage[todayKey][lastDomain].notified = true;

          // Mainkan audio lonceng lembut ~10 detik
          await playGentleChime();

          const { preferredLanguage = "id" } = await chrome.storage.local.get("preferredLanguage");
          const title = preferredLanguage === "en" ? "🛑 Daily Limit Reached!" : "🛑 Batas Harian Tercapai!";
          const message = preferredLanguage === "en"
            ? `You have used ${lastDomain} for ${limitMinutes} minutes today. Time for a mindful break!`
            : `Kamu sudah menggunakan ${lastDomain} selama ${limitMinutes} menit hari ini. Saatnya beristirahat!`;

          chrome.notifications.create(`autolimit_${lastDomain}_${Date.now()}`, {
            type: "basic",
            iconUrl: "icons/icon128.png",
            title: title,
            message: message,
            priority: 2,
            requireInteraction: true,
          });
        }

        // 2. Jika tidak sedang dalam masa perpanjangan darurat (+5m snooze), arahkan ke blocked.html
        if (!isSnoozed) {
          await redirectToBlockPage(lastDomain);
        }
      }

      await chrome.storage.local.set({ dailyUsage });
    }
  }

  // Identifikasi domain aktif saat ini
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    lastDomain = activeTab ? getDomainFromUrl(activeTab.url) : "";
  } catch {
    lastDomain = "";
  }

  await updateBadge();
}

// Redirect tab aktif ke layar penjedaan (blocked.html)
async function redirectToBlockPage(domain) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !tab.url) return;

    const tabDomain = getDomainFromUrl(tab.url);
    if (tabDomain === domain) {
      const blockedUrl = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(domain)}`);
      if (!tab.url.includes("blocked.html")) {
        chrome.tabs.update(tab.id, { url: blockedUrl });
      }
    }
  } catch (err) {
    console.warn("Redirect to block page error:", err);
  }
}

// -------------------------------------------------------------
// 3. Loop Real-Time (Detik-ke-Detik Presisi)
// -------------------------------------------------------------
function startRealtimeLoop() {
  if (!realtimeInterval) {
    lastTimestamp = Date.now();
    realtimeInterval = setInterval(async () => {
      if (isWindowFocused) {
        await processTimeElapsed();
      }
    }, 1000);
  }
}

// Mulai loop real-time saat service worker menyala
startRealtimeLoop();

// -------------------------------------------------------------
// 4. Event Listeners Pergantian Tab & URL
// -------------------------------------------------------------
chrome.tabs.onActivated.addListener(async () => {
  await processTimeElapsed();
  // Cek apakah tab yang baru dibuka sudah mencapai kuota limit
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

  if (autoLimits[domain] && autoLimits[domain].enabled) {
    const isSnoozed = snoozedUntil[domain] && Date.now() < snoozedUntil[domain];
    const spentSecs = dailyUsage[todayKey]?.[domain]?.spentSeconds || 0;
    const limitSecs = autoLimits[domain].dailyLimitMinutes * 60;

    if (spentSecs >= limitSecs && !isSnoozed) {
      const blockedUrl = chrome.runtime.getURL(`blocked.html?domain=${encodeURIComponent(domain)}`);
      if (tabId) {
        chrome.tabs.update(tabId, { url: blockedUrl });
      } else {
        await redirectToBlockPage(domain);
      }
    }
  }
}

// Ketika jendela browser di-minimize atau kehilangan fokus
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await processTimeElapsed();
    isWindowFocused = false;
  } else {
    isWindowFocused = true;
    lastTimestamp = Date.now();
    await processTimeElapsed();
  }
});

// Alarm heartbeat fallback setiap 1 menit
chrome.alarms.create("tracker_heartbeat", { periodInMinutes: 1 });

// -------------------------------------------------------------
// 5. Alarm Handler (Mode 1 Manual Timer & Chime)
// -------------------------------------------------------------
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith("timer_")) {
    const domain = alarm.name.replace("timer_", "");
    const { manualTimers = {} } = await chrome.storage.local.get("manualTimers");
    const timerInfo = manualTimers[domain];

    delete manualTimers[domain];
    await chrome.storage.local.set({ manualTimers });

    // Mainkan audio chime lembut ~10 detik
    await playGentleChime();

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

    await updateBadge();
  } else if (alarm.name === "tracker_heartbeat") {
    await processTimeElapsed();
  }
});

// -------------------------------------------------------------
// 6. Update Toolbar Badge
// -------------------------------------------------------------
async function updateBadge() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const domain = tab ? getDomainFromUrl(tab.url) : "";

    if (!domain) {
      chrome.action.setBadgeText({ text: "" });
      return;
    }

    const { manualTimers = {}, autoLimits = {}, dailyUsage = {} } =
      await chrome.storage.local.get(["manualTimers", "autoLimits", "dailyUsage"]);

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
    const autoLimit = autoLimits[domain];
    if (autoLimit && autoLimit.enabled) {
      const todayKey = getTodayKey();
      const usage = dailyUsage[todayKey]?.[domain];
      const spentSecs = usage ? usage.spentSeconds : 0;
      const limitSecs = autoLimit.dailyLimitMinutes * 60;
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
// 7. Pesan Runtime (Popup & Blocked Page)
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
  }
  return true;
});
