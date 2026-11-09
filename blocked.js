// blocked.js - Controller for Mindful Interstitial Block Screen (Supports Limits, Timers & Pomodoro)

const urlParams = new URLSearchParams(window.location.search);
const blockedDomain = urlParams.get("domain") || "Website";
const mode = urlParams.get("mode") || "limit"; // "timer" | "limit" | "pomodoro"

const MINDFUL_TIPS = {
  id: [
    { icon: "💧", text: "Minum segelas air putih untuk menjaga hidrasi dan fokus tubuhmu." },
    { icon: "👀", text: "Aturan 20-20-20: Tatap objek berjarak 6 meter selama 20 detik untuk mengistirahatkan mata." },
    { icon: "🧘", text: "Tarik napas perlahan 4 detik, tahan 4 detik, lalu hembuskan perlahan 4 detik." },
    { icon: "🚶", text: "Berdiri sejenak dan regangkan pundak, leher, serta punggungmu dari posisi duduk." },
    { icon: "🌿", text: "Pejamkan mata sejenak untuk mengistirahatkan saraf mata dari paparan cahaya layar." },
  ],
  en: [
    { icon: "💧", text: "Drink a glass of water to keep your body hydrated and refreshed." },
    { icon: "👀", text: "20-20-20 Rule: Look at an object 20 feet away for 20 seconds to relax your eyes." },
    { icon: "🧘", text: "Inhale slowly for 4 seconds, hold for 4 seconds, then exhale for 4 seconds." },
    { icon: "🚶", text: "Stand up and gently stretch your shoulders, neck, and back." },
    { icon: "🌿", text: "Rest your eyes for a brief moment away from bright digital displays." },
  ],
};

