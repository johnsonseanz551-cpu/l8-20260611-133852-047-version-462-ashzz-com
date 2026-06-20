(function () {
    var ready = function (callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    };

    ready(function () {
        initImages();
        initMenu();
        initHero();
        initFilters();
        initPlayers();
        applySearchQuery();
    });

    function initImages() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-hidden");
            });
        });
    }

    function initMenu() {
        var button = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dotsWrap = slider.querySelector("[data-hero-dots]");
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            if (dotsWrap) {
                dotsWrap.querySelectorAll(".hero-dot").forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (dotsWrap) {
            slides.forEach(function (_, dotIndex) {
                var dot = document.createElement("button");
                dot.className = "hero-dot";
                dot.type = "button";
                dot.setAttribute("aria-label", "切换推荐影片");
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
                dotsWrap.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (panel) {
            var section = panel.parentElement;
            var input = panel.querySelector(".movie-search");
            var sort = panel.querySelector(".movie-sort");
            var list = section ? section.querySelector("[data-movie-list]") : null;
            var empty = section ? section.querySelector("[data-empty-state]") : null;
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

            function run() {
                var term = normalize(input ? input.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var matched = !term || haystack.indexOf(term) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                var mode = sort ? sort.value : "latest";
                var sorted = cards.slice().sort(function (a, b) {
                    if (mode === "hot") {
                        return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
                    }
                    if (mode === "title") {
                        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                    }
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", run);
            }
            if (sort) {
                sort.addEventListener("change", run);
            }
            run();
        });
    }

    function applySearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var term = params.get("q");
        if (!term) {
            return;
        }
        var input = document.querySelector(".movie-search");
        if (input) {
            input.value = term;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            if (!video || !overlay) {
                return;
            }
            var src = video.dataset.video;
            var loaded = false;
            var hls = null;

            function fail() {
                player.classList.add("has-error");
                overlay.classList.remove("is-hidden");
            }

            function playVideo() {
                overlay.classList.add("is-hidden");
                video.controls = true;
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {
                        overlay.classList.remove("is-hidden");
                    });
                }
            }

            function load() {
                if (!src) {
                    fail();
                    return;
                }
                if (loaded) {
                    playVideo();
                    return;
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            fail();
                        }
                    });
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    video.load();
                    return;
                }
                fail();
            }

            overlay.addEventListener("click", load);
            video.addEventListener("click", function () {
                if (video.paused) {
                    load();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }
}());
