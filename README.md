# Nexus AI Browser Companion — Chrome Extension Manifest V3

Nexus is an AI browser companion built as a Chrome Extension with a clean, high-performance Node.js / Express backend sync engine. It enables individuals to read active browser tabs, trigger structured key point summaries, record highlights to local memories, capture context notes, and query proactive complementary tutorials or resources.

## 🚀 Key Features

1. **Page Understanding**: Extract webpage DOM contents, calculate saved reading time, and render TL;DRs.
2. **Searchable Memory Feed**: Quick-save selected quotes or highlights with auto-generated categories.
3. **Smart Complementary Resources**: Suggest docs, videos, or tutorials linked to the active tab's topic.
4. **Context Notes Capture**: Capture manual notes attached to the specific tab context.
5. **Command Palette (Ctrl + K)**: High-speed, keyboard-driven navigation across tabs, actions, and settings.
6. **Bold Typography Styling**: Minimalist, eye-safe high-contrast slate aesthetics featuring "Space Grotesk" headings and organic spring transitions.

---

## 🛠️ Architecture Overview

The project is structured for immediate deployment and modular long-term scale:

- **Extension Shell (`/extension`)**: Contains pure Manifest V3 scripts:
  - `manifest.json`: Context permission settings (`activeTab`, `sidePanel`, `storage`).
  - `background.js`: Service worker handling context menu commands and message routing.
  - `content.js`: Non-intrusive on-page trigger highlights indicator script.
- **Cognitive Database (`/src/db/store.ts`)**: Structured JSON local file database with full CRUD capabilities for bookmarks, notes, and user preferences.
- **Server Orchestration (`/server.ts`)**: Integrated server proxy that hosts the front-end SPA while routing real-time requests to Google Gemini models (via the `@google/genai` TypeScript SDK) or gracefully routing to local cognitive fallback heuristics.

---

## 📦 Run & Load Instructions

### 1. Run the local backend
Run the combined development build server which boots on **port 3000**:
```bash
npm install
npm run dev
```

### 2. Load the unpacked extension in Google Chrome
To try the extension natively inside Google Chrome, follow these quick steps:
1. Open Google Chrome and navigate to the extensions control page: `chrome://extensions`.
2. Turn on **Developer Mode** by flipping the switch in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left corner of the header.
4. Select the `extension/` directory inside this project workspace.
5. You'll see the **Nexus AI Companion** extension logo inside your Chrome toolbar. Click it to open the right side panel and start browsing!

---

## 🔒 Security & Privacy Scopes
All model orchestration is executed server-side to prevent exposing your `GEMINI_API_KEY` to public client bundles. System instructions enforce strict schema structures using Google GenAI SDK's structured `responseSchema` parameters.
