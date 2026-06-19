(function () {
    var navToggle = document.querySelector('.nav-toggle');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    function activateHero(index) {
        var slides = document.querySelectorAll('.hero-slide');
        var dots = document.querySelectorAll('.hero-dot');

        if (!slides.length) {
            return;
        }

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var heroIndex = 0;
        var heroDots = document.querySelectorAll('.hero-dot');
        var slideCount = document.querySelectorAll('.hero-slide').length;

        heroDots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                heroIndex = index;
                activateHero(heroIndex);
            });
        });

        if (slideCount > 1) {
            window.setInterval(function () {
                heroIndex = (heroIndex + 1) % slideCount;
                activateHero(heroIndex);
            }, 5600);
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function runFilters(scope) {
        var root = scope || document;
        var input = root.querySelector('.content-filter');
        var yearSelect = root.querySelector('.year-filter');
        var typeSelect = root.querySelector('.type-filter');
        var cards = root.querySelectorAll('.movie-card');
        var empty = root.querySelector('.empty-state');
        var keyword = normalize(input ? input.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardYear = card.getAttribute('data-year') || '';
            var cardType = card.getAttribute('data-type') || '';
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedYear = !year || cardYear === year;
            var matchedType = !type || cardType.indexOf(type) !== -1;
            var matched = matchedKeyword && matchedYear && matchedType;

            card.hidden = !matched;

            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    var filterInputs = document.querySelectorAll('.content-filter, .year-filter, .type-filter');

    filterInputs.forEach(function (control) {
        control.addEventListener('input', function () {
            runFilters(document);
        });

        control.addEventListener('change', function () {
            runFilters(document);
        });
    });

    var searchInput = document.getElementById('search-page-input');

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInput.value = query;
        }

        runFilters(document);
    }
})();

function setupMoviePlayer(sourceUrl) {
    var shell = document.querySelector('.movie-player');

    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
        if (prepared || !video) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function play() {
        prepare();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var action = video.play();

        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
