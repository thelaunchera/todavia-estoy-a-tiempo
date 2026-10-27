# Personalized podcast PDFs

The purchase scenario verifies the real Checkout Session, checks the exact product,
price, currency and quantity, and checks whether it was already delivered. Only then
does module 8 call `podcast_prepare_personalized_delivery` through the existing
trusted Supabase connection. Module 4 emails the verified buyer address with the
returned greeting and download links. Its email idempotency key is unchanged.

The two current Payment Links collect an individual name. The mapping prefers
`collected_information.individual_name`, then `customer_details.individual_name`,
then the older `customer_details.name`. A missing name produces `Hola, 🤍` and
`Un espacio solo tuyo` rather than an empty or invented name.

The RPC is SECURITY INVOKER, executable by service_role only. The delivery table
has RLS and no anon/authenticated grants. Each checkout gets one stable random
256-bit token; retries return the same links and cannot change the original buyer
or product. Tokens are bearer download credentials and must never be logged or
committed. No buyer email is stored in this table.

`podcast-personalized-pdf` validates that token before accessing either PDF. It
keeps masters and generated copies in the private `podcast-personalized` bucket.
Responses have private/no-store, no-referrer and noindex headers. Its gateway JWT
check is disabled because the function implements its own per-purchase token auth.
Server keys are read only from Edge Function environment variables.

The function preserves AcroForms and link annotations; it never flattens the PDF.
Generation caches are versioned. Changing a cover placement or master requires
incrementing `version` in index.ts so cached copies are regenerated.

Deploy with the Supabase deployment tool and explicitly set the import map path to
`deno.json`. This avoids retaining a previous deployment's absolute import-map path.
Code files and schema are versioned here. Paid master PDFs and personalized PDFs
must not be committed to this public repository.

QA: download both main PDFs and both bonuses with dedicated preview records;
validate page counts (40/43/3/3), fields (46/51/0/0), all navigation links, editable
text saving, names, accents, missing names, long names, stable retry links and
rejection of absent/invalid tokens. Never simulate an unpaid purchase through the
production payment webhook.
