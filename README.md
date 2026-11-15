# 40 Darood wa Salam

An offline-first PWA for reading and reciting the 40 Salawat & Salaam, as compiled in *Zad-us-Sa'eed* and reproduced in *Fazail-e-Durood*.

## Features
- 25 salawat and 15 salaam, with Arabic, transliteration, English translation, source and virtues
- Read vertically (scroll) or sideways (one durood per screen, swiping left to right like an Arabic book)
- Full text of all 40 in sequence; tap a card to lightly highlight the one you are reciting (remembered between visits)
- Auto scroll: highlights each durood in turn, moving on after a chosen time (10 s – 2 min), keeping the screen awake
- Scroll-to-top and scroll-to-bottom buttons
- About popup and Share link in the top menu
- Themes: system, light, sepia, ocean, rose, lavender, emerald, dark, midnight and black (AMOLED)
- Arabic fonts: Amiri, Scheherazade New, Noto Naskh Arabic, Lateef or the device default; adjustable size; toggle transliteration, translation and sources
- Works fully offline once installed (service worker, bundled Arabic fonts)

## Run locally
Any static server works:
```
python3 -m http.server 8000
```
Then open http://localhost:8000 and use "Install app" / "Add to Home Screen".

## Data
`data/40_durood.json`. Items marked `pending_verification` still need their hadith reference filled in from the printed book, and all Arabic should be proofread by a qualified 'alim before release.

When you change any cached file, bump `VERSION` in `sw.js` so installed copies update.

## WordPress plugin
The same app is also packaged as a WordPress plugin, without changing the standalone app.
- Download: [`wordpress/darood-wa-salam.zip`](wordpress/darood-wa-salam.zip) in this repo, or https://sazakir12-007.github.io/40ss/darood-wa-salam.zip (rebuilt on every push to `main`)
- Install via Plugins → Add New → Upload Plugin, then add `[darood_wa_salam]` to any page (optional `height="700px"`).
- Source: `wordpress/`; rebuild the repo copy with `scripts/build-wordpress.sh wordpress/darood-wa-salam.zip` after changing the app.

### Full text for WordPress.com (no plugin)
For sites that cannot install plugins (e.g. the WordPress.com free plan), [`wordpress/page-content.html`](wordpress/page-content.html) holds the full text as block-editor content. In a page, open ⋮ → **Code editor**, paste the file's contents, then switch back to the visual editor. Rebuild it after changing the data with `scripts/build-wp-page.py`.

## Credits
Fonts are licensed under the SIL Open Font License 1.1:
- Amiri © The Amiri Project Authors (`fonts/OFL.txt`)
- Scheherazade New and Lateef © SIL Global (`fonts/OFL-scheherazade.txt`, `fonts/OFL-lateef.txt`)
- Noto Naskh Arabic © The Noto Project Authors (`fonts/OFL-noto-naskh.txt`)
