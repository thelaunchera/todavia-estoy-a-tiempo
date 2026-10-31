
# The Content Lab — GitHub source of truth

This project is inside the SAME repository/branch family as \`estudio-control/\`, but is **not a component of the podcast Studio**. It is an independent React/Vite app with its own authentication, content library and visual generation flows. Do not combine content or databases between the podcast, The Launch Era Cleaning App and Content Lab.

## Status

- ✅ Source copied from the current AppDeploy Content Lab on 31 October 2026.
- ✅ Portable React frontend, isolated folder, separate design files, 1 Photo → 9 Posts.
- ✅ Portable Supabase Auth/Database/Storage API adapter and private schema.
- ⏳ A **dedicated Supabase project**, its authentication owner allowlist, and a server-side AI API key must be configured before this GitHub version can run.
- ⏳ Existing AppDeploy user-generated photos/drafts are NOT automatically migrated. Source code and user data are different.
- ⏳ Deployment to a dedicated URL is separate from committing to GitHub. The existing AppDeploy URL remains the live working version until replacement is tested.
- ⏳ Real-photo end-to-end image quality requires an authenticated run with actual provider credits; compiling or deployment checks cannot establish visual quality.

## Development

1. Configure a *separate* Supabase project for Content Lab, NOT the podcast Supabase database and not the Cleaning App database.
2. Run \`supabase/schema.sql\` in that new project's SQL Editor. It enables RLS and creates a private Storage bucket.
3. Sign up using the owner's email via private magic link. Approve the owner's UUID in \`content_lab_admins\` from SQL Editor (never store this UUID in GitHub).
4. Copy \`.env.example\` to \`.env.local\`, set only the public Supabase URL and publishable key.
5. Deploy the \`supabase/functions/content-lab-generate\` function to this new project; configure \`GEMINI_API_KEY\` as a **server secret** and optionally choose \`GEMINI_TEXT_MODEL\` and \`GEMINI_IMAGE_MODEL\`. Never prefix secret values with \`VITE_\`.
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
