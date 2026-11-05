#!/usr/bin/env python3
"""Publish only image resources that actually decode and match approved manifests.

Keeps damaged source files untouched for later restoration. The private Studio
uses the generated allowlist to avoid showing an unusable sticker in its picker.
"""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path("content-lab/public")
STUDIO = Path("_podcast_pages/estudio")
CATALOGUE = Path("estudio-control/src/lab-assets.ts")


def catalogue_assets() -> list[dict]:
    source = CATALOGUE.read_text(encoding="utf-8")
    prefix = "export const LAB_ASSETS = "
    if not source.startswith(prefix) or " as const;" not in source:
        raise SystemExit("El catálogo del Studio cambió de formato.")
    return json.loads(source[len(prefix):].rsplit(" as const;", 1)[0])


def manifest_records() -> dict[str, dict]:
    records: dict[str, dict] = {}
    for manifest in (ROOT / "resources").rglob("manifest.json"):
        data = json.loads(manifest.read_text(encoding="utf-8"))
        assets = data if isinstance(data, list) else data.get("assets", [])
        for asset in assets:
            if isinstance(asset, dict) and asset.get("file"):
                records[asset["file"]] = asset
    return records


def is_valid(file: str, meta: dict | None) -> tuple[bool, str]:
    path = ROOT / file
    if not file.startswith("resources/") or ".." in Path(file).parts:
        return False, "Ruta insegura"
    if not path.is_file():
        return False, "Archivo ausente"
    if meta:
        if meta.get("sizeBytes") is not None and path.stat().st_size != meta["sizeBytes"]:
            return False, "El tamaño no coincide con el original"
        if meta.get("sha256"):
            h = hashlib.sha256(path.read_bytes()).hexdigest()
            if h.lower() != str(meta["sha256"]).lower():
                return False, "El hash no coincide con el original"
    try:
        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            image.load()
            if image.width < 32 or image.height < 32:
                return False, "Resolución inválida"
            if image.convert("RGBA").getchannel("A").getextrema()[1] == 0:
                return False, "PNG completamente transparente"
    except Exception as exc:
        return False, "PNG no decodificable: " + str(exc)
    return True, ""


def main() -> None:
    assets = catalogue_assets()
    manifest = manifest_records()
    if not assets:
        raise SystemExit("No hay recursos registrados.")
    valid, invalid = [], []
    for asset in assets:
        file = asset["file"]
        ok, reason = is_valid(file, manifest.get(file))
        if ok:
            dest = STUDIO / file
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / file, dest)
            valid.append(file)
        else:
            invalid.append({"file": file, "reason": reason})
    if not valid:
        raise SystemExit("Ningún sticker se pudo verificar; no se publicará una biblioteca vacía.")
    for file in valid:
        if not (STUDIO / file).is_file():
            raise SystemExit("El PNG verificado no llegó a la carpeta publicada: " + file)
    (STUDIO / "assets-health.json").write_text(
        json.dumps({"version": "2026-11-05-r3", "valid": valid, "unavailableCount": len(invalid)},
                   ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Studio: {len(valid)} PNG comprobados; {len(invalid)} dañados ocultos (sin borrar originales).")
    for item in invalid[:12]:
        print("NO DISPONIBLE: " + item["file"] + " — " + item["reason"])


if __name__ == "__main__":
    main()
