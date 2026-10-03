# UI review — 2026-10-03

Scope: deployed static GitHub Pages site (`pages/`), independent read-only agent review plus local browser checks. No redesign of the visual identity and no real payments or agreement acceptance during QA.

## Fixed

- P2: off-screen mobile tariff buttons were keyboard-focusable. Only the active slide is now in the Tab sequence and accessibility tree. Pointer activation selects a side preview before opening its form, preserving a visible return-focus target.
- P2: changing an admin lead status replaced its focused select. Focus returns to that lead, or the status filter when the lead no longer matches.
- P2: the admin statistics label overflowed its card at 320 px. Small screens now use aligned label/value rows.
- P3: the script brand overlapped the admin heading at 320 px. Added line height and separation.
- P2: lesson-title masks covered large parts of lesson photos. Replaced the static-page lesson body with flow-layout sections, real headings and readable descriptions. All eight posters use the original unmodified JPEG embedded in the supplied Figma SVG.
- Prevented regressions introduced by changing the lesson body: removed the old negative footer overlap; anchored the course profile hit area to the header rather than full page height; removed the obsolete wide-page background that created duplicated header lines.

## Verification

- Independent agent: homepage carousel, form, documents and admin; mobile 320 px and desktop 1280 px. Re-reviewed the code changes and identified the footer/profile/side-preview risks, all addressed.
- Course browser: 320, 390, 768 and 1280 px. No horizontal overflow. Every poster is centered; at 1280 px all eight centers are x=639.99. Heading-to-poster gaps are 16 px on mobile and 18 px on larger screens. Last-lesson-to-footer gap is positive (44 px at 320; 66 px at 1280).
- Admin browser at 320 px: statistics contents and card widths agree; no horizontal overflow.
- Homepage browser at 320 px: Tab after next-slide arrow reaches the visible VIP+ card; inactive card buttons have tabindex=-1.
- Course placeholder button produces its expected notice; no browser console errors during the final course check.
- ESLint, TypeScript, build, 29 payment-validation checks, consent/storage tests, admin persistence/filter/focus tests and carousel regression tests passed. Build retains pre-existing warnings about runtime-resolved SVG/font URLs.

## Antislop delivery gates (changed components only)

- Hard — PASS: overflow and focus regressions checked; tests and build pass.
- Purpose — PASS: each change addresses a reproduced interface defect.
- Liveliness — PASS: original warm palette, Miama headings, photographs and restrained controls retained; no new decorative animation.
- Craftsmanship — PASS: responsive spacing, photo ratios, footer separation and keyboard states verified.

This is not a claim that the whole product is production-ready. Payment, video and social destinations are still deliberate placeholders; the static admin stores data in this browser only. A shared server, authentication and payment integration remain separate launch work. The homepage still contains rasterized text, including its older motto; converting that content into responsive text is a recommended follow-up, not silently included in this patch.
