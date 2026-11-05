// blocked.js - Controller for Mindful Interstitial Block Screen

const urlParams = new URLSearchParams(window.location.search);
const blockedDomain = urlParams.get("domain") || "Website";
const mode = urlParams.get("mode") || "limit"; // "timer" | "limit"

const I18N = {
  id: {
    pageTitle: mode === "timer" ? "Zentime - Sesi Selesai" : "Zentime - Saatnya Beristirahat",
    quotaBadge: mode === "timer" ? "Sesi Fokus Selesai" : "Batas Harian Tercapai",
    title: "Saatnya Beristirahat",
    desc: mode === "timer"
      ? `Waktu fokus kamu untuk <strong>${blockedDomain}</strong> telah selesai. Luangkan waktu sejenak untuk rehat dari layar.`
      : `Kamu telah mencapai batas harian untuk <strong>${blockedDomain}</strong>. Luangkan waktu sejenak untuk rehat sejenak dari layar atau beralih ke hal lain.`,
    statSpentLbl: "Digunakan Hari Ini",
    statLimitLbl: mode === "timer" ? "Status Sesi" : "Batas Maksimal",
    closeTabBtn: "Tutup Tab Ini",
    snoozeBtn: mode === "timer" ? "+5 Menit Tambahan" : "Perpanjang 5 Menit Darurat",
    footerNote: "Kelola waktu fokus & batas harian di menu ekstensi",
    timeMin: "m",
    timeSec: "d",
    statusComplete: "Selesai",
  },
  en: {
    pageTitle: mode === "timer" ? "Zentime - Session Complete" : "Zentime - Time for a Break",
    quotaBadge: mode === "timer" ? "Focus Session Ended" : "Daily Limit Reached",
    title: "Time for a Mindful Break",
    desc: mode === "timer"
      ? `Your focus session for <strong>${blockedDomain}</strong> has ended. Take a moment to step back and recharge.`
      : `You've reached your daily screen time quota for <strong>${blockedDomain}</strong>. Take a moment to step back and recharge.`,
    statSpentLbl: "Used Today",
    statLimitLbl: mode === "timer" ? "Session Status" : "Daily Limit",
    closeTabBtn: "Close This Tab",
    snoozeBtn: mode === "timer" ? "+5m Extra Focus" : "+5m Emergency Extension",
    footerNote: "Manage focus timer & site limits in the extension menu",
    timeMin: "m",
    timeSec: "s",
    statusComplete: "Finished",
  },
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMinutesSeconds(totalSeconds, lang) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const minUnit = I18N[lang]?.timeMin || "m";
  const secUnit = I18N[lang]?.timeSec || "d";

  if (mins === 0) return `${secs}${secUnit}`;
  if (secs === 0) return `${mins}${minUnit}`;
  return `${mins}${minUnit} ${secs}${secUnit}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get([
    "preferredTheme",
    "preferredLanguage",
    "autoLimits",
    "dailyUsage",
  ]);

  const lang = data.preferredLanguage || (navigator.language.startsWith("id") ? "id" : "en");
  const theme = data.preferredTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  // Apply Theme & Lang attribute
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("lang", lang);

  // Apply Translations
  const t = I18N[lang] || I18N.id;
  document.title = t.pageTitle;
  document.getElementById("blockedDomain").textContent = blockedDomain;
  document.getElementById("quotaBadge").textContent = t.quotaBadge;
  document.getElementById("blockedTitle").textContent = t.title;
  document.getElementById("blockedDesc").innerHTML = t.desc;
  document.getElementById("statSpentLbl").textContent = t.statSpentLbl;
  document.getElementById("statLimitLbl").textContent = t.statLimitLbl;
  document.getElementById("closeTabBtn").textContent = t.closeTabBtn;
  document.getElementById("snoozeBtn").textContent = t.snoozeBtn;
  document.getElementById("footerNote").textContent = t.footerNote;

  // Load Favicon
  const faviconEl = document.getElementById("blockedFavicon");
  faviconEl.src = `https://www.google.com/s2/favicons?domain=${blockedDomain}&sz=64`;
  faviconEl.onerror = () => {
    faviconEl.src = "icons/icon48.png";
  };

  // Populate Usage Statistics
  const todayKey = getTodayKey();
  const autoLimits = data.autoLimits || {};
  const dailyUsage = data.dailyUsage || {};

  // Find limit config (with subdomain tolerance)
  let limitConfig = autoLimits[blockedDomain];
  if (!limitConfig) {
    const cleanDomain = blockedDomain.toLowerCase().replace(/^www\./, "");
    for (const key of Object.keys(autoLimits)) {
      const cleanKey = key.toLowerCase().replace(/^www\./, "");
      if (cleanDomain === cleanKey || cleanDomain.endsWith("." + cleanKey) || cleanKey.endsWith("." + cleanDomain)) {
        limitConfig = autoLimits[key];
        break;
      }
    }
  }

  // Find usage data (with subdomain tolerance)
  let spentSecs = 0;
  if (dailyUsage[todayKey]) {
    if (dailyUsage[todayKey][blockedDomain]) {
      spentSecs = dailyUsage[todayKey][blockedDomain].spentSeconds;
    } else {
      const cleanDomain = blockedDomain.toLowerCase().replace(/^www\./, "");
      for (const key of Object.keys(dailyUsage[todayKey])) {
        const cleanKey = key.toLowerCase().replace(/^www\./, "");
        if (cleanDomain === cleanKey || cleanDomain.endsWith("." + cleanKey) || cleanKey.endsWith("." + cleanDomain)) {
          spentSecs = dailyUsage[todayKey][key].spentSeconds;
          break;
        }
      }
    }
  }

  document.getElementById("statSpentVal").textContent = formatMinutesSeconds(spentSecs, lang);
  if (mode === "timer" && (!limitConfig || !limitConfig.enabled)) {
    document.getElementById("statLimitVal").textContent = t.statusComplete;
  } else {
    const limitMins = limitConfig ? limitConfig.dailyLimitMinutes : 0;
    document.getElementById("statLimitVal").textContent = `${limitMins}${t.timeMin}`;
  }

  // Action 1: Close Tab
  document.getElementById("closeTabBtn").addEventListener("click", () => {
    chrome.tabs.getCurrent((tab) => {
      if (tab && tab.id) {
        chrome.tabs.remove(tab.id);
      } else {
        window.close();
      }
    });
  });

  // Action 2: +5m Emergency Snooze or Extra Focus
  document.getElementById("snoozeBtn").addEventListener("click", async () => {
    const snoozeTime = Date.now() + 5 * 60 * 1000; // 5 minutes grace period

    if (mode === "timer") {
      const { manualTimers = {} } = await chrome.storage.local.get("manualTimers");
      manualTimers[blockedDomain] = {
        durationMinutes: 5,
        endTime: snoozeTime,
      };
      await chrome.storage.local.set({ manualTimers });
      await chrome.alarms.create(`timer_${blockedDomain}`, { delayInMinutes: 5 });
    }

    const { snoozedUntil = {} } = await chrome.storage.local.get("snoozedUntil");
    snoozedUntil[blockedDomain] = snoozeTime;
    await chrome.storage.local.set({ snoozedUntil });

    chrome.runtime.sendMessage({
      type: "SNOOZE_SITE",
      domain: blockedDomain,
      until: snoozeTime,
    });

    // Redirect user back to the website
    const targetUrl = blockedDomain.startsWith("http://") || blockedDomain.startsWith("https://")
      ? blockedDomain
      : `https://${blockedDomain}`;
    window.location.href = targetUrl;
  });
});
