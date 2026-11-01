class ProductHighlightSlider extends HTMLElement {
  constructor() {
    super();
    this.slides = this.querySelectorAll('.product-highlight__slide');
    this.prevBtn = this.querySelector('.product-highlight__nav-btn--prev');
    this.nextBtn = this.querySelector('.product-highlight__nav-btn--next');
    this.dots = this.querySelectorAll('.product-highlight__dot');
    this.counterCurrent = this.querySelector('.product-highlight__counter-current');

    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoplay = this.getAttribute('data-autoplay') === 'true';
    this.speed = parseInt(this.getAttribute('data-speed') || '2', 10) * 1000;
    this.timer = null;

    if (this.totalSlides <= 1) {
      const controls = this.querySelector('.product-highlight__controls');
      if (controls) controls.style.display = 'none';
      return;
    }

    this.init();
  }

  init() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prev();
        this.resetAutoplay();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.next();
        this.resetAutoplay();
      });
    }

    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goTo(index);
        this.resetAutoplay();
      });
    });

    // Touch swipe support
    let startX = 0;
    let endX = 0;
    this.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) this.next();
        else this.prev();
        this.resetAutoplay();
      }
    }, { passive: true });

    // Hover pause
    this.addEventListener('mouseenter', () => this.stopAutoplay());
    this.addEventListener('mouseleave', () => this.startAutoplay());

    this.startAutoplay();
  }

  goTo(index) {
    if (index === this.currentIndex) return;

    this.slides[this.currentIndex].classList.remove('is-active');
    if (this.dots[this.currentIndex]) {
      this.dots[this.currentIndex].classList.remove('is-active');
    }

    this.currentIndex = (index + this.totalSlides) % this.totalSlides;

    this.slides[this.currentIndex].classList.add('is-active');
    if (this.dots[this.currentIndex]) {
      this.dots[this.currentIndex].classList.add('is-active');
    }

    if (this.counterCurrent) {
      const displayIndex = String(this.currentIndex + 1).padStart(2, '0');
      this.counterCurrent.textContent = displayIndex;
    }
  }

  next() {
    this.goTo(this.currentIndex + 1);
  }

  prev() {
    this.goTo(this.currentIndex - 1);
  }

  startAutoplay() {
    if (!this.autoplay || this.totalSlides <= 1) return;
    this.stopAutoplay();
    this.timer = setInterval(() => {
      this.next();
    }, this.speed);
  }

  stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }

  disconnectedCallback() {
    this.stopAutoplay();
  }
}

if (!customElements.get('product-highlight-slider')) {
  customElements.define('product-highlight-slider', ProductHighlightSlider);
}

