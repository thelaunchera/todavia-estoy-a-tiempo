export type PhotoCrop = { x: number; y: number; zoom: number };

const finite = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export function normalizeCrop(value?: Partial<PhotoCrop>): PhotoCrop {
  return {
    x: Math.max(0, Math.min(1, finite(value?.x, .5))),
    y: Math.max(0, Math.min(1, finite(value?.y, .5))),
    zoom: Math.max(1, Math.min(4, finite(value?.zoom, 1))),
  };
}

/** One cover calculation for the live crop window and the exported pixels. */
export function coverPlacement(iw: number, ih: number, w: number, h: number, value?: Partial<PhotoCrop>) {
  const crop = normalizeCrop(value);
  const scale = Math.max(w / Math.max(1, iw), h / Math.max(1, ih)) * crop.zoom;
  const width = iw * scale;
  const height = ih * scale;
  return { x: (w - width) * crop.x, y: (h - height) * crop.y, width, height };
}

export function photoFrameMetrics(w: number, h: number, mode: string) {
  const inset = mode === 'polaroid' ? Math.max(13, w * .042) : mode === 'none' || mode === 'panorama' ? 0 : Math.max(7, w * .018);
  const bottom = mode === 'polaroid' ? Math.max(44, h * .11) : inset;
  const radius = mode === 'super-rounded' ? Math.min(w, h) * .12
    : mode === 'rounded' ? Math.min(w, h) * .066
    : mode === 'polaroid' ? Math.min(w, h) * .025
    : mode === 'none' ? 0 : mode === 'panorama' ? Math.min(w, h) * .06 : Math.min(w, h) * .048;
  return {inset, bottom, radius, innerRadius: Math.max(0, radius - inset * .38)};
}
