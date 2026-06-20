(function () {
  var header = document.querySelector('[data-header]');
  var nav = document.querySelector('[data-site-nav]');
  var toggle = document.querySelector('[data-nav-toggle]');

  function setHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var searchInput = filterPanel.querySelector('[data-filter-search]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var regionInput = filterPanel.querySelector('[data-filter-region]');
    var countNode = filterPanel.querySelector('[data-filter-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionInput && regionInput.value);
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (year && cardYear !== year) {
          ok = false;
        }
        if (type && cardType !== type) {
          ok = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          ok = false;
        }

        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          shown += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(shown);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      [searchInput, yearSelect, typeSelect, regionInput].forEach(function (node) {
        if (node) {
          node.addEventListener(eventName, applyFilters);
        }
      });
    });

    applyFilters();
  }

  function initPlayer(player) {
    var video = player.querySelector('video');
    var startButton = player.querySelector('[data-player-start]');
    var src = player.getAttribute('data-src');
    var attached = false;
    var hls = null;

    if (!video || !src || !startButton) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
      } else {
        video.src = src;
      }
    }

    function startPlayback() {
      attachSource();
      video.controls = true;
      startButton.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          startButton.classList.remove('is-hidden');
        });
      }
    }

    startButton.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!attached) {
        startPlayback();
        return;
      }
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
