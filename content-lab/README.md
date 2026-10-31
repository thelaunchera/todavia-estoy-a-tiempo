
# The Content Lab — GitHub source of truth

This project is inside the SAME repository/branch family as \`estudio-control/\`, but is **not a component of the podcast Studio**. It is an independent React/Vite app with its own authentication, content library and visual generation flows. Do not combine content or databases between the podcast, The Launch Era Cleaning App and Content Lab.

## Status

- ✅ Source copied from the current AppDeploy Content Lab on 31 October 2026.
- ✅ Portable React frontend, isolated folder, separate design files, 1 Photo → 9 Posts.
- ✅ Portable Supabase Auth/Database/Storage API adapter and private schema.
- ⏳ The EXISTING podcast Supabase project now contains isolated Content Lab tables, a private bucket and owner allowlist. Its GitHub frontend is being connected; a server-only Gemini API key remains to be configured.
- ⏳ Existing AppDeploy user-generated photos/drafts are NOT automatically migrated. Source code and user data are different.
- ⏳ Deployment to a dedicated URL is separate from committing to GitHub. The existing AppDeploy URL remains the live working version until replacement is tested.
- ⏳ Real-photo end-to-end image quality requires an authenticated run with actual provider credits; compiling or deployment checks cannot establish visual quality.

## Development

1. Use the EXISTING podcast Supabase project (`fhrvuhikrybobidxpvnh`) with Content Lab's separate prefixed tables and private storage (do not alter existing podcast tables).
2. Content Lab's RLS schema and private Storage bucket have already been applied to the existing podcast project (2026-10-31). The committed SQL documents the current setup.
3. The single existing podcast Studio owner is automatically allowed by Content Lab. No new accounts are created by the Lab's magic-link login.
4. Copy \`.env.example\` to \`.env.local\`, set only the public Supabase URL and publishable key.
5. The \`content-lab-generate\` Edge Function is already deployed in the shared podcast project; configure \`GEMINI_API_KEY\` as a **server secret** and optionally choose \`GEMINI_TEXT_MODEL\` and \`GEMINI_IMAGE_MODEL\`. Never prefix secret values with \`VITE_\`.
6. \`npm install && npm run build\`; then \`npm run dev\` to test locally.
7. Configure the Auth redirect for the future dedicated Content Lab domain. Keep Studio untouched.

## Languages and image rules

- **Todavía estoy a tiempo** → Spanish (public copy, all captions, posts).
- **The Launch Era** → English (public copy, all captions, posts).
- 1 Photo → 9 Posts creates **nine independent images**, not nine copies, color changes or carousel slides.
- Original app screenshots are never sent for fictional UI generation in Preserve mode; preserve the actual pixels in final export.
- Separate 1080×1350 PNG exports; no ZIPs or collages.

## Architecture / AppDeploy limitations

The old AppDeploy backend APIs are replaced by \`src/platform/client.ts\` (Supabase browser SDK) and the server-side Edge Function. This avoids AppDeploy's app quota and proprietary SDK while retaining private image storage and token-based access. GitHub only stores source code: it does **not** execute image generation or replace backend hosting. Supabase and Gemini have their own rate/usage/credit limits.

Data is owner-scoped using RLS and an admin allowlist. The live Studio and podcast landing are intentionally not modified or linked.

## Publishing

GitHub Pages currently serves the podcast and its Studio. Nothing in this directory changes \`.github/workflows/pages.yml\` or publicly exposes the Lab. A separate build/deployment must be configured after Supabase and AI connectivity are verified.

## Migration note

**Do not delete AppDeploy** or remove its data until verified exports/imports of existing Content Lab projects and assets have completed and the replacement has passed owner login, image generation and private-access QA.

## AI photo generation + private media storage (implementation status)

The GitHub Pages frontend already has the media library, iPhone photo conversion/compression, nine-photo grid generation, and individual PNG exports. The backend is **Supabase Auth + RLS-protected private Storage + an authenticated Supabase Edge Function**. GitHub Pages by itself cannot run the AI endpoint or hold private photographs.

Backend source lives at `supabase/functions/content-lab-generate/index.ts`; the schema and private `content-lab-private` bucket are defined in `supabase/schema.sql`. The browser has only the **Supabase publishable key** and never an AI provider key. Each stored asset belongs to the signed-in owner and has a brand ID; the user cannot access private images of another owner.

For image generation the default model is now `gemini-3.1-flash-lite-image`, which supports image-to-image edits and native 4:5 output at **1K**. The prior `gemini-2.5-flash-image` model was shut down in October 2026. Generated images are subsequently composed to standalone 1080×1350 PNGs in the browser; this is export sizing, not native provider resolution. To use higher native source resolution, explicitly select and pay for a higher-resolution supported model server-side.

**Nothing is activated until a separate Supabase project and paid Gemini image quota are configured**. Do not use the podcast or Cleaning App project's storage, nor claim there is a free image-generation API quota. Each generation/retry uses billable image output and may use billable input tokens. For a nine-post grid, nine separate image calls are made sequentially and completed posts persist if one fails.

Deployment checklist:
1. Choose or create an isolated **Content Lab** Supabase project only after reviewing any additional project price.
2. Apply `supabase/schema.sql` to that dedicated project and privately allowlist only the owner's actual authenticated UUID.
3. Deploy `content-lab-generate`, set its server-only `GEMINI_API_KEY`, and set `CONTENT_LAB_ALLOWED_ORIGIN=https://podcast.thelaunchera.com`.
4. Configure GitHub Actions **repository variables** `VITE_CONTENT_LAB_SUPABASE_URL` and `VITE_CONTENT_LAB_SUPABASE_PUBLISHABLE_KEY`; they are public frontend identifiers, not provider secrets. Do not place any secret keys in GitHub code or VITE variables.
5. Configure the Supabase Auth Site URL and redirect URLs to match GitHub Pages `https://podcast.thelaunchera.com/content-lab/`.
6. Verify: private login, owner-only RLS, HEIC/iPhone upload, source/reference retrieval, single-image generation, nine distinct photos, re-generation, storage read/delete, and PNG exports on phone.
7. Export/migrate old AppDeploy media and content only after completing a careful privacy/data mapping; copying the frontend does not copy user data.

