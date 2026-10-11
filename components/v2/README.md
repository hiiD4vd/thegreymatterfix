# V2 boundary

Owns `/v2` only. `A24Frame.jsx` embeds the isolated static application in `public/v2-a24`.

Do not import files from `components/v1`, `lib/v1`, or V1 assets.

V2 story data and navigation live inside `public/v2-a24/grey-matter-data.js`.
V2 detail runtime: `app/v2/story-frame/[id]/route.js` with `lib/v2/sienaOriginalHtml.js`.

V2 intentionally has no React visual component library: its visual runtime is the static A24 frame.
