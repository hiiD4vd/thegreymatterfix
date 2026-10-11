import { STORIES } from "@/lib/stories";
import { SIENA_ORIGINAL_HTML } from "@/lib/sienaOriginalHtml";

const esc = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

export async function GET(request, { params }) {
  const { id } = await params;
  const backHref = new URL(request.url).searchParams.get("from") === "v2" ? "/v2?return=map" : "/";
  const story = STORIES.find((item) => item.id === id) || STORIES[0];
  const title = esc(story.title);
  const category = esc(story.category);
  const year = esc(story.year || "2024");
  const minutes = esc(story.minutes || "");
  const image = esc(story.thumbnail);
  const description = esc(story.description || story.blurb || "");
  const detailQuery = new URL(request.url).searchParams.get("from") === "v2" ? "?from=v2" : "";
  const indexItems = STORIES.map((item, index) => `<a href="/story/${esc(item.id)}${detailQuery}" target="_top"><span>${String(index + 1).padStart(2, "0")}</span>${esc(item.title)}</a>`).join("");

  // Separate document: exact Siena HTML/CSS/runtime, no Grey Matter root layout.
  let html = SIENA_ORIGINAL_HTML
    .replace(/My Project X/gi, title)
    .replace(/Documentary/gi, category)
    .replace(/2022|2024/g, year)
    .replace(/MIN\.\s*\d+/gi, `MIN. ${minutes}`)
    .replace(/https:\/\/cdn\.prod\.website-files\.com\/[^"\s)]+/g, image)
    .replace(/<div class="case-menu-tx">[\s\S]*?<\/div>/, `<div class="case-menu-tx">${description}</div>`)
    .replace(/<div data-after="EXPLORE" class="footagemenu-cta-tx smaller">5\/5<\/div>/, "")
    .replace(/href="\/work"/g, `href="${backHref}" target="_top"`)
    .replace(/>All Work</gi, ">BACK TO MAP<")
    // All visible Siena identity in desktop + mobile navigation becomes Grey Matter.
    .replace(/SIENA(?:&nbsp;|\s)+FILM(?:&nbsp;|\s)+FOUNDATION\.?/gi, "THE GREY MATTER")
    .replace(/©\s*2024\.\s*SIENA(?:&nbsp;|\s)+FILM(?:&nbsp;|\s)+FOUNDATION\.?/gi, "©2024. THE GREY MATTER.")
    .replace(/@siena\.\s*All Rights Reserved/gi, "THE GREY MATTER. All Rights Reserved")
    .replace(/>SIENA</gi, ">THE GREY MATTER<")
    .replace(/LEE@SIENA\.FILM/gi, "")
    .replace(/LIMOR PINHASOV|ODED KIRMA|DORIT HAKIM KRAMER|LILACH SHAYO|LEELU DORIT/gi, "");

  html = `<!doctype html><html class="w-mod-js w-mod-ix"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/siena-work-space.css"><link rel="stylesheet" href="/siena-out.css"><link rel="stylesheet" href="/siena-webflow.css"><style>
      html,body,.w,.pw.cs{background:radial-gradient(circle at 50% 25%,#2B4E7D 0%,#172A4D 48%,#0E1F3D 100%)!important}
      [data-gl=c],.canvas{background:#0E1F3D!important}
      .nav-link.logo .svg-logo{display:none!important}
      .nav-link.logo:after{content:'THE GREY MATTER';color:#fff;font:700 13px/1 Arial,sans-serif;letter-spacing:.12em;white-space:nowrap}
      /* User requested: no Siena footer mark or newsletter signup. */
      .logo-footer,.ft-newsletter-w,.ft-sitemap-w,.ft-contact-w,.footer-line.last,.footagemenu-stars,.video-cta-w .div-block-24{display:none!important}
      .menu-w{display:none!important}.detail-index{position:fixed;z-index:9999;inset:0;background:#f4f1ea;color:#111;padding:clamp(1.25rem,4vw,3rem);display:none;overflow:auto}.detail-index[data-open=true]{display:block}.detail-index__top{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid currentColor;padding-bottom:1rem;font:700 13px/1 Arial,sans-serif;letter-spacing:.12em}.detail-index__close{border:0;background:none;color:inherit;font:inherit;letter-spacing:inherit;cursor:pointer}.detail-index__list{display:grid;gap:0;margin-top:1.5rem}.detail-index__list a{border-bottom:1px solid currentColor;color:inherit;padding:1rem 0;text-decoration:none;font:clamp(1.35rem,4vw,2.5rem)/1.05 Arial,sans-serif}.detail-index__list span{display:inline-block;width:3rem;font-size:.65em}.detail-index-toggle{position:fixed;z-index:9998;top:1.5rem;right:1.5rem;border:1px solid currentColor;background:transparent;color:inherit;padding:.55rem .7rem;font:700 11px/1 Arial,sans-serif;letter-spacing:.12em;cursor:pointer}
    </style></head><body>${html}<button class="detail-index-toggle" type="button">INDEX</button><aside class="detail-index" aria-hidden="true"><div class="detail-index__top"><span>THE GREY MATTER</span><button class="detail-index__close" type="button">CLOSE</button></div><nav class="detail-index__list">${indexItems}</nav></aside><script>document.addEventListener('DOMContentLoaded',()=>{const panel=document.querySelector('.detail-index'),toggle=document.querySelector('.detail-index-toggle'),close=document.querySelector('.detail-index__close');const set=(open)=>{panel.dataset.open=open;panel.setAttribute('aria-hidden',String(!open));toggle.textContent=open?'CLOSE':'INDEX'};toggle.onclick=()=>set(panel.dataset.open!=='true');close.onclick=()=>set(false)})</script><script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js"></script><script src="/siena-webflow.js"></script><script src="/siena-app.js"></script></body></html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
