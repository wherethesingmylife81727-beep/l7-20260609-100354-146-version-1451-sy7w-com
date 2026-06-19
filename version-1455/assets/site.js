(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var activeIndex = 0;
        var timer = null;

        function setHero(index) {
            activeIndex = index % slides.length;
            if (activeIndex < 0) {
                activeIndex = slides.length - 1;
            }
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === activeIndex);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('active', thumbIndex === activeIndex);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setHero(activeIndex + 1);
            }, 5200);
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
                setHero(index);
                startHero();
            });
        });

        if (slides.length > 1) {
            startHero();
        }
    }

    var list = document.querySelector('[data-movie-list]');
    var searchInput = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var sortFilter = document.querySelector('[data-sort-filter]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (list && (searchInput || yearFilter || typeFilter || sortFilter)) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var queryParams = new URLSearchParams(window.location.search);
        var startQuery = queryParams.get('q');

        if (startQuery && searchInput) {
            searchInput.value = startQuery;
        }

        function matches(card) {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var text = card.getAttribute('data-search') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var cardType = card.getAttribute('data-type') || '';

            if (query && text.indexOf(query) === -1) {
                return false;
            }
            if (year && cardYear !== year) {
                return false;
            }
            if (type && cardType !== type) {
                return false;
            }
            return true;
        }

        function sortCards() {
            var mode = sortFilter ? sortFilter.value : 'year-desc';
            var sorted = cards.slice().sort(function (a, b) {
                if (mode === 'score-desc') {
                    return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
                }
                if (mode === 'title-asc') {
                    var at = (a.querySelector('h3') ? a.querySelector('h3').textContent : '').trim();
                    var bt = (b.querySelector('h3') ? b.querySelector('h3').textContent : '').trim();
                    return at.localeCompare(bt, 'zh-CN');
                }
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            });
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
            cards = sorted;
        }

        function applyFilters() {
            sortCards();
            var shown = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('show', shown === 0);
            }
        }

        [searchInput, yearFilter, typeFilter, sortFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
})();
