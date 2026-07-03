const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

let ticking = false;

function setActiveSection(sectionId) {
  let activeLink = null;
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) activeLink = link;
  });
  activeLink?.scrollIntoView({ block: "nearest", inline: "center" });
}

function updateActiveSection() {
  const marker = window.scrollY + Math.min(window.innerHeight * 0.45, 380);
  const current =
    sections.reduce((active, section) => {
      return section.offsetTop <= marker ? section : active;
    }, sections[0]) || sections[0];

  if (current) setActiveSection(current.id);
}

function requestActiveUpdate() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updateActiveSection();
    ticking = false;
  });
}

window.addEventListener("scroll", requestActiveUpdate, { passive: true });
window.addEventListener("hashchange", () => window.setTimeout(updateActiveSection, 80));
window.addEventListener("load", updateActiveSection);
updateActiveSection();

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("figcaption");
const lightboxClose = lightbox?.querySelector(".lightbox__close");

function openLightbox(trigger) {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;
  lightboxImage.src = trigger.dataset.full;
  lightboxImage.alt = trigger.querySelector("img")?.alt || "";
  lightboxCaption.textContent = trigger.dataset.title || "";
  lightbox.hidden = false;
  document.body.classList.add("has-lightbox");
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.classList.remove("has-lightbox");
}

document.querySelectorAll(".screenshot-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => openLightbox(trigger));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox?.hidden) closeLightbox();
});
