import { SIENA_ORIGINAL_HTML } from "@/lib/sienaOriginalHtml";
import { STORIES } from "@/lib/stories";

const up = (v = "") => v.toUpperCase();
const setText = (root, selector, text) => {
  root.querySelectorAll(selector).forEach((el) => { el.textContent = text; });
};
const setImage = (root, selector, src) => {
  root.querySelectorAll(selector).forEach((el) => {
    el.setAttribute("src", src);
    el.removeAttribute("srcset");
  });
};

// Exact Siena source DOM. Only content nodes are replaced; its structure/classes stay untouched.
export function renderOriginalSiena(story) {
  const doc = new DOMParser().parseFromString(SIENA_ORIGINAL_HTML, "text/html");
  const root = doc.body;
  const storyIndex = STORIES.findIndex((item) => item.id === story.id);
  const next = STORIES[(storyIndex + 1) % STORIES.length];
  const title = story.title;
  const category = up(story.category);
  const year = story.year || "2024";
  const minutes = story.minutes || "";

  // Main hero and all visual references for this story.
  setImage(root, ".cs-main-img, .image-2, .credit-main-img, .dc-bg-img", story.thumbnail);
  setText(root, ".cs-title", up(title));
  setText(root, ".roll-cont-eyeb.parish.larger.is-cs", category);

  // Siena source has many menu cards. The visible one is controlled by its
  // runtime, so overwrite every raw Siena card with the active Grey Matter story.
  root.querySelectorAll(".top-m-film-title").forEach((el) => { el.textContent = title; });
  root.querySelectorAll(".menu-main-film-img").forEach((el) => {
    el.src = story.thumbnail;
    el.removeAttribute("srcset");
  });
  root.querySelectorAll(".menu-row-film-item").forEach((item) => {
    const cells = item.querySelectorAll(".info-grid-tx");
    if (cells[0]) cells[0].textContent = story.category;
    if (cells[1]) cells[1].textContent = year;
    if (cells[2]) cells[2].textContent = `MIN. ${minutes}`;
  });

  // Immediate Siena section after hero: category line + enormous title.
  const hero = root.querySelector("header.cs-hero");
  if (hero) {
    hero.insertAdjacentHTML("afterend", `<section class="s bg-white gm-siena-title" data-color="white"><div class="gm-siena-eyeb">${category}</div><div class="gm-siena-line"></div><h2 class="gm-siena-title-text">${up(title)}</h2></section>`);
  }

  // Keep Grey Matter identity only. Layout/placement remains Siena.
  const logo = root.querySelector(".nav-link.logo");
  if (logo) {
    logo.innerHTML = '<span class="gm-logo">THE GREY MATTER</span>';
    logo.setAttribute("href", "/");
  }
  const back = root.querySelector(".work-back-btn");
  if (back) { back.setAttribute("href", "/"); const t = back.querySelector(".roll-cont-eyeb"); if (t) t.textContent = "BACK TO MAP"; }

  // Current data in information sections.
  root.querySelectorAll(".case-menu-tx").forEach((el) => { el.textContent = story.description || story.blurb || ""; });
  root.querySelectorAll(".credit-name").forEach((el) => { if (/Limor|Oded|Dorit|Lilach|Leelu/i.test(el.textContent)) el.textContent = ""; });
  root.querySelectorAll(".previousnext-he").forEach((el) => { if (/ANA MAXIM|ALL WORK/i.test(el.textContent)) el.textContent = up(next.title); });

  // Local video data.
  const player = root.querySelector('[data-videoplayer="video"]');
  if (player && story.videoUrl) player.innerHTML = `<iframe src="${story.videoUrl}" title="${title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="border:0;width:100%;height:100%"></iframe>`;

  return root.innerHTML;
}
