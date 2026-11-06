/** Shared product rules for Studio and Content Lab. Customer files stay private. */
export const CREATIVE_EDITOR_RULES = {
  maxPublishedFileBytes: 5_000_000,
  maxSourceFileBytes: 25_000_000,
  maxStickerImportCount: 100,
  maxStickerZipBytes: 60_000_000,
  feedbackDurationMs: 2_000,
  defaultCanvasColor: '#FAF8F3',
  exportMime: 'image/png',
  normalSlidesAreSeparate: true,
  seamlessCrossSlidePlacement: true,
  privateEditorUploads: true,
} as const;
