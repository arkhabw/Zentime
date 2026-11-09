# Zentime — Chrome Web Store Listing & Submission Metadata

> **Developer Console URL**: [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)  
> **Package File**: `dist/zentime-v1.0.0.zip`

---

## 🏷️ Basic Information

- **Extension Name**: `Zentime - Web Timer & Screen Time` (34 characters — limit 45)
- **Category**: `Productivity`
- **Language**: `English` / `Indonesian`
- **Pricing**: `Free` (No in-app purchases, no subscriptions)

---

## 📝 Short Description (132 characters limit)

### English (Default):
```text
Mindful focus timer, daily website limits, and 7-day screen time analytics. Stay in flow with zero distractions.
```
*(111 characters)*

### Indonesian (ID Store Locale):
```text
Timer fokus, batas pemakaian web harian, dan analitik layar 7 hari. Tetap fokus dan produktif tanpa distraksi.
```
*(111 characters)*

---

## 📄 Detailed Description

*(Copy and paste the markdown below into the Chrome Web Store Detailed Description box)*

```markdown
Zentime is a mindful web timer and screen time companion designed to help you regain focus, curb social media doomscrolling, and build healthier digital habits — without rigid locks or invasive tracking.

Unlike aggressive blockers that cause frustration, Zentime combines gentle mindful friction, structured Pomodoro flows, daily domain limits, and private 7-day visual insights to keep you intentional about where your attention goes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ CORE CAPABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ⏱️ INTENTIONAL FOCUS TIMER
• Track active screen time per website in real time.
• Choose between open-ended Count-Up or focused Count-Down timers.
• Automatically pauses when you switch tabs or minimize the browser window.

2. 🍅 ADAPTIVE POMODORO SESSIONS
• Structured 25m Focus / 5m Short Break / 15m Long Break intervals.
• Visual circular progress ring with estimated completion time.
• Auto-advancing cycle counter (1 of 4).
• Gentle 10-second acoustic chime (synthesized Tibetan singing bowl via Web Audio API) with one-click mute toggle.

3. 🛑 MINDFUL INTERSTITIAL BLOCKER
• Set daily usage quotas (e.g., 30m/day for social media or news sites).
• When your limit is reached, Zentime greets you with a calm, full-screen breathing pause instead of an error message.
• Includes an emergency "+5 Menit" snooze button with deliberate friction for urgent tasks.

4. 📊 7-DAY SCREEN TIME INSIGHTS
• Pure CSS/SVG interactive 7-day bar chart (zero external dependencies).
• Day-by-day drilldown: click any day (e.g., Friday) to inspect top visited sites for that specific date.
• Privacy-first rolling retention: older analytics are automatically purged after 7 days.

5. ⌨️ POWER-USER SHORTCUTS & CONTEXT MENUS
• Alt + Shift + Z: Instantly toggle the Zentime popup.
• Alt + Shift + S: Quick-start a 25m Pomodoro focus session on the active website.
• Alt + Shift + B: Trigger an instant mindful pause on the active tab.
• Right-click any webpage to quickly set limits or launch focus sessions.
• Customizable via chrome://extensions/shortcuts.

6. 🎨 CRAFTED WITH CARE
• Native Cupertino-inspired design with Apple Human Interface continuous curvature.
• Seamless Dark & Light modes with automatic system detection.
• Full bilingual support: Bahasa Indonesia & English.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 100% PRIVATE & OFFLINE BY DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ZERO accounts or logins required.
• ZERO telemetry, analytics servers, or third-party trackers.
• ZERO remote cloud transmission. All data stays strictly in your browser's encrypted local storage (`chrome.storage.local`).
• Open, transparent, and completely offline.

Take back control of your screen time today with Zentime.
```

---

## 🛡️ Single-Purpose Description (Mandatory for Reviewers)

```text
Zentime is a single-purpose digital wellbeing and productivity extension that helps users stay focused and reduce digital distractions through active per-website timers, customizable daily usage quotas with mindful interstitial pause screens, Pomodoro focus cycles, and private 7-day screen time analytics.
```

---

## 🔑 Permission Justifications (For Developer Console Form)

| Permission | Developer Justification (Copy-Paste) |
| :--- | :--- |
| **`tabs`** | Used exclusively to read the hostname of the active tab in order to measure browsing time, enforce configured daily website limits, and redirect the tab to the local mindful block screen (`blocked.html`) when quotas are reached. Zentime never reads tab content, DOM nodes, passwords, or browsing history. |
| **`alarms`** | Used to schedule battery-efficient, reliable periodic intervals for the Pomodoro focus/break countdowns and notification dispatching in the Manifest V3 background service worker. |
| **`notifications`** | Used to deliver native desktop notifications alerting the user when a Pomodoro focus interval finishes, a break period concludes, or a daily website quota has been reached. |
| **`storage`** | Used to persist user configuration (daily domain quotas, Pomodoro settings, theme, audio toggle) and rolling 7-day aggregated screen time data purely locally in `chrome.storage.local`. No data is ever transmitted to remote servers. |
| **`offscreen`** | Manifest V3 service workers cannot access the DOM or the Web Audio API. Zentime uses a minimal sandboxed offscreen document (`audio.html`) strictly to synthesize gentle audio chime alerts when a focus timer completes. |
| **`contextMenus`** | Used to display convenient right-click options on webpages so users can quickly initiate a 25-minute Pomodoro session or configure a daily screen time limit for the active domain without opening the popup. |

---

## 🌐 Host Permissions / Remote Code

- **Host Permissions**: `None` (Zentime does NOT request `<all_urls>` or any wildcards).
- **Remote Code**: `None` (Zentime does NOT execute any remote JavaScript, does not use CDNs, and bundles all fonts and icons locally).
- **Data Usage Disclosure**: Select **"No, I am not collecting or using user data"** in the Privacy Practices section.

---

## 🖼️ Store Graphics Checklist

| Asset | Dimensions | Status |
| :--- | :--- | :--- |
| **Small Promo Tile** | 440 x 280 px | Generated in `store-assets/` |
| **Marquee Promo Tile** | 1400 x 560 px | Generated in `store-assets/` |
| **Screenshot 1 (Timer & Pomodoro)** | 1280 x 800 px | Generated in `store-assets/` |
| **Screenshot 2 (Mindful Interstitial)** | 1280 x 800 px | Generated in `store-assets/` |
| **Screenshot 3 (7-Day Insights)** | 1280 x 800 px | Generated in `store-assets/` |
| **Screenshot 4 (Settings & Shortcuts)** | 1280 x 800 px | Generated in `store-assets/` |
