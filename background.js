// background.js - Service Worker for Zentime (Web Timer & Screen Time)

let lastDomain = "";
let lastTimestamp = Date.now();
let isWindowFocused = true;

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
    // URL tidak valid (misal chrome://)
  }
  return "";
}

// -------------------------------------------------------------
// 1. Core Engine: Pelacakan Waktu Aktif (Screen Time Tracker)
// -------------------------------------------------------------
async function processTimeElapsed() {
  const now = Date.now();
  const elapsedSeconds = Math.round((now - lastTimestamp) / 1000);

  // Update akumulasi waktu jika domain sebelumnya valid dan window sedang aktif
  if (lastDomain && isWindowFocused && elapsedSeconds > 0 && elapsedSeconds < 3600) {
    const todayKey = getTodayKey();
    const { autoLimits = {}, dailyUsage = {} } = await chrome.storage.local.get([
      "autoLimits",
      "dailyUsage",
    ]);

    // Jika domain ini memiliki aturan batas harian
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

      // Cek apakah kuota harian habis dan belum diberi notifikasi hari ini
      if (currentSpent >= limitSeconds && !dailyUsage[todayKey][lastDomain].notified) {
        dailyUsage[todayKey][lastDomain].notified = true;

        chrome.notifications.create(`autolimit_${lastDomain}_${Date.now()}`, {
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "🛑 Batas Harian Tercapai!",
          message: `Kamu sudah menggunakan ${lastDomain} selama ${limitMinutes} menit hari ini. Saatnya beristirahat!`,
          priority: 2,
          requireInteraction: true,
        });
      }

      await chrome.storage.local.set({ dailyUsage });
    }
  }

  lastTimestamp = now;

  // Cari domain aktif saat ini
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    lastDomain = activeTab ? getDomainFromUrl(activeTab.url) : "";
  } catch {
    lastDomain = "";
  }

  await updateBadge();
}

// -------------------------------------------------------------
// 2. Event Listeners untuk Pergantian Tab & Jendela
// -------------------------------------------------------------

// Ketika user berpindah tab
chrome.tabs.onActivated.addListener(async () => {
  await processTimeElapsed();
});

// Ketika URL tab berubah atau selesai dimuat
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    await processTimeElapsed();
  }
});

// Ketika user minimize browser atau berpindah ke aplikasi lain
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser kehilangan fokus (user buka aplikasi lain)
    await processTimeElapsed();
    isWindowFocused = false;
  } else {
    // Browser kembali aktif
    isWindowFocused = true;
    lastTimestamp = Date.now();
    await processTimeElapsed();
  }
});

// Alarm berkala (setiap 1 menit) untuk memastikan waktu selalu terhitung
chrome.alarms.create("tracker_heartbeat", { periodInMinutes: 1 });

// -------------------------------------------------------------
// 3. Listener Alarm (Mode 1 Manual Timer & Heartbeat Mode 2)
// -------------------------------------------------------------
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith("timer_")) {
    // MODE 1: Timer Manual Selesai
    const domain = alarm.name.replace("timer_", "");
    const { manualTimers = {} } = await chrome.storage.local.get("manualTimers");
    const timerInfo = manualTimers[domain];

    delete manualTimers[domain];
    await chrome.storage.local.set({ manualTimers });

    chrome.notifications.create(`alarm_${domain}_${Date.now()}`, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "⏰ Waktu Habis!",
      message: `Waktu kamu untuk ${domain} (${timerInfo?.durationMinutes || ''} menit) sudah selesai!`,
      priority: 2,
      requireInteraction: true,
    });

    await updateBadge();
  } else if (alarm.name === "tracker_heartbeat" || alarm.name === "badge_updater") {
    // MODE 2: Heartbeat kalkulasi waktu harian & badge
    await processTimeElapsed();
  }
});

// -------------------------------------------------------------
// 4. Update Badge Icon Toolbar
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

    // Prioritas 1: Jika Mode 1 (Manual Timer) sedang aktif untuk website ini
    const manual = manualTimers[domain];
    if (manual && manual.endTime > Date.now()) {
      const remainingMs = manual.endTime - Date.now();
      const remainingMins = Math.ceil(remainingMs / 60000);

      chrome.action.setBadgeBackgroundColor({ color: "#EF4444" }); // Merah
      chrome.action.setBadgeText({ text: remainingMins <= 1 ? "<1m" : `${remainingMins}m` });
      return;
    }

    // Prioritas 2: Jika Mode 2 (Batas Harian) aktif untuk website ini
    const autoLimit = autoLimits[domain];
    if (autoLimit && autoLimit.enabled) {
      const todayKey = getTodayKey();
      const usage = dailyUsage[todayKey]?.[domain];
      const spentSecs = usage ? usage.spentSeconds : 0;
      const limitSecs = autoLimit.dailyLimitMinutes * 60;
      const remainingSecs = Math.max(0, limitSecs - spentSecs);
      const remainingMins = Math.ceil(remainingSecs / 60);

      if (remainingSecs <= 0) {
        chrome.action.setBadgeBackgroundColor({ color: "#DC2626" }); // Merah gelap
        chrome.action.setBadgeText({ text: "0m" });
      } else if (remainingMins <= 5) {
        chrome.action.setBadgeBackgroundColor({ color: "#F59E0B" }); // Oranye peringatan
        chrome.action.setBadgeText({ text: `${remainingMins}m` });
      } else {
        chrome.action.setBadgeBackgroundColor({ color: "#4F46E5" }); // Indigo tenang
        chrome.action.setBadgeText({ text: `${remainingMins}m` });
      }
      return;
    }

    // Tidak ada timer untuk website ini
    chrome.action.setBadgeText({ text: "" });
  } catch (err) {
    console.error("Gagal update badge:", err);
  }
}

// -------------------------------------------------------------
// 5. Pesan dari Popup
// -------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TIMER_UPDATED" || message.type === "AUTO_LIMIT_UPDATED") {
    processTimeElapsed().then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  }
  return true;
});
