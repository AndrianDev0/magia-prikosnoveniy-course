# Static site performance, 2026-10-03

Measured against commit `32409a9` using Chromium, an empty cache, 100 ms network latency, 200,000 bytes/s download, and 4x CPU throttling. The document notice was marked seen so both runs measured the same page. These are local lab samples, not production percentiles or a speed guarantee. Transfer totals include response headers and cross-origin fonts.

| Viewport / page | Before, KB | After, KB | LCP before / after |
| --- | ---: | ---: | ---: |
| 390×844, DPR 2 / home | 1,077 | 589 | 2.31 / 1.53 s |
| 390×844, DPR 2 / course | 1,158 | 340 | 5.42 / 1.83 s |
| 820×1180 / home | 1,347 | 491 | 2.12 / 1.61 s |
| 820×1180 / course | 1,112 | 335 | 5.43 / 1.72 s |
| 1440×900 / home | 1,429 | 573 | 5.99 / 3.10 s |
| 1440×900 / course | 1,357 | 341 | 5.40 / 1.86 s |

## Changes

- Crop lossless header derivatives instead of decoding a 7,359–12,334-pixel-tall course image to show only its top strip.
- Serve lesson posters at 640/1280/1920 widths in WebP. Reserve image geometry and lazily load lower posters.
- Convert tariff/plan images to WebP. The closed plan dialog no longer downloads its image. Native lazy loading may prefetch tariff cards near the viewport.
- Serve subset WOFF2 copies of the existing Miama Nueva and Montserrat locally, retaining Latin, Cyrillic and OpenType layout features. Keep the Montserrat license beside the files.
- Select the desktop landing raster by the actual artwork width and device pixel ratio.
- Keep mobile decorative light static. Animate tariff position with transforms, not layout margins. Preserve reduced-motion behavior.

No text, payment permissions, legal consent or access-control rules were changed. Original source assets remain available for regeneration. The landing is still a tall raster design; replacing it with HTML sections would be a separate implementation task.

## Regeneration and checks

- `node scripts/optimize-site-assets.mjs` needs `sharp`; `SHARP_MODULE` can point to an existing installation.
- `python scripts/optimize-site-fonts.py` needs `fonttools[woff]` and `brotli`, plus network access for the pinned Google font URLs.
- `node scripts/test-page-assets.mjs` checks public references and size budgets, and runs in Pages CI.
- Existing payment, carousel, admin and server tests must still pass. Server tests also verify that the new WOFF2 and header files are served with the correct MIME types.
- Browser checks cover the document gate, menu, plan dialog lazy loading, carousel, invalid email rejection, course posters and horizontal overflow at 320/390/820/1440 px.

Local measurement JSON and screenshots are in the ignored `output/playwright/` directory.
