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

// -------------------------------------------------------------
// 1. Audio Chime Playback (Offscreen Document & Web Audio API)
// -------------------------------------------------------------
async function playGentleChime() {
  try {
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
// 2. Redirect Tab ke Layar Penjedaan (blocked.html)
// -------------------------------------------------------------
async function redirectToBlockPage(domain, reason = "limit") {
  try {
    const blockedUrl = chrome.runtime.getURL(
      `blocked.html?domain=${encodeURIComponent(domain)}&mode=${encodeURIComponent(reason)}`
    );

    // Dapatkan semua tab yang sedang membuka domain ini (termasuk www. atau tab latar belakang)
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        const rawUrl = tab.url || tab.pendingUrl || "";
        if (rawUrl && !rawUrl.includes("blocked.html")) {
          const tabDomain = getDomainFromUrl(rawUrl);
          if (matchDomain(tabDomain, domain)) {
            chrome.tabs.update(tab.id, { url: blockedUrl });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Redirect to block page error:", err);
  }
}

// -------------------------------------------------------------
// 3. Core Engine: Real-Time Tab Tracking & Blocker Enforcement
// -------------------------------------------------------------
async function processTimeElapsed() {
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - lastTimestamp) / 1000);

  if (elapsedSeconds <= 0) {
    return;
  }

  // Update timestamp secara bertahap bebas dari drift
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

    const limitMatch = findAutoLimit(lastDomain, autoLimits);
    if (limitMatch && limitMatch.config && limitMatch.config.enabled) {
      const targetDomain = limitMatch.key;

      if (!dailyUsage[todayKey]) {
        dailyUsage[todayKey] = {};
      }
      if (!dailyUsage[todayKey][targetDomain]) {
        dailyUsage[todayKey][targetDomain] = { spentSeconds: 0, notified: false };
      }

      dailyUsage[todayKey][targetDomain].spentSeconds += elapsedSeconds;

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

// -------------------------------------------------------------
// 4. Loop Real-Time (Detik-ke-Detik Presisi)
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

startRealtimeLoop();

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
    isWindowFocused = false;
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
  } else if (alarm.name === "tracker_heartbeat") {
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
  }
  return true;
});
