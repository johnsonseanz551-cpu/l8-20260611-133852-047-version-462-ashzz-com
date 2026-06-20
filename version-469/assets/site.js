(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    var nav = qs('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('.hero-prev', hero);
    var next = qs('.hero-next', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = qs('#pageSearch');
    if (!input) {
      return;
    }
    var items = qsa('.filter-item');
    var holder = null;

    function ensureHolder() {
      if (holder) {
        return holder;
      }
      holder = document.createElement('div');
      holder.className = 'empty-state';
      holder.textContent = '没有匹配的影片内容';
      var parent = items.length ? items[0].parentNode : null;
      if (parent) {
        parent.appendChild(holder);
      }
      return holder;
    }

    function filter() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var text = (item.getAttribute('data-title') || item.textContent || '').toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        item.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });
      var empty = ensureHolder();
      empty.classList.toggle('hidden-by-filter', visible !== 0);
    }

    input.addEventListener('input', filter);
    filter();
  }

  window.initMoviePlayer = function (source) {
    var video = qs('#movieVideo');
    var overlay = qs('#playOverlay');
    if (!video || !source) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
