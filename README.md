# Zentime ⏳

> A clean, distraction-free Chrome extension for site-specific focus timers and daily screen time limits.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Anti--Slop UI](https://img.shields.io/badge/Design-Anti--Slop%20Crafted-emerald.svg)](#design-philosophy)

---

## Overview

**Zentime** is a lightweight, privacy-focused Google Chrome extension designed to help you regain control over your digital habits. Whether you need a short Pomodoro session for writing or want to cap your daily YouTube or social media scrolling to 30 minutes, Zentime gives you the right tools without clutter.

Built strictly under **Manifest V3** with zero external dependencies, Zentime runs fast, uses minimal system resources, and stores all data locally on your device.

---

## Key Features

### ⏱️ Mode 1: Manual Focus Timer
- **Instant Website Countdown**: Target specific websites with a timer (e.g., 25 minutes on GitHub or Docs).
- **Quick Presets**: Single-click presets for `15m`, `25m`, `45m`, and `60m`.
- **Custom Stepper**: Adjust duration up or down in 5-minute increments or input any custom minute count.
- **Precision Countdown**: Large, high-contrast monospace countdown with a linear remaining-time progress bar.
- **Multi-Site Monitor**: Track multiple running timers across different websites simultaneously.

### 🍅 Mode 2: Pomodoro Cycle Tracker & Mindful Breaks
- **Structured Focus & Break Cycles**: Classic 25/5m, Deep Work 50/10m, or Sprint 15/3m sessions with automatic 15-minute long breaks after 4 cycles.
- **Apple HIG Cycle Indicator**: Clean 4-dot visual cycle progress tracker (`● ○ ○ ○`).
- **Automated Mindful Break Redirection**: When a focus session finishes, tabs automatically transition to a serene break screen with a live break countdown and calming breathing animations.
- **Mindful Wellness Prompts**: Rotating health and posture tips during breaks (e.g., 20-20-20 eye rest rule, hydration, deep breathing).
- **One-Click Phase Progression**: Skip breaks early or start the next cycle seamlessly.

### 📊 Mode 3: Daily Screen Time Limits & Mindful Blocker
- **Real-Time Active-Tab Tracking**: Second-by-second precision monitoring when actively focused; automatically pauses the moment you switch tabs or minimize the browser.
- **Configurable Daily Quotas**: Set allowance per website (e.g., 30 minutes on `youtube.com`).
- **Mindful Site Blocker (`blocked.html`)**: Automatically redirects to an aesthetic Apple HIG-styled "Take a Breath" screen when quota is exceeded.
- **Emergency +5m Snooze**: Provides a mindful grace period button (+5m) or a single-click tab closer.
- **Dynamic Usage Bar**: Visual indicators that shift from safe to warning (at 70%) and alert states (at 100%).
- **Site Management Feed**: View and delete tracked websites with one click.

### 🔔 System Notifications, Audio Chimes & Live Badges
- **10-Second Gentle Audio Chime**: Calming harmonic chords synthesized via pure Web Audio API when timers finish or quotas are hit.
- **Desktop Alerts**: Receive system notifications via `chrome.notifications` the moment a timer finishes or a daily limit is reached.
- **Toolbar Icon Badge**: Real-time remaining minutes badge displayed directly on the extension icon in Chrome's toolbar.

### 🌗 Light & Dark Theme
- **Dual-Theme Support**: Seamlessly toggles between high-contrast Matte Light and Obsidian Dark modes.
- **System Preference Aware**: Automatically adapts to your operating system's color scheme (`prefers-color-scheme`).

### 🌐 Bilingual Support (English & Indonesian)
- **Instant Language Slider**: Switch on the fly between English (`EN`) and Indonesian (`ID`) via a smooth, tactile header slider switch.
- **Persistent Localization**: Automatically remembers your preferred language and localizes the entire interface, status indicators, and desktop notifications.

---

## Design Philosophy

Zentime is crafted with strict **Anti-Slop UI** discipline:
- **No Generic AI Gimmicks**: Free of decorative status dots, blurred glow halos, rainbow gradients, and excessive pill-shaped capsules.
- **Typography-First Hierarchy**: High-contrast, tabular monospace numbers for zero layout jitter.
- **Accessibility & Contrast**: Conforms to WCAG AA contrast standards (> 5:1) with visible `:focus-visible` keyboard navigation.
- **Minimal Footprint**: Clean vanilla JavaScript, semantic HTML5, and pure CSS. No bloated node modules or framework overhead.

---

## Installation (Developer Mode)

Since Zentime is an unpacked extension, you can install it in Google Chrome in less than a minute:

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/arkhabw/Zentime.git
   ```
2. **Open Chrome Extensions Manager**:
   - In Chrome's address bar, navigate to: `chrome://extensions/`
3. **Enable Developer Mode**:
   - Toggle the **Developer mode** switch in the top-right corner.
4. **Load Unpacked Extension**:
   - Click the **Load unpacked** button in the top-left corner.
   - Select the `Zentime` directory (where `manifest.json` is located).
5. **Pin to Toolbar**:
   - Click the puzzle icon (Extensions) in your browser toolbar and pin **Zentime** for easy access.

---

## How It Works

```
┌─────────────────┐      Tabs / Window Focus Events      ┌──────────────────────┐
│   Active Tab    │ ───────────────────────────────────> │  background.js (SW)  │
└─────────────────┘                                      └──────────┬───────────┘
                                                                    │
                        ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
                        │                                           │                                           │
                        ▼                                           ▼                                           ▼
             ┌─────────────────────┐                     ┌─────────────────────┐                     ┌─────────────────────┐
             │    chrome.alarms    │                     │   chrome.storage    │                     │chrome.notifications │
             │  (Accurate Timing)  │                     │   (Local & Private) │                     │  (Desktop Alerts)   │
             └─────────────────────┘                     └─────────────────────┘                     └─────────────────────┘
```

1. **Service Worker (`background.js`)**: Tracks tab activations (`chrome.tabs.onActivated`), window focus changes (`chrome.windows.onFocusChanged`), and schedules alarms via `chrome.alarms`.
2. **Local Storage (`chrome.storage.local`)**: Stores active manual timers and daily usage counters organized by date key (`YYYY-MM-DD`).
3. **Interface (`popup.html` & `popup.js`)**: Instant feedback UI with zero external network requests.

---

## Project Structure

```text
Zentime/
├── icons/
│   ├── icon16.png        # Toolbar icon (16x16)
│   ├── icon48.png        # Extension management icon (48x48)
│   └── icon128.png       # Web Store & notification icon (128x128)
├── audio.html            # Offscreen document host for Web Audio
├── audio.js              # Synthesized 10s tranquil harmonic bell chime
├── background.js         # Service worker (real-time tracking, blocker, alarms)
├── blocked.html          # Mindful "Take a Breath" screen (Option A)
├── blocked.css           # Apple HIG styling for mindful blocker
├── blocked.js            # Interstitial logic (Close Tab & +5m snooze)
├── manifest.json         # Extension configuration & MV3 permissions
├── popup.html            # Main popup interface
├── popup.css             # Anti-slop matte styling & dark mode tokens
├── popup.js              # UI controller, timer loops, & storage sync
└── README.md             # Project documentation
```

---

## Permissions & Privacy

Zentime adheres to the principle of least privilege:

| Permission | Purpose |
|---|---|
| `tabs` | Identifies current domain name to attach timers and measure active tab time. |
| `alarms` | Runs reliable background alarms even when the popup is closed. |
| `notifications` | Notifies you when a focus session ends or a screen time limit is hit. |
| `storage` | Stores your timer preferences and daily usage locally on your machine. |

> **Privacy Guarantee**: Zentime does **not** collect, track, or transmit any browsing history or personal data. Everything remains strictly inside your local browser.

---

## License

This project is licensed under the [MIT License](LICENSE) - feel free to modify and use it for your own focus workflows.
