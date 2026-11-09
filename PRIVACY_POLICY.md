# Privacy Policy for Zentime

**Last Updated:** November 9, 2026  
**Effective Date:** November 9, 2026  

---

## 1. Introduction
Zentime ("we", "our", or "the extension") is a lightweight web timer, screen time limiter, and productivity extension developed for Google Chrome. 

We believe privacy is a fundamental human right. Zentime was built from the ground up with a strict **Privacy-by-Design** and **100% Offline** architecture. This Privacy Policy outlines our data handling practices.

---

## 2. Information We Do NOT Collect
- **No Personal Identifiable Information (PII)**: We do not collect names, email addresses, IP addresses, physical locations, or device identifiers.
- **No Browsing Content or Keystrokes**: We do not inspect web page contents, DOM trees, form entries, cookies, passwords, or personal communications.
- **No Browsing History**: We do not record or sync your browser history.
- **No Analytics / Telemetry**: We do not use Google Analytics, Mixpanel, Sentry, or any third-party tracking SDKs.
- **No Remote Servers**: Zentime does not operate any backend servers or cloud databases.

---

## 3. Information Handled Locally on Your Device
All information processed by Zentime resides exclusively on your local device within Chrome's sandboxed `chrome.storage.local` environment:

1. **Active Domain Hostnames**: When you visit a website, Zentime reads only the hostname (e.g., `youtube.com`) to calculate active screen time and enforce user-configured daily limits.
2. **User Preferences**: Your chosen theme (Dark/Light), language (Indonesian/English), audio toggle state, and configured website limits.
3. **Aggregated Screen Time Data**: Rolling daily total active seconds per domain (e.g., `youtube.com: 1800s`).
4. **Data Retention & Automatic Purging**: Usage statistics are retained for a rolling window of **7 days only**. Data older than 7 days is automatically and permanently purged from local storage.

---

## 4. Permissions Usage
Zentime requests the minimum necessary permissions required to deliver its core functionality:
- **`tabs`**: Required to read the URL hostname of the currently active tab for time tracking and to navigate to the mindful interstitial block page (`blocked.html`) when a daily limit is reached.
- **`alarms`**: Used to schedule reliable background countdown timers for Pomodoro intervals and notifications.
- **`notifications`**: Used to display local desktop notifications when a focus cycle finishes.
- **`storage`**: Used to save settings and 7-day usage metrics locally on your machine.
- **`offscreen`**: Used to create a sandboxed offscreen document solely to synthesize acoustic alert chimes using the Web Audio API.
- **`contextMenus`**: Used to provide right-click shortcuts on webpages to quickly initiate timers.

---

## 5. Third-Party Sharing & Disclosure
Because Zentime collects zero data and operates with zero backend servers, **we do not sell, rent, trade, or share any user data with any third party under any circumstances.**

---

## 6. User Control & Data Deletion
You retain complete control over your data at all times:
- You can clear individual site limits directly within the Zentime popup.
- You can clear all extension data instantly by removing the extension via `chrome://extensions` or clearing extension data in Chrome settings.

---

## 7. Changes to This Policy
If we update this Privacy Policy in future versions, revisions will be posted openly in the extension's public repository with an updated effective date.

---

## 8. Contact & Open Source
Zentime is developed as an open and transparent productivity tool. If you have questions regarding this policy, please reach out via our GitHub repository:  
👉 [https://github.com/arkhabw/Zentime](https://github.com/arkhabw/Zentime)
