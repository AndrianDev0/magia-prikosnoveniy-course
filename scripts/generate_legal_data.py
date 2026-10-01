import json
from pathlib import Path
from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".tools" / "legal-v2"
TARGET = ROOT / "public" / "course" / "legal-documents.json"

DEFINITIONS = [
    ("offer", "01_Публичная_оферта_редакция_2.0.docx"),
    ("privacy", "02_Политика_ПД_редакция_2.0.docx"),
    ("consent", "03_Согласие_ПД_редакция_2.0.docx"),
    ("user-agreement", "04_Пользовательское_соглашение_редакция_2.0.docx"),
    ("rules-18", "05_Правила_18_плюс_редакция_2.0.docx"),
    ("refunds", "06_Правила_возврата_редакция_2.0.docx"),
    ("testimonial-consent", "07_Согласие_отзыв_распространение_ПД_редакция_2.0.docx"),
]


def ordered_blocks(document):
    for child in document.element.body.iterchildren():
        if child.tag.endswith("}p"):
            paragraph = Paragraph(child, document)
            text = paragraph.text.strip()
            if text:
                yield {"type": "paragraph", "text": text, "style": paragraph.style.name}
        elif child.tag.endswith("}tbl"):
            table = Table(child, document)
            rows = []
            for row in table.rows:
                rows.append([cell.text.strip() for cell in row.cells])
            if rows:
                yield {"type": "table", "rows": rows}


documents = {}
for slug, filename in DEFINITIONS:
    blocks = list(ordered_blocks(Document(SOURCE / filename)))
    first = blocks.pop(0)
    documents[slug] = {"slug": slug, "title": first["text"], "blocks": blocks}

payload = {"version": "2.0", "revision": "01 октября 2026 года", "documents": documents}
TARGET.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
