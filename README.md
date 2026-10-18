# 40 Salawat & Salaam (Chahal Durood)

An offline-first PWA for reading and reciting the 40 Salawat & Salaam, as compiled in *Zad-us-Sa'eed* and reproduced in *Fazail-e-Durood*.

## Features
- 25 salawat and 15 salaam, with Arabic, transliteration, English translation, source and virtues
- Read vertically (scroll) or sideways (one durood per screen, swiping left to right like an Arabic book)
- Full text of all 40 in sequence; tap a card to lightly highlight the one you are reciting (remembered between visits)
- About & opening in a popup from the top menu
- Light, sepia, dark and system themes; adjustable Arabic font size; toggle transliteration, translation and sources
- Works fully offline once installed (service worker, bundled Amiri font)

## Run locally
Any static server works:
```
python3 -m http.server 8000
```
Then open http://localhost:8000 and use "Install app" / "Add to Home Screen".

## Data
`data/40_durood.json`. Items marked `pending_verification` still need their hadith reference filled in from the printed book, and all Arabic should be proofread by a qualified 'alim before release.

When you change any cached file, bump `VERSION` in `sw.js` so installed copies update.

## Credits
Amiri font © The Amiri Project Authors, SIL Open Font License 1.1 (`fonts/OFL.txt`).
