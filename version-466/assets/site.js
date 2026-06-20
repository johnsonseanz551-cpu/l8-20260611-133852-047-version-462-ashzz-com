(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function includesAny(haystack, needle) {
    return !needle || text(haystack).indexOf(text(needle)) !== -1;
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupLocalFilter() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector(".filter-input");
    var year = panel.querySelector(".filter-year");
    var region = panel.querySelector(".filter-region");
    var type = panel.querySelector(".filter-type");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var empty = document.querySelector(".empty-state");
    function apply() {
      var query = input ? input.value : "";
      var selectedYear = year ? year.value : "";
      var selectedRegion = region ? region.value : "";
      var selectedType = type ? type.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var content = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre")
        ].join(" ");
        var ok = includesAny(content, query);
        ok = ok && (!selectedYear || card.getAttribute("data-year") === selectedYear);
        ok = ok && (!selectedRegion || card.getAttribute("data-region") === selectedRegion);
        ok = ok && (!selectedType || card.getAttribute("data-type") === selectedType);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    [input, year, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.SITE_MOVIES) {
      return;
    }
    var input = root.querySelector("[name='q']");
    var year = root.querySelector("[name='year']");
    var type = root.querySelector("[name='type']");
    var results = root.querySelector(".search-results");
    var note = root.querySelector(".search-results-note");
    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }
    function card(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
        "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
        "<span class=\"play-corner\">▶</span></a>" +
        "<div class=\"movie-card-body\"><div class=\"card-meta\">" +
        "<span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span>" +
        "</div><h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
        "<p>" + escapeHtml(movie.description) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
    }
    function apply() {
      var query = input ? input.value : "";
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      var queryText = text(query);
      var data = window.SITE_MOVIES.filter(function (movie) {
        var target = text([movie.title, movie.description, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(" ")].join(" "));
        var ok = !queryText || target.indexOf(queryText) !== -1;
        ok = ok && (!selectedYear || movie.year === selectedYear);
        ok = ok && (!selectedType || movie.type === selectedType);
        return ok;
      }).slice(0, 120);
      results.innerHTML = data.map(card).join("");
      if (note) {
        note.textContent = data.length ? "为你匹配到以下内容" : "暂无匹配影片";
      }
    }
    [input, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
