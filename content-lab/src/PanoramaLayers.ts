import { clampRect, type TouchRect } from './TouchGeometry';
import { coverPlacement } from './PhotoCrop';

export type PanoramaLayer = {
  id: string;
  assetId: string;
  name: string;
  kind: 'photo' | 'sticker';
  rect: TouchRect;
};

export function normalizePanoramaLayers(value: unknown): PanoramaLayer[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.slice(0, 24).flatMap(item => {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id ||
        typeof item.assetId !== 'string' || !item.assetId || !item.rect || ids.has(item.id)) return [];
    ids.add(item.id);
    return [{
      id: item.id.slice(0, 160), assetId: item.assetId.slice(0, 150),
      name: String(item.name || 'Foto').slice(0, 100),
      kind: item.kind === 'sticker' ? 'sticker' as const : 'photo' as const,
      rect: clampRect(item.rect, .055 / 8),
    }];
  });
}

export async function paintPanoramaLayers(
  ctx: CanvasRenderingContext2D, width: number, height: number,
  layers: PanoramaLayer[], images: Record<string, string>,
) {
  for (const layer of layers) {
    const src = images[layer.assetId];
    if (!src) throw Error('Una foto del lienzo todavía está cargando. Espera antes de descargar.');
    const img = new Image();
    img.src = src;
    await img.decode();
    const r = clampRect(layer.rect, .055 / 8), w = r.w * width, h = r.h * height;
    ctx.save();
    ctx.translate((r.x + r.w / 2) * width, (r.y + r.h / 2) * height);
    ctx.rotate((r.angle || 0) * Math.PI / 180);
    if (layer.kind === 'photo') {
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * .06);
      ctx.clip();
      const p = coverPlacement(img.naturalWidth, img.naturalHeight, w, h, r.crop);
      ctx.drawImage(img, -w / 2 + p.x, -h / 2 + p.y, p.width, p.height);
    } else {
      const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const iw = img.naturalWidth * scale, ih = img.naturalHeight * scale;
      ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
    }
    ctx.restore();
  }
}

/** Applies retained cross-slide layers even if the continuous background is turned off. */
export async function overlayPanoramaPages(pages: HTMLCanvasElement[], layers: PanoramaLayer[], images: Record<string, string>) {
  if (!layers.length) return pages;
  const wide = document.createElement('canvas');
  wide.width = pages.length * 1080; wide.height = 1350;
  const ctx = wide.getContext('2d');
  if (!ctx) throw Error('No se pudo preparar la descarga.');
  pages.forEach((page, n) => ctx.drawImage(page, n * 1080, 0));
  await paintPanoramaLayers(ctx, wide.width, wide.height, layers, images);
  return pages.map((_, n) => {
    const page = document.createElement('canvas'); page.width = 1080; page.height = 1350;
    const context = page.getContext('2d');
    if (!context) throw Error('No se pudo cortar el carrusel.');
    context.drawImage(wide, n * 1080, 0, 1080, 1350, 0, 0, 1080, 1350);
    return page;
  });
}
