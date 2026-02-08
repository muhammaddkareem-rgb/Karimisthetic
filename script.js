const themeToggle = document.querySelector("[data-theme-toggle]");
const body = document.body;

const setTheme = (theme) => {
  if (theme === "dark") {
    body.classList.add("dark");
  } else {
    body.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
};

const getPreferredTheme = () => {
  const stored = localStorage.getItem("theme");
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

setTheme(getPreferredTheme());

themeToggle?.addEventListener("click", () => {
  const nextTheme = body.classList.contains("dark") ? "light" : "dark";
  setTheme(nextTheme);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-in");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const navLinks = document.querySelectorAll(".nav-links a");
navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const renderCollection = (collection) => {
  const root = document.querySelector("[data-collection]");
  if (!root || !collection) return;

  const title = root.querySelector("[data-collection-title]");
  const subtitle = root.querySelector("[data-collection-subtitle]");
  const image = root.querySelector("[data-collection-image]");
  const grid = root.querySelector("[data-product-grid]");

  if (title) title.textContent = collection.title;
  if (subtitle) subtitle.textContent = collection.subtitle;
  if (image) {
    image.style.backgroundImage = `url("${collection.heroImage}")`;
  }

  if (!grid) return;
  grid.innerHTML = "";

  if (!collection.products || collection.products.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Product picks are loading soon.";
    grid.appendChild(empty);
    return;
  }

  collection.products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card reveal";

    const imageEl = document.createElement("div");
    imageEl.className = "product-image";
    imageEl.style.backgroundImage = `url("${product.image}")`;

    const body = document.createElement("div");
    body.className = "product-body";

    const name = document.createElement("h3");
    name.textContent = product.name;

    const desc = document.createElement("p");
    desc.className = "muted";
    desc.textContent = product.description;

    const meta = document.createElement("div");
    meta.className = "product-meta";

    const price = document.createElement("span");
    price.textContent = product.price;

    const link = document.createElement("a");
    link.href = product.link || "#";
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "View";

    meta.appendChild(price);
    meta.appendChild(link);
    body.appendChild(name);
    body.appendChild(desc);
    body.appendChild(meta);

    card.appendChild(imageEl);
    card.appendChild(body);
    grid.appendChild(card);
    observer.observe(card);
  });
};

const loadCollectionPage = async () => {
  const root = document.querySelector("[data-collection]");
  if (!root) return;

  const slug = root.dataset.collection;
  const dataPath = root.dataset.productsPath || "../data/products.json";

  try {
    const response = await fetch(dataPath);
    if (!response.ok) throw new Error("Unable to load collection data.");
    const data = await response.json();
    const collection = data.collections?.find((item) => item.slug === slug);
    renderCollection(collection);
  } catch (error) {
    const grid = root.querySelector("[data-product-grid]");
    if (grid) {
      grid.innerHTML = "<p class=\"muted\">Collection data could not load.</p>";
    }
  }
};

loadCollectionPage();
