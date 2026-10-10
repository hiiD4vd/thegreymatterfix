/* ---------------------------------------------------------------------------
   lib/sienaRender.js
   Merangkai ulang template Siena (components/SienaTemplate.js) memakai data
   The Grey Matter (lib/stories.js).

   Struktur & nama class HTML tidak diubah sama sekali -> tampilan identik Siena.
   Yang berubah hanya ISI. Field yang belum ada datanya disembunyikan otomatis
   supaya layout tidak menampilkan kotak kosong.
   --------------------------------------------------------------------------- */

import { STORIES, SITE } from "./stories";
import {
  SIENA_RAW_HTML,
  SIENA_MENU_ITEM,
  SIENA_FOOTAGE_ITEM,
  SIENA_SMALL_MENU_ITEM,
  SIENA_PREVNEXT_ITEM,
} from "@/components/SienaTemplate";

const pad2 = (n) => String(n).padStart(2, "0");

/* --- 1. satu baris data per cerita ------------------------------------- */
function rowFor(story, i) {
  const credits = story.credits || {};
  return {
    slug: story.id,
    title: story.title || "",
    category: story.category || "",
    year: story.year || "",
    minutes: story.minutes || "",
    thumbnail: story.thumbnail || "",
    headline: story.headline || story.blurb || "",
    director: credits.director || "",
    producer: credits.producer || "",
    creditDirector: credits.director || "",
    creditDop: credits.dop || "",
    creditEditor: credits.editor || "",
    creditMusic: credits.music || "",
    creditExecProducer: credits.execProducer || "",
    creditProducer: credits.producer || "",
  };
}

/* --- 2. loop template item --------------------------------------------- */
function expand(tpl, rows) {
  if (!rows.length) return "";
  return rows
    .map((r) => tpl.replace(/\{\{item:(\w+)\}\}/g, (_, key) => r[key] ?? ""))
    .join("");
}

/* State visual per item (meniru output statis Siena: hanya item aktif terlihat) */
function setVisible(html, visible) {
  const style = visible
    ? 'style="opacity: 1; visibility: inherit;"'
    : 'style="opacity: 0; visibility: hidden;"';
  return html.replace(/style="opacity: [^"]*"/, style);
}

function setDisplayFlex(html, flex) {
  const from = flex ? "display: none;" : "display: flex;";
  const to = flex ? "display: flex;" : "display: none;";
  return html.replace(from, to);
}

/* --- 3. buang elemen yang datanya kosong (biar tidak ada kotak kosong) --- */
function stripEmpty(html) {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(`<div id="r">${html}</div>`, "text/html");
  const root = doc.getElementById("r");

  const blank = (el) => !el || !(el.textContent || "").trim();

  // entri kredit tanpa nama
  root.querySelectorAll(".credit-text").forEach((el) => {
    if (blank(el.querySelector(".credit-name"))) el.style.display = "none";
  });

  // blok kredit besar (kiri) tanpa nama
  root.querySelectorAll(".credit-main-q").forEach((el) => {
    if (blank(el.querySelector(".credit-name"))) el.style.display = "none";
  });

  // chip info (tahun / durasi) kosong
  root.querySelectorAll(".info-grid-w").forEach((el) => {
    if (blank(el.querySelector(".info-grid-tx"))) el.style.display = "none";
  });

  // panel footage tanpa judul
  root.querySelectorAll(".footagemenu-text-box").forEach((el) => {
    const anyText = [...el.querySelectorAll(".footage-menu-title")].some(
      (t) => (t.textContent || "").trim()
    );
    if (!anyText) el.style.display = "none";
  });

  // tautan kontak tanpa email
  root.querySelectorAll('a[href^="mailto:"]').forEach((el) => {
    const href = el.getAttribute("href") || "";
    if (href.replace("mailto:", "").trim() === "") {
      const li = el.closest("li") || el;
      li.style.display = "none";
    }
  });

  // sitemap / footer kosong
  root.querySelectorAll(".footer-of-w").forEach((el) => {
    if (blank(el)) el.style.display = "none";
  });

  return root.innerHTML;
}

