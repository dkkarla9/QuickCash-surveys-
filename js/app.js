
    // Slider functionality
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(n) {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      slides[n].classList.add('active');
      dots[n].classList.add('active');
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    function startSlideShow() {
      slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlideShow() {
      clearInterval(slideInterval);
    }

    // Initialize slider
    startSlideShow();

    // Add click functionality to dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stopSlideShow();
        currentSlide = index;
        showSlide(currentSlide);
        startSlideShow();
      });
    });

    // Mobile menu functionality
    const menuBtn = document.querySelector('.menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    menuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-nav a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mobile-nav') && !e.target.closest('.menu-btn')) {
        mobileNav.classList.remove('active');
      }
    });

    // Handle slider touch events
    let touchStartX = 0;
    let touchEndX = 0;

    document.querySelector('.slider').addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });

    document.querySelector('.slider').addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    });

    function handleSwipe() {
      const swipeThreshold = 50;
      const difference = touchEndX - touchStartX;

      if (Math.abs(difference) > swipeThreshold) {
        stopSlideShow();
        if (difference > 0) {
          // Swipe right
          currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        } else {
          // Swipe left
          currentSlide = (currentSlide + 1) % slides.length;
        }
        showSlide(currentSlide);
        startSlideShow();
      }
    }
  