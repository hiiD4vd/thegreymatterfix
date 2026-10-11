# V1 boundary

Owns all React UI, animation, canvas, transitions, and story data used by `/` and `/story/[id]`.

Do not import files from `components/v2`, `lib/v2`, or `public/v2-a24`.

V1 story data: `lib/v1/stories.js`.
V1 detail runtime: `app/story-frame/[id]/route.js`.

V1 shell owns Lenis, route cover, and gradual blur. They are deliberately not global.
