(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var select = scope.querySelector('[data-sort-select]');
      var count = scope.querySelector('[data-filter-count]');
      var grid = document.querySelector('[data-card-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
      var url = new URL(window.location.href);
      var query = url.searchParams.get('q');
      if (query && input) {
        input.value = query;
      }

      function sortCards(mode) {
        var sorted = cards.slice();
        if (mode === 'year-desc') {
          sorted.sort(function (a, b) {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          });
        } else if (mode === 'year-asc') {
          sorted.sort(function (a, b) {
            return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
          });
        } else if (mode === 'title-asc') {
          sorted.sort(function (a, b) {
            return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
          });
        } else {
          sorted = cards.slice();
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.textContent
          ].join(' '));
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible + ' 部';
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', function () {
          sortCards(select.value);
          apply();
        });
      }
      sortCards(select ? select.value : 'default');
      apply();
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
