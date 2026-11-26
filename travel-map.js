const map = document.querySelector(".world-map");
const figure = map.closest("figure");
const card = document.querySelector("#country-card");
const nameLabel = card.querySelector(".country-name");
const closeButton = card.querySelector(".country-close");
const destination = card.querySelector(".country-destination");
const preview = document.querySelector("#destination-preview");
const previewHeading = document.querySelector("#preview-heading");

const mapTotal = document.querySelector(".map-total");
mapTotal.querySelector(".map-total-number").textContent = map.querySelectorAll("[data-visited]").length;
mapTotal.hidden = false;

let activeCountry = null;
let pinned = false;

function placeCard(clientX, clientY) {
  const bounds = figure.getBoundingClientRect();
  const x = clientX - bounds.left;
  const y = clientY - bounds.top;
  const gap = 12;
  const left = Math.max(gap, Math.min(x + gap, bounds.width - card.offsetWidth - gap));
  const above = y - card.offsetHeight - gap;
  const top = above >= gap ? above : y + gap;
  card.style.left = left + "px";
  card.style.top = Math.max(gap, Math.min(top, bounds.height - card.offsetHeight - gap)) + "px";
}

function showCountry(country, keepOpen, point) {
  activeCountry?.setAttribute("aria-expanded", "false");
  activeCountry?.classList.remove("is-active");
  activeCountry = country;
  pinned = keepOpen;
  country.setAttribute("aria-expanded", String(pinned));
  country.classList.add("is-active");

  const name = country.getAttribute("data-country");
  const route = country.getAttribute("href");
  nameLabel.textContent = name;
  closeButton.hidden = !pinned;
  destination.hidden = !(pinned && route);

  if (route) {
    destination.setAttribute("href", route);
    destination.textContent = "View map";
  }

  card.hidden = false;
  card.toggleAttribute("data-pinned", pinned);
  const bounds = country.getBoundingClientRect();
  placeCard(point?.clientX ?? bounds.left + bounds.width / 2,
    point?.clientY ?? bounds.top + bounds.height / 2);
}

function closeCountry(restoreFocus = false) {
  if (!activeCountry) return;
  const country = activeCountry;
  if (restoreFocus) country.focus();
  country.setAttribute("aria-expanded", "false");
  country.classList.remove("is-active");
  activeCountry = null;
  pinned = false;
  card.hidden = true;
}

map.addEventListener("pointerover", (event) => {
  if (pinned || event.pointerType !== "mouse") return;
  const country = event.target.closest("[data-country]");
  if (country) showCountry(country, false, event);
});

map.addEventListener("pointerout", (event) => {
  if (pinned || event.pointerType !== "mouse") return;
  const from = event.target.closest("[data-country]");
  const to = event.relatedTarget?.closest?.("[data-country]");
  if (from && from !== to) closeCountry();
});

map.addEventListener("click", (event) => {
  const country = event.target.closest("[data-country]");
  if (!country || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (pinned && country === activeCountry) {
    closeCountry();
    return;
  }
  showCountry(country, true, event.detail ? event : null);
  if (!event.detail) (destination.hidden ? closeButton : destination).focus();
});

map.addEventListener("keydown", (event) => {
  const country = event.target.closest("[data-country]");
  if (!country) return;
  const activate = event.key === " " || (event.key === "Enter" && !country.hasAttribute("href"));
  if (!activate) return;
  event.preventDefault();
  showCountry(country, true);
  (destination.hidden ? closeButton : destination).focus();
});

closeButton.addEventListener("click", () => closeCountry(true));

destination.addEventListener("click", (event) => {
  if (!activeCountry?.hasAttribute("data-preview") ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  previewHeading.textContent = activeCountry.getAttribute("data-country") + " Map";
  preview.showModal();
});

document.addEventListener("pointerdown", (event) => {
  if (!pinned || preview.open || card.contains(event.target) ||
      event.target.closest("[data-country]")) return;
  closeCountry();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !preview.open) closeCountry(pinned);
});

window.addEventListener("resize", () => closeCountry(card.contains(document.activeElement)));
