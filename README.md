# תהילים לעילוי נשמה

Hebrew memorial Tehillim booklet, as a progressive web app. Enter a Hebrew name, choose which names Psalm 119 should spell, and read the cemetery prayers on a phone — including offline, after the app has been opened once.

**Live:** https://rebibomichael-web.github.io/tehillim-app/

The booklet is right-to-left (`lang=he`, `dir=rtl`) and installable (standalone). The installed name is תהילים לעילוי נשמה.

## What's in this repo

| File | Role |
| --- | --- |
| `index.html` | The app. Hebrew wording is fixed; do not edit it in place. |
| `manifest.webmanifest` | Web app manifest |
| `sw.js` | Guarded service worker (same-origin GET only) |
| `icons/`, `favicon.ico` | Home-screen and browser icons |
| `docs/content-rules.md` | How names, letters, and grammar are built |
| `.nojekyll` | Publish the files as-is on GitHub Pages |

## Tests

```bash
npm install
npx playwright install chromium
npm test
```
