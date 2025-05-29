  <script>
  fetch("https://sc-nav.take-courage.workers.dev/")
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const nav = doc.querySelector("nav");
      if (nav) {
        document.getElementById("nav-placeholder").replaceWith(nav);

        // 🔄 Reinitialise Webflow JS after inserting nav
        setTimeout(() => {
          if (window.Webflow && typeof window.Webflow.ready === "function") {
            window.Webflow.ready();
          }
          if (window.Webflow && Array.isArray(window.Webflow.require)) {
            try {
              window.Webflow.require("ix2").init();
            } catch (e) {
              console.warn("Webflow interactions not initialised:", e);
            }
          }
        }, 100);

      } else {
        document.getElementById("nav-placeholder").innerText = "Navigation not found.";
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
      document.getElementById("nav-placeholder").innerText = "Failed to load navigation.";
    });
</script>

<script>
<!-- Show nav border -->
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('[nav-border="trigger"]').forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        document.querySelectorAll('[nav-border="target"]').forEach(function (target) {
          target.classList.add("is--visible");
        });
      });
    });

    document.querySelectorAll('[nav-border="remove"]').forEach(function (remover) {
      remover.addEventListener("click", function () {
        document.querySelectorAll('[nav-border="target"]').forEach(function (target) {
          target.classList.remove("is--visible");
        });
      });
    });
  });
</script>

<script>
<!-- Change page theme when hovering over nav card -->
document.addEventListener("DOMContentLoaded", function () {
  const scBody = document.querySelector(".sc-body");
  let originalThemeClass = null;
  let currentHoverTheme = null;

  function getThemeClassList(el) {
    return Array.from(el.classList).filter(cls => cls.startsWith("is--"));
  }

  document.body.addEventListener("mouseover", function (e) {
    const target = e.target.closest("[theme]");
    if (target) {
      const themeValue = target.getAttribute("theme");
      const newThemeClass = "is--" + themeValue;

      if (!originalThemeClass) {
        const existingThemes = getThemeClassList(scBody);
        originalThemeClass = existingThemes.length > 0 ? existingThemes[0] : null;
      }

      getThemeClassList(scBody).forEach(cls => scBody.classList.remove(cls));
      scBody.classList.add(newThemeClass);
      currentHoverTheme = newThemeClass;
    }
  });

  document.body.addEventListener("mouseout", function (e) {
    const target = e.target.closest("[theme]");
    if (target) {
      const themeValue = target.getAttribute("theme");
      const themeClass = "is--" + themeValue;

      if (currentHoverTheme === themeClass) {
        scBody.classList.remove(themeClass);

        if (originalThemeClass) {
          scBody.classList.add(originalThemeClass);
        }

        currentHoverTheme = null;
        originalThemeClass = null;
      }
    }
  });
});
</script>

<script>
<!-- Mirror card clicking -->
document.querySelectorAll('.sc-nav__card').forEach(card => {
  card.addEventListener('click', event => {
    const link = card.querySelector('a');
    if (link) {
      if (event.target !== link && !link.contains(event.target)) {
        link.click();
      }
    }
  });
});
</script>

