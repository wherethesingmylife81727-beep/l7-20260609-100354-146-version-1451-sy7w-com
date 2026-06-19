(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let currentIndex = 0;
    let timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      currentIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === currentIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === currentIndex);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(currentIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-hero-dot')) || 0;
        setSlide(index);
        startTimer();
      });
    });

    setSlide(0);
    startTimer();
  }

  const searchInput = document.querySelector('[data-search-input]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const typeFilter = document.querySelector('[data-type-filter]');
  const categoryFilter = document.querySelector('[data-category-filter]');
  const result = document.querySelector('[data-filter-result]');

  function yearMatches(cardYear, selected) {
    if (!selected) {
      return true;
    }

    const year = Number(cardYear || 0);

    if (selected === '2020-2022') {
      return year >= 2020 && year <= 2022;
    }

    if (selected === '2010-2019') {
      return year >= 2010 && year <= 2019;
    }

    if (selected === 'before-2010') {
      return year < 2010;
    }

    return String(year) === selected;
  }

  function applyFilters() {
    const cards = Array.from(document.querySelectorAll('[data-card]'));

    if (!cards.length) {
      return;
    }

    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedYear = yearFilter ? yearFilter.value : '';
    const selectedType = typeFilter ? typeFilter.value : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();

      const type = card.getAttribute('data-type') || '';
      const year = card.getAttribute('data-year') || '';
      const categoryText = card.textContent || '';
      const matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
      const matchesYear = yearMatches(year, selectedYear);
      const matchesType = !selectedType || type.indexOf(selectedType) !== -1 || text.indexOf(selectedType.toLowerCase()) !== -1;
      const matchesCategory = !selectedCategory || categoryText.indexOf(selectedCategory) !== -1 || text.indexOf(selectedCategory.toLowerCase()) !== -1;
      const visible = matchesKeyword && matchesYear && matchesType && matchesCategory;

      card.classList.toggle('is-filter-hidden', !visible);

      if (visible) {
        visibleCount += 1;
      }
    });

    if (result) {
      result.textContent = '当前显示 ' + visibleCount + ' 个条目';
    }
  }

  [searchInput, yearFilter, typeFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
})();
