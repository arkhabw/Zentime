# Zentime — Comprehensive Project & Architecture Summary

> **Document Purpose**: This master document serves as the single source of truth for Zentime. It provides any AI agent, developer, or collaborator with a complete understanding of the product philosophy, technical architecture, feature implementations, design system, release pipeline, and development history.

---

## 1. Executive Overview & Brand Identity

* **Product Name**: Zentime — Web Timer & Screen Time
* **Tagline**: *"Inhale focus • Exhale distraction"*
* **Target Platform**: Google Chrome (Manifest V3 Unpacked Extension & Chrome Web Store)
* **Official Repository**: [https://github.com/arkhabw/Zentime](https://github.com/arkhabw/Zentime)
* **Showcase Landing Page**: [https://arkhabw.github.io/Zentime/](https://arkhabw.github.io/Zentime/)
* **Production Release**: [v1.0.0 on GitHub Releases](https://github.com/arkhabw/Zentime/releases/tag/v1.0.0) (`zentime-v1.0.0.zip`)
* **License**: MIT (Open Source, Local-First, Zero-Telemetry)

### Core Philosophy
Zentime is a distraction-free, mindful web productivity tool. Unlike bloated extensions that rely on cloud accounts, invasive remote telemetry, or coercive blockers, Zentime is:
1. **100% Local-First & Offline**: All timers, analytics, and preferences reside solely in `chrome.storage.local`.
2. **Zero Distraction / Anti-Slop**: Follows strict Cupertino Apple Human Interface Guidelines (HIG), Swiss watchmaker dial aesthetics, continuous squircle curvature, and calm ambient typography.
3. **Compassionate Productivity**: Emphasizes mindful pauses, interstitial breathing intervals, and conscious screen-time limits rather than punitive web blocking.

---

## 2. Repository Structure

```
web-timer-extension/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── background.js             # Service worker: alarms, badge counter, tab tracker, storage
├── popup.html                # Main extension interface popup (Alt+Shift+Z)
├── popup.css                 # Popup design system (dark/light themes, typography, layout)
├── popup.js                  # Popup reactive controller (timers, pomodoro, limits, insights)
├── blocked.html              # Mindful interstitial pause screen (breathing ring + snooze)
├── blocked.css               # Interstitial pause styling & breathing animations
├── blocked.js                # Interstitial pause controller & Web Audio chime trigger
├── audio.html                # Offscreen document audio host for MV3 compliance
├── audio.js                  # Web Audio API procedural chime synthesizer (Tibetan bowl)
├── package.js                # Automated CI/packaging tool: validates syntax, creates dist zip
│
├── icons/                    # Production extension icons
│   ├── icon.svg              # Master vector logo (Zen Chrono Ring in Cupertino squircle)
│   ├── icon16.png            # 16x16 px toolbar icon
│   ├── icon24.png            # 24x24 px toolbar icon
│   ├── icon32.png            # 32x32 px Retina/HiDPI toolbar icon
│   ├── icon48.png            # 48x48 px extensions manager icon
│   └── icon128.png           # 128x128 px Chrome Web Store icon
│
├── fonts/                    # Self-hosted variable fonts (zero external CDN requests)
│   ├── PlusJakartaSans-Variable.woff2
│   └── JetBrainsMono-Variable.woff2
│
├── scripts/                  # Development & generation utilities
│   └── generate_icons.py     # High-contrast master icon generator (PIL/Pillow)
│
├── dist/                     # Distribution bundles
│   └── zentime-v1.0.0.zip    # Production zip archive ready for CWS / GitHub Releases
│
├── docs/                     # GitHub Pages Showcase Website (https://arkhabw.github.io/Zentime/)
│   ├── index.html            # Landing page markup (Hero, Simulator, Bento, Privacy, CTA)
│   ├── landing.css           # Landing page stylesheet (Vignette fluted glass, Cupertino tokens)
│   ├── landing.js            # Landing page controller (Interactive simulator, scroll reveal)
│   ├── logo-showcase.html    # Interactive logo design concept exploration
│   ├── icons/                # Landing page favicons & logo assets
│   ├── assets/               # Screenshots, concept graphics, and media
│   └── fonts/                # Self-hosted web fonts for landing page
│
├── store-assets/             # Chrome Web Store promotional assets & previewer
│   ├── promo-small-440x280.svg
│   ├── promo-marquee-1400x560.svg
│   ├── preview.html          # Interactive visual asset inspector
│   └── screenshots/          # 1280x800 px store showcase mockups
│
├── STORE_LISTING.md          # Chrome Web Store descriptions (EN/ID) & permission justifications
├── PRIVACY_POLICY.md         # Full offline privacy policy disclosure
├── README.md                 # Project README with release badges, install guides & features
└── PROJECT_SUMMARY.md        # This comprehensive documentation file
```

---

## 3. Extension Architecture & Core Features

### 3.1. Manifest V3 Service Worker (`background.js`)
* **Tracking Engine**: Listens to `chrome.tabs.onActivated` and `chrome.tabs.onUpdated` to track active domain screen time per-second.
* **Persistent Storage**: Data structured under `zentime_settings`, `zentime_domains`, `zentime_daily_stats`, and `zentime_pomo_state`.
* **Alarm Pipeline**: Uses `chrome.alarms` for countdown intervals and daily midnight roll-over.
* **Toolbar Badge**: Updates dynamic badge text (e.g., `24m`, `<1m`, `0m`) with high-visibility background colors.
* **Rolling 7-Day Auto-Cleanup**: Midnight scheduler purges tracking entries older than 7 days, maintaining lightweight storage consumption (<150 KB).

### 3.2. Focus Timers with 3 Visual Styles
* **Visual Switcher**: Toggle between:
  1. **SVG Ring**: Animated circular countdown dial with linear SVG dashoffset interpolation.
  2. **Linear Bar**: Sleek horizontal progress line.
  3. **Minimal Digits**: Distraction-free, oversized `tabular-nums` countdown display.
* **Quick Presets**: One-click 15m, 25m, 45m, 60m focus sessions, plus custom minute inputs.

### 3.3. 4-Cycle Structured Pomodoro Mode
* **Standard Cadence**: Focus (default 25m) $\rightarrow$ Short Break (5m) $\rightarrow$ Cycle 2 $\rightarrow$ Cycle 3 $\rightarrow$ Cycle 4 $\rightarrow$ Automatic Long Break (15m).
* **Presets**: Classic (25/5), Deep Work (50/10), Sprint (15/3), and Custom session schedules.

### 3.4. Daily Limits & Mindful Interstitial Pause (`blocked.html`)
* **Soft Enforcing**: When a domain exceeds its daily limit, active tabs navigate to `blocked.html`.
* **Mindful Interstitial Experience**:
  * Features a relaxing pulsating breathing guide (4s inhale, 4s hold, 4s exhale).
  * Plays a soothing procedural Tibetan singing bowl chime synthesized via Web Audio API.
  * Mindful Options:
    * *"Take a 5-Minute Mindful Break"* (snooze with gentle countdown).
    * *"Close Tab & Return to Deep Work"*.

### 3.5. Web Audio API Procedural Synthesizer (`audio.js`)
* **Zero External Audio Assets**: Generates harmonic bell frequencies programmatically using layered oscillators (`sine` + `triangle` with exponential gain decay).
* **Offscreen Document Integration**: Conforms to Manifest V3 background audio policies via `audio.html`.

### 3.6. Global Keyboard Shortcuts & Dynamic Localized Context Menus
* `Alt+Shift+Z`: Instant toggle for Zentime Focus Popup.
* `Alt+Shift+S`: Start 25-minute Pomodoro session on active website.
* `Alt+Shift+B`: Trigger Mindful Interstitial Pause immediately.
* **Dynamic Localized Context Menus (i18n)**: Right-click context menu titles dynamically synchronize with the user's active language selection (`preferredLanguage`: ID / EN) via `chrome.storage.onChanged`:
  * **Indonesian (ID)**:
    * 🍅 *Mulai Fokus 25m di Website Ini*
    * 🛑 *Pasang Batas Harian...*
    * 📊 *Buka Wawasan Layar (7 Hari)*
  * **English (EN)**:
    * 🍅 *Start 25m Focus on this Website*
    * 🛑 *Set Daily Limit...*
    * 📊 *View Screen Time Insights (7 Days)*

---

## 4. Showcase Website & Landing Page (`docs/`)

The showcase page is hosted on GitHub Pages (`https://arkhabw.github.io/Zentime/`) and is built with **zero external dependencies** (pure vanilla HTML/CSS/JS).

### Key Architectural Highlights:
1. **Welcome Zen Curtain Reveal**:
   * Interactive entrance overlay with an animated Enso ring draw, baton clock hand spring reveal, and emerald center pulse.
   * Auto-reveals on scroll or click, with session state persistence.
2. **Vignette-Masked Fluted Glass Background (Reeded Glass)**:
   * 32px cylindrical glass flutes (`repeating-linear-gradient`) featuring specular apex highlights (1px line) and concave depth shading.
   * **Cognitive Vignette Mask**: Employs `-webkit-mask-image: radial-gradient(...)` so the center reading column is 100% serene and noise-free, while the reeded glass softly emerges at the screen margins.
   * **Refracted Ambient Backlight**: Soft top-center white glow and emerald focus aura (`#30D158`) shining from behind the fluted layer.
   * **Analog Film Grain**: Micro-noise SVG texture (`feTurbulence`) preventing 8-bit color banding.
3. **Interactive Live Simulator**:
   * Fully responsive, 1:1 functional emulation of the Chrome extension popup.
   * Users can start/stop timers, toggle between Ring/Bar/Minimal styles, switch between Timer/Pomodoro/Limits/Insights tabs, and trigger the Mindful Break overlay.
   * **Interactive 7-Day Analytics**: Dynamic bar chart (Tue–Mon); clicking any bar filters the site breakdown specifically for that day.
4. **Bento Grid Layout**:
   * 8-column desktop layouts with horizontal 2-column flexbox cards to avoid vertical stretching bugs.
   * Demonstrates Focus Timers, 4-Cycle Pomodoro, 100% Offline Architecture, and Manifest V3 security.

---

## 5. Design System & Anti-Slop Craft Discipline

Zentime adheres strictly to the **Anti-Slop UI standard**:

| Design Token | Dark Mode (Default) | Light Mode | Purpose |
| :--- | :--- | :--- | :--- |
| `--bg-page` | `#09090B` (Obsidian) | `#FBFBFD` (Clean Paper) | Foundation surface |
| `--bg-surface` | `#121215` | `#FFFFFF` | Container background |
| `--border` | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.08)` | Hairline Apple-style dividers |
| `--accent-green` | `#30D158` (Cupertino Green) | `#34C759` | Primary focus & zen indicator |
| `--accent-blue` | `#0A84FF` | `#007AFF` | Secondary active tags |
| `--accent-red` | `#FF453A` | `#FF3B30` | Destructive / Stop timer state |
| `--font-sans` | `Plus Jakarta Sans` | `Plus Jakarta Sans` | Headers, tabs, buttons, labels |
| `--font-mono` | `JetBrains Mono` | `JetBrains Mono` | Tabular numbers, countdowns, timestamps |

* **Continuous Curvature**: Uses Cupertino squircles (`border-radius: 14px`, `22px`, `32px`).
* **Micro-Interactions**: All transitions use Apple spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
* **High Contrast Toolbar Icons**: Enso 270° white arc and emerald pivot are drawn with generous stroke widths to ensure 100% legibility on both dark and light Chrome toolbars.

---

## 6. Build, Packaging & Release Automation

### 6.1. Staging & Zip Tool (`node package.js`)
* Validates JavaScript syntax (`node --check`) for `background.js`, `popup.js`, `blocked.js`, and `audio.js`.
* Automatically reads version from `manifest.json`.
* Stages solely runtime files into a clean temporary directory, excluding `.git`, markdown files, tests, and documentation.
* Produces `dist/zentime-v1.0.0.zip` with SHA256 checksum verification.

### 6.2. GitHub Release Integration
* GitHub Release `v1.0.0` is live at `https://github.com/arkhabw/Zentime/releases/tag/v1.0.0`.
* The release asset `zentime-v1.0.0.zip` is synchronized via the GitHub REST API (`releases/assets`).

---

## 7. Guidelines for Future AI Agents & Maintainers

When continuing work on Zentime, follow these ironclad rules:
1. **Preserve Offline Integrity**: Never introduce remote analytics, tracking pixels, or external CDN dependencies. All fonts, scripts, and audio must remain 100% local.
2. **Respect Manifest V3 Constraints**: Background tasks must use `chrome.alarms` rather than persistent `setInterval` loops. Audio playback must be routed through the offscreen document (`audio.html`).
3. **Maintain Anti-Slop Discipline**:
   - Avoid generic AI blue-to-purple gradient meshes.
   - Restrict glassmorphism to floating accents (navbar, widgets); do not blur every surface.
   - Always pair numerical countdowns with `tabular-nums` in `JetBrains Mono`.
4. **Dual Synchronization**: When updating shared assets (like icons or fonts), ensure both the extension directory (`/icons`, `/fonts`) and the landing page directory (`/docs/icons`, `/docs/fonts`) are synchronized.
5. **Extension Reloading**: Remind users that after changing extension files in developer mode, they must click the **Reload 🔄** button in `chrome://extensions/` for Chrome's icon and background caches to refresh.
