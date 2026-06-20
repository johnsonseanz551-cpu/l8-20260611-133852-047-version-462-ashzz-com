(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    if (menuButton) {
        menuButton.addEventListener('click', function () {
            document.body.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            var wrapper = image.closest('.poster-wrap');
            if (wrapper) {
                wrapper.classList.add('poster-fallback');
            }
        }, { once: true });
    });

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === activeIndex);
            });
        }

        function startAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startAutoPlay();
            });
        });

        if (slides.length > 1) {
            startAutoPlay();
        }
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    var liveInput = document.querySelector('[data-live-search-input]');
    var liveForm = document.querySelector('[data-live-search-form]');
    var list = document.querySelector('[data-search-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (liveInput && list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search-card]'));

        function applySearch(value) {
            var keyword = (value || '').trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    shown += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('show', shown === 0);
            }
        }

        liveInput.value = getQuery('q');
        applySearch(liveInput.value);
        liveInput.addEventListener('input', function () {
            applySearch(liveInput.value);
        });
        if (liveForm) {
            liveForm.addEventListener('submit', function (event) {
                event.preventDefault();
                applySearch(liveInput.value);
            });
        }
    }

    function setupPlayer(shell) {
        var video = shell.querySelector('video[data-src]');
        var button = shell.querySelector('[data-player-button]');
        if (!video) {
            return;
        }

        var source = video.getAttribute('data-src');
        var initialized = false;
        var hls = null;

        function initializeSource() {
            if (initialized || !source) {
                return;
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            initializeSource();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }
        video.addEventListener('play', function () {
            shell.classList.add('playing');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove('playing');
            }
        });
        video.addEventListener('loadedmetadata', function () {
            shell.classList.add('ready');
        });
        shell.addEventListener('mouseenter', initializeSource, { once: true });
    }

    document.querySelectorAll('[data-player-shell]').forEach(setupPlayer);
})();
