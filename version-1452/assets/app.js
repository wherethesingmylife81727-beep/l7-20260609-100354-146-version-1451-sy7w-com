(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5600);
    }

    function cardTemplate(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"poster-link\" href=\"" + item.url + "\">" +
            "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"card-play\">▶</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<div class=\"movie-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span></div>" +
            "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>" +
            "<p>" + escapeHtml(item.oneLine) + "</p>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function initGlobalSearch() {
        var form = document.querySelector("[data-global-search]");
        var input = document.querySelector("[data-global-search-input]");
        var result = document.querySelector("[data-global-search-results]");
        if (!form || !input || !result || !window.SEARCH_MOVIES) {
            return;
        }
        function runSearch() {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                result.classList.remove("is-visible");
                result.innerHTML = "";
                return;
            }
            var rows = window.SEARCH_MOVIES.filter(function (item) {
                return item.search.indexOf(query) !== -1;
            }).slice(0, 20);
            result.classList.add("is-visible");
            if (!rows.length) {
                result.innerHTML = "<div class=\"empty-search\">没有找到相关影片，换个片名、年份、地区或类型试试。</div>";
                return;
            }
            result.innerHTML = rows.map(cardTemplate).join("");
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            runSearch();
        });
        input.addEventListener("input", runSearch);
    }

    function initLocalFilter() {
        var input = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!input || !cards.length) {
            return;
        }
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        });
    }

    window.setupPlayer = function (options) {
        ready(function () {
            var video = document.getElementById(options.videoId);
            var trigger = document.getElementById(options.triggerId);
            if (!video || !trigger) {
                return;
            }
            var hlsInstance = null;
            var started = false;
            function start() {
                if (!started) {
                    started = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = options.streamUrl;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls();
                        hlsInstance.loadSource(options.streamUrl);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = options.streamUrl;
                    }
                }
                trigger.classList.add("is-hidden");
                var playResult = video.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {});
                }
            }
            trigger.addEventListener("click", start);
            video.addEventListener("click", function () {
                if (!started || video.paused) {
                    start();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initGlobalSearch();
        initLocalFilter();
    });
})();