const I18N = {
  id: {
    pageTitle: mode === "pomodoro" ? "Zentime - Istirahat Pomodoro" : (mode === "timer" ? "Zentime - Sesi Selesai" : "Zentime - Saatnya Beristirahat"),
    quotaBadge: mode === "pomodoro" ? "🍅 Istirahat Pomodoro" : (mode === "timer" ? "Sesi Fokus Selesai" : "Batas Harian Tercapai"),
    pomoBadgeCycle: (cycle, total = 4) => `🍅 Istirahat Pomodoro • Siklus ${cycle}/${total}`,
    title: "Saatnya Beristirahat",
    desc: mode === "pomodoro"
      ? `Sesi fokus untuk <strong>${blockedDomain}</strong> selesai. Luangkan waktu sejenak untuk rehat dari layar.`
      : (mode === "timer"
        ? `Waktu fokus kamu untuk <strong>${blockedDomain}</strong> telah selesai. Luangkan waktu sejenak untuk rehat dari layar.`
        : `Kamu telah mencapai batas harian untuk <strong>${blockedDomain}</strong>. Luangkan waktu sejenak untuk rehat sejenak dari layar atau beralih ke hal lain.`),
    statSpentLbl: "Digunakan Hari Ini",
    statLimitLbl: mode === "timer" ? "Status Sesi" : "Batas Maksimal",
    continueBtn: "Lanjutkan ke Website",
    closeTabBtn: "Tutup Tab Ini",
    snoozeBtn: mode === "timer" ? "+5 Menit Tambahan" : "Perpanjang 5 Menit Darurat",
    pomoResumeBtn: "Lewati Istirahat & Lanjut Fokus",
    pomoBreakCompleteBadge: "☕ Istirahat Selesai",
    pomoBreakCompleteTitle: "Pikiranmu Sudah Segar",
    pomoBreakCompleteDesc: "Waktu istirahat telah selesai. Siap untuk memulai siklus fokus berikutnya?",
    pomoStartNextBtn: "Mulai Sesi Fokus Berikutnya",
    footerNote: "Kelola waktu fokus & batas harian di menu ekstensi",
    timeMin: "m",
    timeSec: "d",
    statusComplete: "Selesai",
  },
  en: {
    pageTitle: mode === "pomodoro" ? "Zentime - Pomodoro Break" : (mode === "timer" ? "Zentime - Session Complete" : "Zentime - Time for a Break"),
    quotaBadge: mode === "pomodoro" ? "🍅 Pomodoro Break" : (mode === "timer" ? "Focus Session Ended" : "Daily Limit Reached"),
    pomoBadgeCycle: (cycle, total = 4) => `🍅 Pomodoro Break • Cycle ${cycle}/${total}`,
    title: "Time for a Mindful Break",
    desc: mode === "pomodoro"
      ? `Focus session for <strong>${blockedDomain}</strong> is complete. Take a mindful break away from the screen.`
      : (mode === "timer"
        ? `Your focus session for <strong>${blockedDomain}</strong> has ended. Take a moment to step back and recharge.`
        : `You've reached your daily screen time quota for <strong>${blockedDomain}</strong>. Take a moment to step back and recharge.`),
    statSpentLbl: "Used Today",
    statLimitLbl: mode === "timer" ? "Session Status" : "Daily Limit",
    continueBtn: "Continue to Website",
    closeTabBtn: "Close This Tab",
    snoozeBtn: mode === "timer" ? "+5m Extra Focus" : "+5m Emergency Extension",
    pomoResumeBtn: "Skip Break & Resume Focus",
    pomoBreakCompleteBadge: "☕ Break Complete",
    pomoBreakCompleteTitle: "Your Mind is Refreshed",
    pomoBreakCompleteDesc: "Your break has ended. Ready for your next focus session?",
    pomoStartNextBtn: "Start Next Focus Session",
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
    "pomodoroSessions",
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
  const initialCycle = urlParams.get("cycle") || "1";
  const totalCyclesParam = urlParams.get("totalCycles") || "4";
  document.getElementById("quotaBadge").textContent = (mode === "pomodoro" && t.pomoBadgeCycle)
    ? t.pomoBadgeCycle(initialCycle, totalCyclesParam)
    : t.quotaBadge;
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

  // -------------------------------------------------------------
  // Mode Khusus: POMODORO BREAK MODE
  // -------------------------------------------------------------
  const pomoBreakBox = document.getElementById("pomoBreakBox");
  const pomoBreakCountdown = document.getElementById("pomoBreakCountdown");
  const pomoBreakFill = document.getElementById("pomoBreakFill");
  const pomoResumeBtn = document.getElementById("pomoResumeBtn");
  const continueBtn = document.getElementById("continueBtn");
  const snoozeBtn = document.getElementById("snoozeBtn");
  const closeTabBtn = document.getElementById("closeTabBtn");
  const blockedActions = document.querySelector(".blocked-actions");
  const usageStatCard = document.getElementById("usageStatCard");
  const mindfulTipText = document.getElementById("mindfulTipText");

  if (mode === "timer") {
    if (continueBtn) {
      continueBtn.classList.remove("hidden");
      continueBtn.className = "btn-primary";
      continueBtn.textContent = t.continueBtn;
    }
    closeTabBtn.className = "btn-subtle";
    snoozeBtn.className = "btn-subtle";
    if (blockedActions && snoozeBtn && closeTabBtn) {
      blockedActions.insertBefore(snoozeBtn, closeTabBtn);
    }
  }

  if (mode === "pomodoro") {
    pomoBreakBox.classList.remove("hidden");
    pomoResumeBtn.classList.remove("hidden");
    snoozeBtn.classList.add("hidden");
    usageStatCard.classList.add("hidden");
    closeTabBtn.className = "btn-subtle";

    // Set Random Mindful Tip
    const tips = MINDFUL_TIPS[lang] || MINDFUL_TIPS.id;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    if (randomTip) {
      document.querySelector(".tip-icon").textContent = randomTip.icon;
      mindfulTipText.textContent = randomTip.text;
    }

    let pomoInterval = null;

    async function syncPomoBreak() {
      const store = await chrome.storage.local.get("pomodoroSessions");
      const session = store.pomodoroSessions?.[blockedDomain];

      if (!session) return;

      const now = Date.now();
      const remainingMs = Math.max(0, session.endTime - now);
      const totalSecs = Math.floor(remainingMs / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      pomoBreakCountdown.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      const totalDuration = (session.endTime - session.startTime) || 1;
      const elapsed = Math.max(0, now - session.startTime);
      const pct = Math.max(0, Math.min(100, (1 - elapsed / totalDuration) * 100));
      pomoBreakFill.style.width = `${pct}%`;

      const totalCycles = session?.totalCycles || parseInt(urlParams.get("totalCycles"), 10) || 4;
      if (session.phase === "break") {
        document.getElementById("quotaBadge").textContent = t.pomoBadgeCycle
          ? t.pomoBadgeCycle(session.cycle, totalCycles)
          : `${t.quotaBadge} • ${session.cycle}/${totalCycles}`;
        pomoResumeBtn.textContent = t.pomoResumeBtn;
      }

      if (remainingMs <= 0 || session.phase === "break_ended") {
        clearInterval(pomoInterval);
        document.getElementById("quotaBadge").textContent = t.pomoBreakCompleteBadge;
        document.getElementById("blockedTitle").textContent = t.pomoBreakCompleteTitle;
        document.getElementById("blockedDesc").innerHTML = t.pomoBreakCompleteDesc;
        pomoBreakCountdown.textContent = "00:00";
        pomoBreakFill.style.width = "0%";
        pomoResumeBtn.textContent = `${t.pomoStartNextBtn} (${session.focusMinutes}m)`;
      }
    }

    syncPomoBreak();
    pomoInterval = setInterval(syncPomoBreak, 1000);

    // Event listener on Resume / Skip Break
    pomoResumeBtn.addEventListener("click", async () => {
      pomoResumeBtn.disabled = true;
      const store = await chrome.storage.local.get("pomodoroSessions");
      const session = store.pomodoroSessions?.[blockedDomain];

      const totalCycles = session ? (session.totalCycles || 4) : 4;
      const nextCycle = (session && session.phase === "break_ended")
        ? session.cycle
        : (session ? (session.cycle >= totalCycles ? 1 : session.cycle + 1) : 1);

      await chrome.runtime.sendMessage({
        type: "START_POMODORO",
        domain: blockedDomain,
        focusMinutes: session ? session.focusMinutes : 25,
        breakMinutes: session ? session.breakMinutes : 5,
        totalCycles: totalCycles,
        longBreakMinutes: 15,
        cycle: nextCycle,
      });

      // Redirect kembali ke website (atau URL halaman asal jika ada)
      const origUrl = urlParams.get("originalUrl");
      const defaultUrl = blockedDomain.startsWith("http://") || blockedDomain.startsWith("https://")
        ? blockedDomain
        : `https://${blockedDomain}`;
      const targetUrl = (origUrl && origUrl.startsWith("http"))
        ? origUrl
        : (session && session.originalUrl && session.originalUrl.startsWith("http") ? session.originalUrl : defaultUrl);
      window.location.href = targetUrl;
    });

    // Listen to background break ended notification
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "POMODORO_BREAK_ENDED" && msg.domain === blockedDomain) {
        syncPomoBreak();
      }
    });
  }

  // Action: Continue to Website (Mode Timer)
  if (continueBtn) {
    continueBtn.addEventListener("click", async () => {
      continueBtn.disabled = true;

      try {
        // 1. Bersihkan timer manual yang mungkin tersisa
        const { manualTimers = {} } = await chrome.storage.local.get("manualTimers");
        if (manualTimers[blockedDomain]) {
          delete manualTimers[blockedDomain];
          await chrome.storage.local.set({ manualTimers });
        }
        await chrome.alarms.clear(`timer_${blockedDomain}`);

        // 2. Beri grace period jika domain memiliki auto-limit aktif yang tercapai
        const { autoLimits = {}, snoozedUntil = {} } = await chrome.storage.local.get([
          "autoLimits",
          "snoozedUntil",
        ]);
        const limitMatch = autoLimits[blockedDomain];
        if (limitMatch && limitMatch.enabled) {
          const graceTime = Date.now() + 10 * 60 * 1000;
          snoozedUntil[blockedDomain] = graceTime;
          await chrome.storage.local.set({ snoozedUntil });
          chrome.runtime.sendMessage({
            type: "SNOOZE_SITE",
            domain: blockedDomain,
            until: graceTime,
          });
        }

        // 3. Notifikasi background untuk unblock tab lain domain ini
        await chrome.runtime.sendMessage({
          type: "CONTINUE_SITE",
          domain: blockedDomain,
        });
      } catch (err) {
        console.warn("Continue site error:", err);
      }

      // 4. Redirect tab ke URL asal atau beranda website
      const origUrl = urlParams.get("originalUrl");
      const defaultUrl = blockedDomain.startsWith("http://") || blockedDomain.startsWith("https://")
        ? blockedDomain
        : `https://${blockedDomain}`;
      const targetUrl = (origUrl && origUrl.startsWith("http")) ? origUrl : defaultUrl;
      window.location.href = targetUrl;
    });
  }

  // Action: Close Tab
  closeTabBtn.addEventListener("click", () => {
    chrome.tabs.getCurrent((tab) => {
      if (tab && tab.id) {
        chrome.tabs.remove(tab.id);
      } else {
        window.close();
      }
    });
  });

  // Action: +5m Emergency Snooze (Mode Limit / Timer)
  snoozeBtn.addEventListener("click", async () => {
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

    // Redirect user back to the website (or original page URL)
    const origUrl = urlParams.get("originalUrl");
    const defaultUrl = blockedDomain.startsWith("http://") || blockedDomain.startsWith("https://")
      ? blockedDomain
      : `https://${blockedDomain}`;
    const targetUrl = (origUrl && origUrl.startsWith("http")) ? origUrl : defaultUrl;
    window.location.href = targetUrl;
  });
});
