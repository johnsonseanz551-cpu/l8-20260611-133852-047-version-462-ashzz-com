(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var menuToggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-to]'));
      var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-thumb]'));
      var next = carousel.querySelector('[data-slide-next]');
      var prev = carousel.querySelector('[data-slide-prev]');
      var current = 0;
      var timer = null;

      function setSlide(index) {
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
        thumbs.forEach(function (thumb, thumbIndex) {
          thumb.classList.toggle('is-active', thumbIndex === current);
        });
      }

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
          setSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          setSlide(Number(dot.getAttribute('data-slide-to')) || 0);
          startTimer();
        });
      });

      thumbs.forEach(function (thumb) {
        thumb.addEventListener('mouseenter', function () {
          setSlide(Number(thumb.getAttribute('data-slide-thumb')) || 0);
          startTimer();
        });
      });

      if (next) {
        next.addEventListener('click', function () {
          setSlide(current + 1);
          startTimer();
        });
      }

      if (prev) {
        prev.addEventListener('click', function () {
          setSlide(current - 1);
          startTimer();
        });
      }

      setSlide(0);
      startTimer();
    });

    var filterInput = document.querySelector('.filter-input');
    var filterList = document.querySelector('.filter-list');
    if (filterInput && filterList) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      var panel = filterInput.closest('.filter-panel');
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

      function applyFilter() {
        var query = normalize(filterInput.value);
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var matched = !query || haystack.indexOf(query) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            shown += 1;
          }
        });
        if (panel) {
          panel.classList.toggle('is-empty', shown === 0);
        }
      }

      if (initial) {
        filterInput.value = initial;
      }
      filterInput.addEventListener('input', applyFilter);
      applyFilter();
    }
  });
}());
