(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function closeAllSearchResults() {
        document.querySelectorAll(".search-results.is-open").forEach(function (panel) {
            panel.classList.remove("is-open");
        });
    }

    function renderSearchResults(input, results) {
        var box = input.closest(".search-box");
        if (!box) {
            return;
        }
        var panel = box.querySelector(".search-results");
        if (!panel) {
            return;
        }
        panel.innerHTML = "";
        if (!results.length) {
            var empty = document.createElement("div");
            empty.className = "search-result-item";
            empty.innerHTML = "<span></span><span><strong class=\"search-result-title\">没有找到相关影片</strong><span class=\"search-result-meta\">换个片名或类型试试</span></span>";
            panel.appendChild(empty);
            panel.classList.add("is-open");
            return;
        }
        results.slice(0, 8).forEach(function (movie) {
            var link = document.createElement("a");
            link.className = "search-result-item";
            link.href = movie.url;
            link.innerHTML = "<img src=\"" + escapeAttribute(movie.cover) + "\" alt=\"" + escapeAttribute(movie.title) + "\"><span><strong class=\"search-result-title\">" + escapeHtml(movie.title) + "</strong><span class=\"search-result-meta\">" + escapeHtml(movie.year + " · " + movie.region + " · " + movie.genre) + "</span></span>";
            panel.appendChild(link);
        });
        panel.classList.add("is-open");
    }

    function setupGlobalSearch() {
        var searchData = window.SITE_SEARCH || [];
        document.querySelectorAll("[data-global-search]").forEach(function (input) {
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    closeAllSearchResults();
                    return;
                }
                var results = searchData.filter(function (movie) {
                    var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine].join(" ").toLowerCase();
                    return haystack.indexOf(query) !== -1;
                });
                renderSearchResults(input, results);
            });
            input.addEventListener("keydown", function (event) {
                if (event.key !== "Enter") {
                    return;
                }
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    return;
                }
                var first = searchData.find(function (movie) {
                    var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine].join(" ").toLowerCase();
                    return haystack.indexOf(query) !== -1;
                });
                if (first) {
                    window.location.href = first.url;
                }
            });
        });
        document.addEventListener("click", function (event) {
            if (!event.target.closest(".search-box")) {
                closeAllSearchResults();
            }
        });
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-hero-thumb]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === current);
            });
            thumbs.forEach(function (thumb, idx) {
                thumb.classList.toggle("is-active", idx === current);
            });
        }
        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }
        thumbs.forEach(function (thumb, idx) {
            thumb.addEventListener("click", function (event) {
                event.preventDefault();
                show(idx);
                schedule();
            });
        });
        show(0);
        schedule();
    }

    function setupLocalFilters() {
        var panels = document.querySelectorAll("[data-catalog]");
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-local-search]");
            var selects = panel.querySelectorAll("[data-filter-field]");
            var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));
            var empty = panel.querySelector(".empty-state");
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var matchesQuery = true;
                    if (query) {
                        var searchText = [card.getAttribute("data-title"), card.getAttribute("data-region"), card.getAttribute("data-year"), card.getAttribute("data-genre"), card.getAttribute("data-type")].join(" ").toLowerCase();
                        matchesQuery = searchText.indexOf(query) !== -1;
                    }
                    var matchesSelects = true;
                    selects.forEach(function (select) {
                        var field = select.getAttribute("data-filter-field");
                        var value = select.value;
                        if (value && card.getAttribute("data-" + field) !== value) {
                            matchesSelects = false;
                        }
                    });
                    var shouldShow = matchesQuery && matchesSelects;
                    card.hidden = !shouldShow;
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
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

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
    }

    ready(function () {
        setupGlobalSearch();
        setupMobileMenu();
        setupHero();
        setupLocalFilters();
    });

    window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !sourceUrl) {
            return;
        }
        var hlsInstance = null;
        function attachStream() {
            if (video.getAttribute("data-ready") === "true") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            video.setAttribute("data-ready", "true");
        }
        function play() {
            attachStream();
            button.classList.add("is-hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
