(() => {
  const stories = [
    ["drugs", "The Chemical Shortcut", "Drugs", "12", "How substances hijack the brain's reward circuitry.", "A look at how psychoactive substances flood the brain's reward pathway with dopamine, why the high fades faster each time, and what tolerance actually does to a growing mind."],
    ["pornography", "The Novelty Trap", "Pornography", "14", "Why constant novelty rewires what feels rewarding.", "An exploration of how endless novel stimuli condition the brain to crave escalation, and why real-world intimacy can start to feel underwhelming by comparison."],
    ["technology", "The Notification Loop", "Technology", "11", "The tiny dopamine hits behind every ping and swipe.", "Every buzz, badge and swipe is a small unpredictable reward. This story follows how variable-reward design keeps the brain checking back, and what it costs attention over time."],
    ["stress", "The Alarm That Won't Switch Off", "Stress", "13", "What happens when the body's alarm system stays on.", "Short bursts of stress sharpen focus. Chronic stress does the opposite. This story traces cortisol's path through the brain and body when the alarm never really turns off."],
    ["social-media", "The Mirror That Talks Back", "Social Media", "15", "Comparison, validation, and the brain's need to belong.", "Likes and comments tap directly into the brain's ancient need for social approval. This story looks at what constant comparison does to self-image over time."],
    ["sleep", "The Night the Brain Doesn't Clean Up", "Sleep Deprivation", "12", "Why a tired brain makes worse decisions than you think.", "Sleep is when the brain clears out the day's metabolic waste. This story follows what starts to break down when that nightly cleanup gets cut short."],
    ["gaming", "The Quest That Never Ends", "Gaming", "14", "Levels, loot and the loop that keeps you playing one more.", "Progress bars, loot drops and levels are engineered reward schedules. This story unpacks why just one more round is one of the hardest loops for the brain to walk away from."],
    ["anxiety", "The Threat That Isn't There", "Anxiety", "13", "When the brain's warning system fires at nothing.", "Anxiety is a warning system built for real danger, misfiring at imagined ones. This story follows the loop between the amygdala and the racing thoughts it sets off."],
  ].map(([id, title, category, minutes, blurb, description], index) => ({
    id, title, category, minutes, blurb, description, year: "2024",
    art: `/v2-a24/grey-matter-discs/${String((index % 4) + 1).padStart(2, "0")}.jpg`,
  }));

  const text = (root, selector, value) => root.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
  const first = stories[0];
  document.title = "The Grey Matter — Stories";
  document.querySelector('meta[name="description"]')?.setAttribute("content", "Eight short stories exploring how the mind reacts to everyday loops.");
  // Keep only the interactive index in the V2 navigation.
  document.querySelectorAll(".nav-link:not([data-dropdown-toggle])").forEach((link) => link.closest("li")?.remove());
  const indexLabel = document.querySelector("[data-dropdown-toggle] .nav-link__label");
  if (indexLabel) indexLabel.textContent = "INDEX";
  text(document, "[data-film-target='title']", first.title);
  text(document, "[data-film-target='primary-credit']", first.category);
  text(document, "[data-film-target='year']", first.year);
  text(document, "[data-film-target='starring']", `EP. ${first.minutes}`);
  document.querySelectorAll(".info-content_label-wrap").forEach((node, index) => {
    text(node, "p", ["TOPIC", "YEAR", "EPISODE"][index] || "");
  });
  const reviews = [...document.querySelectorAll("[data-review-target-item]")];
  reviews.forEach((review, index) => {
    const story = stories[index % stories.length];
    text(review, "[data-film-target='review-publication']", story.category.toUpperCase());
    text(review, "[data-film-target='review-testimonial']", story.blurb);
  });

  const items = [...document.querySelectorAll("[data-film-item]")];
  items.forEach((item, index) => {
    const story = stories[index];
    if (!story) { item.remove(); return; }
    text(item, '[data-film-field="title"]', story.title);
    text(item, '[data-film-field="directors"]', story.category);
    text(item, '[data-film-field="year"]', story.year);
    text(item, '[data-film-field="starring"]', `EP. ${story.minutes}`);
    text(item, '[data-film-field="disc-art-url"]', story.art);
    text(item, '[data-film-field="disc-art-alt"]', `${story.title} artwork`);
    item.querySelectorAll('[data-film-field="detail-url"]').forEach((link) => link.setAttribute("href", `/v2/story/${story.id}`));
    text(item, '[data-film-field="review-publication"]', story.category.toUpperCase());
    text(item, '[data-film-field="review-testimonial"]', story.blurb);
    text(item, '[data-film-field="review-stars"]', "");
  });

  const dropdownItems = [...document.querySelectorAll(".nav-dropdown__content-li > .w-dyn-item")];
  dropdownItems.forEach((item, index) => {
    const story = stories[index];
    if (!story) { item.remove(); return; }
    const link = item.querySelector("a");
    if (link) { link.href = `/v2/story/${story.id}`; link.dataset.filmScroll = story.title; }
    const labels = item.querySelectorAll(".nav-dropdown__link-label");
    if (labels[0]) labels[0].textContent = story.title;
    if (labels[1]) labels[1].textContent = story.year;
  });

  document.querySelectorAll(".nav-logo").forEach((node) => node.setAttribute("aria-label", "The Grey Matter"));

  const watch = document.createElement("button");
  watch.className = "gm-mobile-watch";
  watch.type = "button";
  watch.innerHTML = '<span class="gm-watch-label">TONTON</span><span class="gm-watch-arrow"><svg viewBox="0 0 11 10" aria-hidden="true"><path d="M4.481.005a6.65 6.65 0 0 1 6.46 4.659c.078.229.08.479-.003.706C10.302 7.105 8.318 10 4.48 10V8.39c.941.127 2.922-.257 4.442-2.603H0V4.208h8.938c-.756-1.229-2.216-2.78-4.457-2.78V.006Z"/></svg></span><svg class="gm-watch-shape" viewBox="0 0 142 44" aria-hidden="true"><path d="M5 1h90c0 1 .6 3 3 3s3-2 3-3h36c0 3.2 2.667 4.144 4 4.216V39c-3.2 0-4 2.667-4 4h-35c0-1.333-.8-4-4-4s-4 2.667-4 4H5c0-3.6-2.667-4.167-4-4V5c3.2 0 4-2.667 4-4Z"/><path d="M98 4.5v34" stroke-dasharray="4"/></svg>';
  let active = first;
  watch.addEventListener("click", () => {
    window.top.location.href = `/v2/story/${active.id}`;
  });
  document.body.append(watch);
  document.addEventListener("discgallerychange", (event) => {
    active = stories.find((story) => story.title === event.detail?.film?.title) || active;
  });
  document.documentElement.dataset.greyMatter = "true";
})();