<script>
<!-- Ghosts -->
document.addEventListener("DOMContentLoaded", () => {
  const MAX_GHOSTS = 200;
  const ADD_INTERVAL = 200;
  let lastScrollY = window.scrollY;
  let isIntensifying = false;
  let intensifyInView = false;
  let addIntervalId = null;

  function createGhosts(container, { selector, className, total, keep }) {
    const element = container.querySelector(selector);
    if (!element) return;

    const text = element.textContent;
    const existing = Array.from(container.querySelectorAll(`.${className}`));
    if (existing.length >= total) return;

    const newGhosts = [];

    for (let i = existing.length; i < total; i++) {
      const ghost = document.createElement("div");
      ghost.className = className;
      ghost.textContent = text;
      ghost.style.position = "absolute";
      ghost.style.display = "none";
      ghost.style.pointerEvents = "none";
      ghost.style.left = `${Math.random() * 100}%`;
      ghost.style.top = `${Math.random() * 100}%`;
      container.appendChild(ghost);
      newGhosts.push(ghost);
    }

    newGhosts.forEach((ghost, i) => {
      setTimeout(() => {
        ghost.style.display = "block";
      }, i * 50);
    });

    const allGhosts = [...existing, ...newGhosts];
    const toRemove = [...allGhosts];
    const keepers = [];

    for (let i = 0; i < keep; i++) {
      const idx = Math.floor(Math.random() * toRemove.length);
      keepers.push(toRemove.splice(idx, 1)[0]);
    }

    toRemove.forEach((ghost, i) => {
      setTimeout(() => {
        ghost.remove();
      }, (newGhosts.length + i) * 50);
    });
  }

  function addSingleHeaderGhost(header) {
    const h1 = header.querySelector("h1");
    if (!h1) return;

    const existing = header.querySelectorAll(".sc-header__ghost").length;
    if (existing >= MAX_GHOSTS) return;

    const ghost = document.createElement("div");
    ghost.className = "sc-header__ghost";
    ghost.textContent = h1.textContent;
    ghost.style.position = "absolute";
    ghost.style.display = "block";
    ghost.style.pointerEvents = "none";
    ghost.style.left = `${Math.random() * 100}%`;
    ghost.style.top = `${Math.random() * 100}%`;
    header.appendChild(ghost);
  }

  function removeHeaderGhosts(header, count) {
    const ghosts = Array.from(header.querySelectorAll(".sc-header__ghost"));
    const removable = ghosts.slice(5);
    for (let i = 0; i < count; i++) {
      const ghost = removable.pop();
      if (ghost) ghost.remove();
    }
  }

  function removeCardGhosts(card) {
    const ghosts = Array.from(card.querySelectorAll(".sc-card__ghost"));
    ghosts.forEach((ghost, i) => {
      setTimeout(() => {
        ghost.remove();
      }, i * 50);
    });
  }

  const headers = document.querySelectorAll('[ghost="header"]');

  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const fullyVisible = entry.intersectionRatio === 1;
      const scrollingUp = window.scrollY < lastScrollY;

      if (fullyVisible && scrollingUp) {
        createGhosts(el, {
          selector: "h1",
          className: "sc-header__ghost",
          total: 15,
          keep: 3
        });
      }
    });
    lastScrollY = window.scrollY;
  }, { threshold: 1 });

  headers.forEach(header => headerObserver.observe(header));

  window.addEventListener("load", () => {
    headers.forEach(header => {
      const rect = header.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
        createGhosts(header, {
          selector: "h1",
          className: "sc-header__ghost",
          total: 15,
          keep: 5
        });
      }
    });
  });

  const intensifyEls = document.querySelectorAll('[ghosts="intensify"]');

  const intensifyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      intensifyInView = entry.isIntersecting;

      if (intensifyInView && !addIntervalId && isIntensifying) {
        addIntervalId = setInterval(() => {
          headers.forEach(header => addSingleHeaderGhost(header));
        }, ADD_INTERVAL);
      }

      if (!intensifyInView && addIntervalId) {
        clearInterval(addIntervalId);
        addIntervalId = null;
      }
    });
  }, { threshold: 0.1 });

  intensifyEls.forEach(el => intensifyObserver.observe(el));

  window.addEventListener("scroll", () => {
    const currentY = window.scrollY;
    isIntensifying = currentY > lastScrollY;

    if (!isIntensifying && addIntervalId) {
      headers.forEach(header => removeHeaderGhosts(header, 5));
    }

    lastScrollY = currentY;
  });

  const cards = document.querySelectorAll('[ghost="card"]');
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      createGhosts(card, {
        selector: "a",
        className: "sc-card__ghost",
        total: 10,
        keep: 5
      });
    });
    card.addEventListener("mouseleave", () => {
      removeCardGhosts(card);
    });
  });
});
</script>
