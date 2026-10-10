import { STORIES } from "@/lib/stories";
import { SIENA_ORIGINAL_HTML } from "@/lib/sienaOriginalHtml";

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

export async function GET(_request, { params }) {
  const { id } = await params;
  const story = STORIES.find((item) => item.id === id) || STORIES[0];
  const title = esc(story.title);
  const category = esc(story.category);
  const year = esc(story.year || "2024");
  const minutes = esc(story.minutes || "");
  const image = esc(story.thumbnail);
  const description = esc(story.description || story.blurb || "");

  // Separate document: exact Siena HTML/CSS/runtime, no Grey Matter root layout.
  let html = SIENA_ORIGINAL_HTML
    .replace(/My Project X/gi, title)
    .replace(/Documentary/gi, category)
    .replace(/2022|2024/g, year)
    .replace(/MIN\.\s*\d+/gi, `MIN. ${minutes}`)
    .replace(/https:\/\/cdn\.prod\.website-files\.com\/[^"\s)]+/g, image)
    .replace(/<div class="case-menu-tx">[\s\S]*?<\/div>/, `<div class="case-menu-tx">${description}</div>`)
    .replace(/<div data-after="EXPLORE" class="footagemenu-cta-tx smaller">5\/5<\/div>/, "")
    .replace(/href="\/work"/g, 'href="/" target="_top"')
    .replace(/>All Work</gi, ">BACK TO MAP<")
    // All visible Siena identity in desktop + mobile navigation becomes Grey Matter.
    .replace(/SIENA(?:&nbsp;|\s)+FILM(?:&nbsp;|\s)+FOUNDATION\.?/gi, "THE GREY MATTER")
    .replace(/©\s*2024\.\s*SIENA(?:&nbsp;|\s)+FILM(?:&nbsp;|\s)+FOUNDATION\.?/gi, "©2024. THE GREY MATTER.")
    .replace(/@siena\.\s*All Rights Reserved/gi, "THE GREY MATTER. All Rights Reserved")
    .replace(/>SIENA</gi, ">THE GREY MATTER<")
    .replace(/LEE@SIENA\.FILM/gi, "")
    .replace(/LIMOR PINHASOV|ODED KIRMA|DORIT HAKIM KRAMER|LILACH SHAYO|LEELU DORIT/gi, "");

  html = `<!doctype html><html class="w-mod-js w-mod-ix"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/siena-work-space.css"><link rel="stylesheet" href="/siena-out.css"><link rel="stylesheet" href="/siena-webflow.css"><style>
      .nav-link.logo .svg-logo{display:none!important}
      .nav-link.logo:after{content:'THE GREY MATTER';color:#fff;font:700 13px/1 Arial,sans-serif;letter-spacing:.12em;white-space:nowrap}
      /* User requested: no Siena footer mark or newsletter signup. */
      .logo-footer,.ft-newsletter-w,.ft-sitemap-w,.ft-contact-w,.footer-line.last,.footagemenu-stars{display:none!important}
    </style></head><body>${html}<script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js"></script><script src="/siena-webflow.js"></script><script src="/siena-app.js"></script></body></html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
