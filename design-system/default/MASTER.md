# Магия прикосновений — visual source of truth

The automated design-system search did not return a verified palette/style match for the supplied adult wellness references. This project therefore follows the reference-led fallback below while retaining the skill's accessibility, interaction and responsive defaults.

## Visual thesis

An intimate, premium editorial experience: deep espresso surfaces, slow copper light, porcelain content cards, restrained ornamental framing and expressive Cyrillic typography. The experience should feel grounded and warm, never gaudy or nightclub-like.

## Palette

| Role | Value |
| --- | --- |
| Base espresso | `#321A12` |
| Cocoa surface | `#4B281A` |
| Copper accent | `#D8834E` |
| Apricot glow | `#FFB176` |
| Porcelain | `#FFF5EB` |
| Ink on light | `#3A2118` |
| Muted warm text | `#DCC0A9` |
| Fine border | `#D3A77F` |

## Typography

- Display and section headings: Cormorant Garamond Italic.
- Script accents and signature moments: Marck Script.
- Body, forms and navigation: Manrope.
- Main body never below 16px; metadata may use 12–13px.

## Components

- Buttons are 48px minimum, pill-shaped, with strong focus rings.
- Light cards use a fine copper border plus an inset porcelain line.
- Dark cards use translucent borders and backdrops only where text contrast remains strong.
- Media uses 16:9 or 16:10 crops, 16–26px radii and a bottom readability gradient.
- Dialogs use the installed accessible dialog primitive; mobile navigation uses the installed sheet primitive.

## Motion

- Ambient glows drift for 22–28 seconds and never interfere with reading.
- Hover motion is limited to a 2px lift or 2.5% media zoom.
- All decorative motion stops under `prefers-reduced-motion: reduce`.

## Responsive and accessibility requirements

- Validate at 375, 768, 1024 and 1440px; no horizontal page scrolling.
- All touch targets are at least 44px.
- Maintain visible focus, semantic landmarks, labelled icon controls and 4.5:1 body-text contrast.
- Never rely on colour alone for payment/access status.
- Modal Escape, backdrop close, focus restoration and scroll locking are supplied by the dialog primitive.

## Avoid

- teal, cool SaaS palettes or playful claymorphism;
- unverified testimonials or invented outcomes;
- random stock photography;
- tiny script type for body copy;
- arrows inside buttons and links;
- heavy motion or glow directly behind text.
