#!/usr/bin/env python3
"""Builds WordPress block-editor content for the full text, for sites that cannot use the plugin.

Usage: scripts/build-wp-page.py [output.html]   (default: wordpress/page-content.html)
Paste the output into a page via ⋮ → Code editor.
"""
APP_URL = "https://sazakir12-007.github.io/40ss/"

ABOUT = [
    "Maulana Ashraf Ali Thanvi (Rahmathulaahi Alayhi) originally compiled the 40 Durood and Salaam from Marfu' (directly attributed) Ahadith. "
    "He published them in his book titled <em>Zadus Saeed</em> (and also referenced them in <em>Nashrut-Teeb</em>).",
    "Shaykh al-Hadith Maulana Muhammad Zakariyya Kandhlawi (Rahmathulaahi Alayhi) famously popularized and re-narrated this exact compilation. "
    "He included it at the end of his widely read book <em>Faza'il-e-Durood Shareef</em> (Virtues of Durood) to share the blessings of the compilation with a wider audience.",
    "The collection consists of 25 forms of Durood (salutations of peace) and 15 forms of Salam (greetings of peace) extracted directly from prophetic traditions.",
]
NOTE = (
    "Utmost care has been taken in compiling the text, transliteration and translation on this page. "
    "Should you find anything incorrect or not in order, kindly inform the developer so it can be corrected, in sha Allah. "
    "May Allah accept it from all of us."
)
import json
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "data/40_durood.json").read_text(encoding="utf-8"))
out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "wordpress/page-content.html"

blocks = []


def text(s):
    """Escape text and keep the data's line breaks."""
    return escape(s, quote=False).replace("\n", "<br>")


# Colours (fixed so they look the same in any theme).
GREEN, GOLD, BLUE, BROWN, ROSE, INK = "#0f5c4d", "#b8892b", "#1d5f8a", "#7a4f1d", "#9a3b47", "#2f3b36"


def heading(s, level=2, center=True, color=GREEN):
    attrs = {"textAlign": "center"} if center else {}
    if level != 2:
        attrs["level"] = level
    attrs["style"] = {"color": {"text": color}}
    cls = "wp-block-heading has-text-align-center has-text-color" if center else "wp-block-heading has-text-color"
    blocks.append(
        f"<!-- wp:heading {json.dumps(attrs)} -->\n"
        f'<h{level} class="{cls}" style="color:{color}">{text(s)}</h{level}>\n<!-- /wp:heading -->'
    )


def para(html, align=None, size=None, rtl=False, color=INK):
    attrs, classes = {}, []
    if align:
        attrs["align"] = align
        classes.append(f"has-text-align-{align}")
    if rtl:
        attrs["direction"] = "rtl"
    if size:
        attrs["fontSize"] = size
        classes.append(f"has-{size}-font-size")
    attrs["style"] = {"color": {"text": color}}
    classes.append("has-text-color")
    dir_attr = ' dir="rtl"' if rtl else ""
    blocks.append(
        f"<!-- wp:paragraph {json.dumps(attrs)} -->\n"
        f'<p class="{" ".join(classes)}" style="color:{color}"{dir_attr}>{html}</p>\n<!-- /wp:paragraph -->'
    )


def arabic(s, size="x-large", align="right", color=GREEN):
    para(text(s), align=align, size=size, rtl=True, color=color)


def items_list(entries, ordered=False, color=INK):
    tag = "ol" if ordered else "ul"
    attrs = {"ordered": True} if ordered else {}
    attrs["style"] = {"color": {"text": color}}
    lis = "\n".join(f"<!-- wp:list-item -->\n<li>{e}</li>\n<!-- /wp:list-item -->" for e in entries)
    blocks.append(
        f"<!-- wp:list {json.dumps(attrs)} -->\n"
        f'<{tag} class="wp-block-list has-text-color" style="color:{color}">{lis}</{tag}>\n<!-- /wp:list -->'
    )


