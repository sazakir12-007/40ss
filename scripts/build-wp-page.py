#!/usr/bin/env python3
"""Builds WordPress block-editor content for the full text, for sites that cannot use the plugin.

Usage: scripts/build-wp-page.py [output.html]   (default: wordpress/page-content.html)
Paste the output into a page via ⋮ → Code editor.
"""
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


def heading(s, level=2, center=True):
    attrs = {"textAlign": "center"} if center else {}
    if level != 2:
        attrs["level"] = level
    cls = "wp-block-heading has-text-align-center" if center else "wp-block-heading"
    head = f"<!-- wp:heading {json.dumps(attrs)} -->" if attrs else "<!-- wp:heading -->"
    blocks.append(f'{head}\n<h{level} class="{cls}">{text(s)}</h{level}>\n<!-- /wp:heading -->')


def para(html, align=None, size=None, rtl=False):
    attrs, classes = {}, []
    if align:
        attrs["align"] = align
        classes.append(f"has-text-align-{align}")
    if rtl:
        attrs["direction"] = "rtl"
    if size:
        attrs["fontSize"] = size
        classes.append(f"has-{size}-font-size")
    cls = f' class="{" ".join(classes)}"' if classes else ""
    dir_attr = ' dir="rtl"' if rtl else ""
    head = f"<!-- wp:paragraph {json.dumps(attrs)} -->" if attrs else "<!-- wp:paragraph -->"
    blocks.append(f"{head}\n<p{cls}{dir_attr}>{html}</p>\n<!-- /wp:paragraph -->")


def arabic(s, size="x-large", align="right"):
    para(text(s), align=align, size=size, rtl=True)


def items_list(entries, ordered=False):
    tag = "ol" if ordered else "ul"
    head = '<!-- wp:list {"ordered":true} -->' if ordered else "<!-- wp:list -->"
    lis = "\n".join(f"<!-- wp:list-item -->\n<li>{e}</li>\n<!-- /wp:list-item -->" for e in entries)
    blocks.append(f'{head}\n<{tag} class="wp-block-list">{lis}</{tag}>\n<!-- /wp:list -->')


def separator():
    blocks.append('<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->')


# Opening
o = data["opening"]
heading("Salutations Upon the Messenger Muhammad Sallallahu Alayhi Wa Sallam from Ahaadeeth")
arabic(o["arabic"], align="center")
para(f"<em>{text(o['transliteration'])}</em>", align="center")
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
        arabic(ar, size="xx-large", align="center")
        heading(en)
    heading(str(it["id"]), level=3)
    arabic(it["arabic"])
    para(f"<em>{text(it['transliteration'])}</em>")
    para(text(it["translation_en"]))
    if it["source"]:
        para(f"<strong>Source:</strong> {text(it['source'])}", size="small")
    for b in it["benefits"]:
        para(f"<strong>Virtue:</strong> {text(b)}", size="small")

# Virtues
v = data["virtues_verse"]
separator()
heading("Virtues")
arabic(v["arabic"], align="center")
para(text(v["translation_en"]), align="center")
para(f"<em>{text(v['reference'])}</em>", align="center", size="small")
items_list([text(b) for b in data["collection_benefits"]])

# Spiritual virtues
s = data["spiritual_virtues"]
separator()
heading(s["title"])
for p in s["intro"]:
    para(text(p))
for i, pt in enumerate(s["points"], 1):
    heading(f"{i}. {pt['title']}", level=3, center=False)
    para(text(pt["text"]))
    if pt.get("bullets"):
        items_list([text(b) for b in pt["bullets"]])

out.write_text("\n\n".join(blocks) + "\n", encoding="utf-8")
print(f"Wrote {out} ({len(blocks)} blocks)")
