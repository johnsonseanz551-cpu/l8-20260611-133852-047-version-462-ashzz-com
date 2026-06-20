(function () {
  function closestCard(node) {
    return node.closest('.movie-card') || node.closest('.rank-item');
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var search = panel.querySelector('[data-card-search]');
      var year = panel.querySelector('[data-year-filter]');
      var type = panel.querySelector('[data-type-filter]');
      var scopeSelector = panel.getAttribute('data-filter-panel');
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card')) : [];
      function apply() {
        var query = search ? search.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var typeValue = type ? type.value : '';
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-genre')
          ].join(' ').toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !yearValue || card.getAttribute('data-year-group') === yearValue;
          var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
          card.classList.toggle('hidden-card', !(matchQuery && matchYear && matchType));
        });
      }
      [search, year, type].forEach(function (item) {
        if (item) {
          item.addEventListener('input', apply);
          item.addEventListener('change', apply);
        }
      });
    });
  }

  function setupCardClick() {
    document.addEventListener('click', function (event) {
      var card = closestCard(event.target);
      if (!card || event.target.closest('a')) {
        return;
      }
      var link = card.querySelector('a[href]');
      if (link) {
        window.location.href = link.href;
      }
    });
  }

  setupMenu();
  setupHero();
  setupFilters();
  setupCardClick();
})();