/* --- 4. API utama ------------------------------------------------------- */
export function renderSienaHtml(story) {
  const idx = Math.max(
    0,
    STORIES.findIndex((s) => s.id === story.id)
  );
  const current = STORIES[idx];
  const nextIdx = (idx + 1) % STORIES.length;
  const prevIdx = (idx - 1 + STORIES.length) % STORIES.length;

  const rows = STORIES.map((s, i) => rowFor(s, i));
  const cur = rows[idx];

  const menuHtml = rows
    .map((r, i) => setVisible(expand(SIENA_MENU_ITEM, [r]), i === idx))
    .join("");

  const smallMenuHtml = expand(SIENA_SMALL_MENU_ITEM, rows);

  const footageHtml = rows
    .map((r, i) => setVisible(expand(SIENA_FOOTAGE_ITEM, [r]), i === idx))
    .join("");

  const prevNextHtml = rows
    .map((r, i) => setDisplayFlex(expand(SIENA_PREVNEXT_ITEM, [r]), i === nextIdx))
    .join("");

  let html = SIENA_RAW_HTML
    .replace(/\{\{MENU_ITEMS\}\}/g, menuHtml)
    .replace(/\{\{SMALL_MENU_ITEMS\}\}/g, smallMenuHtml)
    .replace(/\{\{FOOTAGE_ITEMS\}\}/g, footageHtml)
    .replace(/\{\{PREVNEXT_ITEMS\}\}/g, prevNextHtml)
    .replace(/\{\{STORY_TITLE\}\}/g, current.title || "")
    .replace(/\{\{STORY_TITLE_UPPER\}\}/g, (current.title || "").toUpperCase())
    .replace(/\{\{STORY_CATEGORY\}\}/g, current.category || "")
    .replace(/\{\{STORY_CATEGORY_UPPER\}\}/g, (current.category || "").toUpperCase())
    .replace(/\{\{STORY_DESCRIPTION\}\}/g, current.description || "")
    .replace(/\{\{STORY_THUMBNAIL\}\}/g, current.thumbnail || "")
    .replace(
      /\{\{STORY_VIDEO\}\}/g,
      current.videoUrl
        ? `<iframe src="${current.videoUrl}" style="width: 100%; height: 100%; border: none;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
        : ""
    )
    .replace(/\{\{SITE_NAME_UPPER\}\}/g, (SITE.name || "").toUpperCase())
    .replace(/\{\{SITE_TAGLINE_UPPER\}\}/g, (SITE.tagline || "").toUpperCase())
    .replace(/\{\{SITE_COPYRIGHT\}\}/g, SITE.copyright || "")
    .replace(/\{\{SITE_EMAIL\}\}/g, SITE.email || "")
    .replace(/\{\{EPISODE_NUMBER\}\}/g, pad2(idx + 1))
    .replace(/\{\{CREDIT_DIRECTOR\}\}/g, cur.creditDirector)
    .replace(/\{\{CREDIT_DOP\}\}/g, cur.creditDop)
    .replace(/\{\{CREDIT_EDITOR\}\}/g, cur.creditEditor)
    .replace(/\{\{CREDIT_MUSIC\}\}/g, cur.creditMusic)
    .replace(/\{\{CREDIT_EXEC_PRODUCER\}\}/g, cur.creditExecProducer)
    .replace(/\{\{CREDIT_PRODUCER\}\}/g, cur.creditProducer)
    // leftover Siena footer/metadata from raw Webflow HTML
    .replace(/LEE@SIENA\.FILM/gi, SITE.email || "")
    .replace(/LEE@THE GREY MATTER\.FILM/gi, SITE.email || "")
    .replace(/SIENA FILM FOUNDATION\.?/gi, SITE.name || "The Grey Matter")
    .replace(/FILM TV/gi, (current.category || "").toUpperCase())
    .replace(
      /<\/header><div class="s h-auto bg-white relative" data-color="white" id="second">/,
      `</header><section class="gm-case-intro"><div class="gm-case-category">${(current.category || "").toUpperCase()}</div><div class="gm-case-rule"></div><h2 class="gm-case-title">${(current.title || "").toUpperCase()}</h2></section><div class="s h-auto bg-white relative" data-color="white" id="second">`
    )
    .replace(
      /<\/head>/i,
      `<style>
        .nav-link.logo .svg-logo{display:none!important}
        .nav-link.logo::after{content:"THE GREY MATTER";display:block;color:#fff;font:700 13px/1 Arial,sans-serif;letter-spacing:.12em;white-space:nowrap}
        .gm-case-intro{background:#f7f5ef;padding:34px 2.2vw 0;color:#111;text-align:center}
        .gm-case-category{font:500 11px/1 Arial,sans-serif;letter-spacing:.18em}
        .gm-case-rule{height:1px;background:#1b1b1b;margin-top:24px}
        .gm-case-title{margin:14px 0 0;font:400 clamp(48px,8vw,142px)/.82 Arial,sans-serif;letter-spacing:-.06em}
      </style></head>`
    )
    .replace(/>All Work</gi, ">BACK TO MAP<")
    .replace(/href="\/work"/g, 'href="/"')
    .replace(/STAY UP TO DATE/gi, SITE.tagline || "")
    .replace(/FOLLOW US —/gi, "")
    .replace(/INQUIRIES/gi, SITE.email ? "INQUIRIES" : "");

  html = stripEmpty(html);

  // sisa token yang belum terisi jangan tampil sebagai teks mentah
  html = html.replace(/\{\{[A-Z_:a-z]+\}\}/g, "");

  return { html, prev: STORIES[prevIdx], next: STORIES[nextIdx] };
}
