(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyTip = document.querySelector("[data-empty-tip]");
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var activeFilter = "全部";

    inputs.forEach(function (input) {
      input.value = query;
      input.addEventListener("input", function () {
        query = input.value;
        apply();
      });
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter-button") || "全部";
        buttons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    });

    function apply() {
      var keyword = normalize(query);
      var filter = normalize(activeFilter === "全部" ? "" : activeFilter);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-filter-text"));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedFilter = !filter || text.indexOf(filter) !== -1;
        var shown = matchedKeyword && matchedFilter;
        card.classList.toggle("is-hidden", !shown);
        if (shown) {
          visible += 1;
        }
      });

      if (emptyTip) {
        emptyTip.hidden = visible !== 0;
      }
    }

    apply();
  }

  function setupPlayer() {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("play-overlay");
    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var attached = false;
    var hlsInstance = null;

    function attachStream() {
      if (!stream || attached) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = stream;
      }

      attached = true;
    }

    function start() {
      attachStream();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
