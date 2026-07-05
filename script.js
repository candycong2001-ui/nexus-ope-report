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

const presentationDeck = document.querySelector(".presentation-deck");
const presentationSlide = presentationDeck?.querySelector(".presentation-slide");
const presentationCounter = presentationDeck?.querySelector(".presentation-counter");
const presentationToggle = document.querySelector(".presentation-toggle");
const presentationPrev = presentationDeck?.querySelector(".presentation-prev");
const presentationNext = presentationDeck?.querySelector(".presentation-next");
const presentationClose = presentationDeck?.querySelector(".presentation-close");
let presentationIndex = 0;

function currentSectionIndex() {
  const activeHash = navLinks.find((link) => link.classList.contains("is-active"))?.getAttribute("href");
  const activeId = activeHash?.replace("#", "");
  const index = sections.findIndex((section) => section.id === activeId);
  return index >= 0 ? index : 0;
}

function renderPresentationSlide(index) {
  if (!presentationSlide || !presentationCounter || !sections.length) return;
  presentationIndex = Math.max(0, Math.min(index, sections.length - 1));
  const section = sections[presentationIndex].cloneNode(true);
  section.removeAttribute("id");
  section.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  section.querySelectorAll("video").forEach((video) => {
    video.controls = true;
    video.pause();
  });
  presentationSlide.replaceChildren(section);
  presentationCounter.textContent = `${presentationIndex + 1} / ${sections.length}`;
}

async function openPresentation() {
  if (!presentationDeck) return;
  renderPresentationSlide(currentSectionIndex());
  presentationDeck.hidden = false;
  document.body.classList.add("has-presentation");
  presentationDeck.focus?.();
  if (presentationDeck.requestFullscreen && !document.fullscreenElement) {
    try {
      await presentationDeck.requestFullscreen({ navigationUI: "hide" });
    } catch {
      // Fullscreen can be blocked by the browser; the in-page deck still works.
    }
  }
}

function closePresentation(exitFullscreen = true) {
  if (!presentationDeck || presentationDeck.hidden) return;
  presentationDeck.hidden = true;
  presentationSlide?.replaceChildren();
  document.body.classList.remove("has-presentation");
  if (exitFullscreen && document.fullscreenElement === presentationDeck) {
    document.exitFullscreen?.().catch(() => {});
  }
}

function goPresentation(delta) {
  if (!presentationDeck || presentationDeck.hidden) return;
  renderPresentationSlide(presentationIndex + delta);
}

presentationToggle?.addEventListener("click", openPresentation);
presentationPrev?.addEventListener("click", () => goPresentation(-1));
presentationNext?.addEventListener("click", () => goPresentation(1));
presentationClose?.addEventListener("click", () => closePresentation());

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && presentationDeck && !presentationDeck.hidden) {
    closePresentation(false);
  }
});

window.addEventListener("keydown", (event) => {
  if (presentationDeck && !presentationDeck.hidden) {
    if (["ArrowRight", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      goPresentation(1);
    }
    if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      goPresentation(-1);
    }
    if (event.key === "Escape") closePresentation();
  }
});
