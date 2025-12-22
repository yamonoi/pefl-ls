# Chrome Extension (Manifest V3) Boilerplate

Boilerplate Chrome extension project using Manifest V3, plain JavaScript, and Vite with a build-watch workflow.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the build in watch mode (recommended during development):
   ```bash
   npm run dev
   ```
   The output is written to `dist/` and rebuilt on changes.
3. Create a production build:
   ```bash
   npm run build
   ```

## Load the extension in Chrome

1. Run `npm run dev` to keep the build output up to date.
2. Open **chrome://extensions**, enable **Developer mode**, and click **Load unpacked**.
3. Select the `dist` directory.

## Project structure

- `public/manifest.json` – Manifest V3 configuration.
- `src/background.js` – Service worker handling install and runtime messages.
- `src/content.js` – Example content script.
- `src/popup/` – Popup HTML/CSS/JS.
- `vite.config.js` – Multi-entry Vite build targeting extension assets.
