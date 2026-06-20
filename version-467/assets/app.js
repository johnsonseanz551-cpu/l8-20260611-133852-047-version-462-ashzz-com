(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('.mobile-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot') || '0');
        show(nextIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupSearchPage() {
    var results = qs('[data-search-results]');
    if (!results) {
      return;
    }

    var input = qs('#searchInput');
    var count = qs('[data-search-count]');
    var cards = qsa('.movie-card', results);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
      input.addEventListener('input', function () {
        filter(input.value);
      });
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filter(value) {
      var keyword = normalize(value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-keywords') || card.textContent);
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      document.body.classList.toggle('search-active', Boolean(keyword));
      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    filter(query);
  }

  function setupHeaderSearchForms() {
    qsa('form[action="./search.html"]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          return;
        }
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupSearchPage();
    setupHeaderSearchForms();
  });
})();