**Cost guardrail:** Start with **one** generated image and check actual Gemini usage before creating nine. Credits, quotas and rates vary by provider and plan. Never automatically call the paid API from a background page load.

## 2026-10-31: Podcast Supabase integration status

User approved sharing the podcast's existing Supabase project. The database hosts isolated `content_lab_*` tables, `content_lab_admins` with the single podcast owner, and the private `content-lab-private` Storage bucket with RLS. Supabase Edge Function `content-lab-generate` was deployed with `verify_jwt=true`. The GitHub Pages build uses this project's **public** URL and publishable key, which are safe to expose in a frontend because RLS protects all private data. The Studio's data and deployment are unchanged.

**Only missing operational key**: a privately saved `GEMINI_API_KEY` in the Supabase project Edge Function secrets, plus any required Auth redirect allowlist for `https://podcast.thelaunchera.com/content-lab/`. Do NOT place this secret in source code or GitHub Pages. Until set, AI photo creation returns a clear configuration error. Old AppDeploy photos and projects have not been imported.

## Alternativa gratuita de imágenes — 31 octubre 2026

**No usar Gemini para fotos.** La ruta de IA ahora llama exclusivamente Cloudflare Workers AI: `@cf/black-forest-labs/flux-2-klein-4b` para imágenes nuevas con referencia y `@cf/meta/llama-3.1-8b-instruct-fp8-fast` para planificación/copy. Ambos consumen la cuota gratuita compartida de **10,000 neuronas/día** del plan Workers Free; cuando se agota la cuota la generación falla sin cobros, siempre que la cuenta permanezca en Free. La cuota no implica fotos ilimitadas y Cloudflare puede cambiar los límites. Fuente: https://developers.cloudflare.com/workers-ai/platform/pricing/

Para activar, registra una cuenta Cloudflare Workers AI Free, localiza su Account ID y crea un token API con permiso Workers AI Read/Write. Guarda ambos como secretos del proyecto Supabase del podcast (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`) y **no** los compartas en chats, la web ni GitHub. No es necesario activar billing, suscribirse ni colocar claves de Gemini. En la interfaz original se mantiene la foto de alta resolución; se crea automáticamente una miniatura `aiReference` de máximo 480px, almacenada en la tabla privada bajo RLS. La IA usa esa miniatura porque Cloudflare exige imágenes de referencia menores a 512×512. Proyectos con fotos anteriores a este cambio necesitan volver a subirlas para tener miniatura AI. Fotos del Lab y tablas del podcast siguen separadas.

Limitación: los modelos gratuitos pueden diferir de las fotos publicitarias premium de tus referencias; siempre hay que revisar realismo de etiquetas, colores y empaque. Los PNG finales se exportan individualmente a 1080×1350, aunque la foto nueva se genera a 1024×1280. No vender ni anunciar ninguna generación gratuita como ilimitada.
