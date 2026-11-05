// blocked.js - Controller for Mindful Interstitial Block Screen

const urlParams = new URLSearchParams(window.location.search);
const blockedDomain = urlParams.get("domain") || "Website";

const I18N = {
  id: {
    pageTitle: "Zentime - Saatnya Beristirahat",
    quotaBadge: "Batas Harian Tercapai",
    title: "Saatnya Beristirahat",
    desc: `Kamu telah mencapai batas harian untuk <strong>${blockedDomain}</strong>. Luangkan waktu sejenak untuk rehat sejenak dari layar atau beralih ke hal lain.`,
    statSpentLbl: "Digunakan Hari Ini",
    statLimitLbl: "Batas Maksimal",
    closeTabBtn: "Tutup Tab Ini",
    snoozeBtn: "Perpanjang 5 Menit Darurat",
    footerNote: "Kelola batas waktu di menu ekstensi",
    timeMin: "m",
    timeSec: "d",
  },
  en: {
    pageTitle: "Zentime - Time for a Break",
    quotaBadge: "Daily Limit Reached",
    title: "Time for a Mindful Break",
    desc: `You've reached your daily screen time quota for <strong>${blockedDomain}</strong>. Take a moment to step back and recharge.`,
    statSpentLbl: "Used Today",
    statLimitLbl: "Daily Limit",
    closeTabBtn: "Close This Tab",
    snoozeBtn: "+5m Emergency Extension",
    footerNote: "Manage site limits in the extension menu",
    timeMin: "m",
    timeSec: "s",
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

  const limitConfig = autoLimits[blockedDomain];
  const usageData = dailyUsage[todayKey]?.[blockedDomain];

  const spentSecs = usageData ? usageData.spentSeconds : 0;
  const limitMins = limitConfig ? limitConfig.dailyLimitMinutes : 0;

  document.getElementById("statSpentVal").textContent = formatMinutesSeconds(spentSecs, lang);
  document.getElementById("statLimitVal").textContent = `${limitMins}${t.timeMin}`;

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

  // Action 2: +5m Emergency Snooze
  document.getElementById("snoozeBtn").addEventListener("click", async () => {
    const { snoozedUntil = {} } = await chrome.storage.local.get("snoozedUntil");
    const snoozeTime = Date.now() + 5 * 60 * 1000; // 5 minutes grace period
    snoozedUntil[blockedDomain] = snoozeTime;

    await chrome.storage.local.set({ snoozedUntil });
    chrome.runtime.sendMessage({
      type: "SNOOZE_SITE",
      domain: blockedDomain,
      until: snoozeTime,
    });

    // Redirect user back to the website
    window.location.href = `https://${blockedDomain}`;
  });
});
