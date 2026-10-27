"""Check downloaded samples without putting paid documents into the repository.

Usage: python check_personalized_pdfs.py SOURCE_PDF_DIRECTORY DOWNLOAD_DIRECTORY
Download names: diario-main.pdf, diario-bonus.pdf, workbook-main.pdf, workbook-bonus.pdf
Requires PyMuPDF. Samples use the name Dailin Segura.
"""
import sys
from pathlib import Path
import tempfile
import fitz

source, downloads = map(Path, sys.argv[1:])
cases = [
    ('diario-main.pdf', 'No_voy_tarde_PDF_Interactivo.pdf', 40, 46),
    ('workbook-main.pdf', 'Empezar_de_nuevo_PDF_Interactivo.pdf', 43, 51),
    ('diario-bonus.pdf', 'BONO_No_voy_tarde_Editorial_2026.pdf', 3, 0),
    ('workbook-bonus.pdf', 'BONO_Empezar_de_nuevo_Dia_15_2026.pdf', 3, 0),
]
for filename, original, pages, fields in cases:
    doc = fitz.open(downloads / filename)
    master = fitz.open(source / original)
    assert len(doc) == pages
    assert 'Dailin Segura' in doc[0].get_text()
    assert sum(len(list(p.widgets() or [])) for p in doc) == fields
    assert [len(p.get_links()) for p in doc] == [len(p.get_links()) for p in master]
    for page in doc:
        page.get_pixmap(matrix=fitz.Matrix(.1, .1))
        for link in page.get_links():
            if link.get('kind') == fitz.LINK_GOTO:
                assert 0 <= link['page'] < pages
    # A real edit/save/read verifies the PDF remains writable after personalization.
    if fields:
        edited = None
        for page in doc:
            for widget in page.widgets() or []:
                if widget.field_type_string == 'Text':
                    widget.field_value = 'Mi prueba personal'
                    widget.update()
                    edited = widget.field_name
                    break
            if edited:
                break
        assert edited
        with tempfile.TemporaryDirectory() as temp:
            filled = Path(temp) / 'filled.pdf'
            doc.save(filled)
            checked = fitz.open(filled)
            assert any(w.field_name == edited and w.field_value == 'Mi prueba personal'
                       for page in checked for w in page.widgets() or [])
    print(filename, 'OK')
