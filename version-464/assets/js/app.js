(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var keywordInput = panel.querySelector("[data-filter-keyword]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var empty = document.querySelector("[data-filter-empty]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function apply() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" "));
        var matched = true;
        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && normalize(card.getAttribute("data-year")) !== year) {
          matched = false;
        }
        if (region && normalize(card.getAttribute("data-region")) !== region) {
          matched = false;
        }
        if (type && normalize(card.getAttribute("data-type")) !== type) {
          matched = false;
        }
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function setupSearch() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_ITEMS) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var subtitle = document.querySelector("[data-search-subtitle]");
    var empty = document.querySelector("[data-search-empty]");

    if (input && query) {
      input.value = params.get("q");
    }

    if (!query) {
      return;
    }

    var matches = window.SEARCH_ITEMS.filter(function (item) {
      return normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.tags,
        item.description
      ].join(" ")).indexOf(query) !== -1;
    }).slice(0, 240);

    if (title) {
      title.textContent = "搜索结果";
    }
    if (subtitle) {
      subtitle.textContent = "与“" + params.get("q") + "”相关的影视内容";
    }

    results.innerHTML = matches.map(function (item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\" data-year=\"" + item.year + "\" data-region=\"" + escapeHtml(item.region) + "\" data-type=\"" + escapeHtml(item.type) + "\" data-tags=\"" + escapeHtml(item.tags.join(" ")) + "\">",
        "<a class=\"movie-poster\" href=\"./" + item.file + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
        "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
        "<span class=\"rating-badge\">" + item.rating + "</span>",
        "</a>",
        "<div class=\"movie-info\">",
        "<h3><a href=\"./" + item.file + "\">" + escapeHtml(item.title) + "</a></h3>",
        "<p class=\"movie-desc\">" + escapeHtml(item.description) + "</p>",
        "<div class=\"movie-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + item.year + "</span><span>" + escapeHtml(item.type) + "</span></div>",
        "<div class=\"movie-tags\">" + tags + "</div>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");

    if (empty) {
      empty.hidden = matches.length !== 0;
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var startButton = player.querySelector("[data-player-start]");
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute("data-stream");
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (attached || !streamUrl) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = streamUrl;
      }

      function play() {
        attach();
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (startButton) {
        startButton.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (!attached || video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
    setupPlayers();
  });
})();