def separator(color=GOLD):
    attrs = {"style": {"color": {"background": color}}}
    blocks.append(
        f"<!-- wp:separator {json.dumps(attrs)} -->\n"
        f'<hr class="wp-block-separator has-text-color has-alpha-channel-opacity has-background" style="background-color:{color};color:{color}"/>\n'
        f"<!-- /wp:separator -->"
    )


def app_button(label, color=GREEN):
    """A rounded, coloured button at the top right linking to the full app."""
    btn = {"style": {"color": {"background": color, "text": "#ffffff"}, "border": {"radius": "999px"}}}
    blocks.append(
        '<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"right"}} -->\n<div class="wp-block-buttons">'
        f"<!-- wp:button {json.dumps(btn)} -->\n"
        f'<div class="wp-block-button"><a class="wp-block-button__link has-text-color has-background wp-element-button" href="{APP_URL}" '
        f'style="border-radius:999px;color:#ffffff;background-color:{color}">{label}</a></div>\n'
        "<!-- /wp:button --></div>\n<!-- /wp:buttons -->"
    )


app_button("Open the app ↗")

# Opening
o = data["opening"]
heading("Salutations Upon the Messenger Muhammad Sallallahu Alayhi Wa Sallam from Ahaadeeth")
arabic(o["arabic"], align="center")
para(f"<em>{text(o['transliteration'])}</em>", align="center", color=BLUE)
para(text(o["translation_en"]), align="center")

SECTIONS = {
    "salawat": ("الصَّلَوَاتُ", "Salawat (1 – 25)"),
    "salaam": ("السَّلَامُ", "Salaam (26 – 40)"),
}

last = None
for it in data["items"]:
    if it["type"] != last:
        last = it["type"]
        separator()
        ar, en = SECTIONS[last]
        arabic(ar, size="xx-large", align="center", color=GOLD)
        heading(en)
    else:
        separator()
    heading(str(it["id"]), level=3, color=GOLD)
    arabic(it["arabic"])
    para(f"<em>{text(it['transliteration'])}</em>", color=BLUE)
    para(text(it["translation_en"]))
    if it["source"]:
        para(f"<strong>Source:</strong> {text(it['source'])}", size="small", color=BROWN)
    for b in it["benefits"]:
        para(f"<strong>Virtue:</strong> {text(b)}", size="small", color=ROSE)

# Virtues
v = data["virtues_verse"]
separator()
heading("Virtues")
arabic(v["arabic"], align="center")
para(text(v["translation_en"]), align="center", color=BLUE)
para(f"<em>{text(v['reference'])}</em>", align="center", size="small", color=GOLD)
items_list([text(b) for b in data["collection_benefits"]])

# About
separator()
heading("About")
for p in ABOUT:
    para(p)
heading("Note", level=3, center=False, color=GOLD)
para(text(NOTE), color=BROWN)

# Spiritual virtues
s = data["spiritual_virtues"]
separator()
heading(s["title"])
for p in s["intro"]:
    para(text(p))
for i, pt in enumerate(s["points"], 1):
    heading(f"{i}. {pt['title']}", level=3, center=False, color=BLUE)
    para(text(pt["text"]))
    if pt.get("bullets"):
        items_list([text(b) for b in pt["bullets"]], color=GREEN)

# Link to the full app
separator()
para(f'Read it in the full app (themes, Arabic fonts, auto scroll, works offline): <a href="{APP_URL}">{APP_URL}</a>', align="center")

# Everything sits in one centred column: full width on small screens, at most 800px wide, padded on all sides.
PAD = "1.5rem"
group = {
    "style": {"spacing": {"padding": {"top": PAD, "right": PAD, "bottom": PAD, "left": PAD}}},
    "layout": {"type": "constrained", "contentSize": "800px"},
}
blocks.insert(0, f"<!-- wp:group {json.dumps(group)} -->\n"
                 f'<div class="wp-block-group" style="padding-top:{PAD};padding-right:{PAD};padding-bottom:{PAD};padding-left:{PAD}">')
blocks.append("</div>\n<!-- /wp:group -->")

out.write_text("\n\n".join(blocks) + "\n", encoding="utf-8")
print(f"Wrote {out} ({len(blocks)} blocks)")
