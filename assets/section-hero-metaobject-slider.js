/**
 * Hero Metaobject Slider Web Component
 */
if (!customElements.get('hero-metaobject-slider')) {
  class HeroMetaobjectSlider extends HTMLElement {
    constructor() {
      super();
      this.track = this.querySelector('.hero-slider__track');
      this.slides = Array.from(this.querySelectorAll('.hero-slider__slide'));
      this.prevBtn = this.querySelector('.hero-slider__arrow--prev');
      this.nextBtn = this.querySelector('.hero-slider__arrow--next');
      this.dots = Array.from(this.querySelectorAll('.hero-slider__dot'));
      this.autoplay = this.dataset.autoplay === 'true';
      this.speed = parseInt(this.dataset.speed, 10) * 1000 || 5000;
      this.currentIndex = 0;
      this.timer = null;
      this.isInteracting = false;
    }

    connectedCallback() {
      if (this.slides.length <= 1) return;

      this.setupEventListeners();
      this.setupObserver();

      if (this.autoplay) {
        this.startAutoplay();
      }
    }

    disconnectedCallback() {
      this.stopAutoplay();
    }

    setupEventListeners() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.prev();
          this.restartAutoplay();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.next();
          this.restartAutoplay();
        });
      }

      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.goTo(index);
          this.restartAutoplay();
        });
      });

      // Pause autoplay on mouse enter / focus
      this.addEventListener('mouseenter', () => this.stopAutoplay());
      this.addEventListener('mouseleave', () => {
        if (this.autoplay) this.startAutoplay();
      });
      this.addEventListener('focusin', () => this.stopAutoplay());
      this.addEventListener('focusout', () => {
        if (this.autoplay) this.startAutoplay();
      });

      // Touch / swipe handling
      let touchStartX = 0;
      let touchEndX = 0;

      this.track.addEventListener(
        'touchstart',
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
          this.stopAutoplay();
        },
        { passive: true }
      );

      this.track.addEventListener(
        'touchend',
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) {
              this.next();
            } else {
              this.prev();
            }
          }
          if (this.autoplay) this.startAutoplay();
        },
        { passive: true }
      );
    }

    setupObserver() {
      // IntersectionObserver to sync active dots during smooth scrolling / swiping
      const options = {
        root: this.track,
        threshold: 0.6,
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = this.slides.indexOf(entry.target);
            if (index !== -1) {
              this.currentIndex = index;
              this.updateDots(index);
            }
          }
        });
      }, options);

      this.slides.forEach((slide) => this.observer.observe(slide));
    }

    goTo(index) {
      if (index < 0) {
        index = this.slides.length - 1;
      } else if (index >= this.slides.length) {
        index = 0;
      }

      const targetSlide = this.slides[index];
      if (targetSlide) {
        this.track.scrollTo({
          left: targetSlide.offsetLeft,
          behavior: 'smooth',
        });
        this.currentIndex = index;
        this.updateDots(index);
      }
    }

    next() {
      this.goTo(this.currentIndex + 1);
    }

    prev() {
      this.goTo(this.currentIndex - 1);
    }

    updateDots(index) {
      this.dots.forEach((dot, idx) => {
        const isActive = idx === index;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    startAutoplay() {
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

    restartAutoplay() {
      if (this.autoplay) {
        this.stopAutoplay();
        this.startAutoplay();
      }
    }
  }

  customElements.define('hero-metaobject-slider', HeroMetaobjectSlider);
}

