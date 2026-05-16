# SpeechLog Frontend

React + TypeScript single-page app for local-first voice journaling.

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - type-check and build production assets
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Notes

- App data is stored locally in the browser.
- Passcode lock is optional and stored as a local hash.
- PWA service worker is registered from `src/main.tsx`.
