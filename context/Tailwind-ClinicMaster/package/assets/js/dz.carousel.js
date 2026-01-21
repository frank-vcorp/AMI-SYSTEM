const ClinicMasterCarousel = function () {
  const handleTestimonialSwiper1 = () => {
    const swiperEl = document.querySelector(".testimonial-swiper1");
    if (!swiperEl) return;

    new Swiper(".testimonial-swiper1", {
      loop: true,
      spaceBetween: 20,
      slidesPerView: 1,
      navigation: {
        nextEl: ".swiper1-button-next",
        prevEl: ".swiper1-button-prev",
      },
    });
  };

  const handleTestimonialSwiper4 = () => {
    const swiperEl = document.querySelector(".testimonial-swiper4");
    if (!swiperEl) return;

    const testimonialThumbSwiper4 = new Swiper(".testimonial-thumb-swiper4", {
      slidesPerView: 1,
      effect: "fade",
      centeredSlides: true,
    });

    new Swiper(".testimonial-swiper4", {
      loop: true,
      spaceBetween: 20,
      slidesPerView: 1,
      centeredSlides: true,
      autoplay: {
        delay: 3000,
      },
      thumbs: {
        swiper: testimonialThumbSwiper4,
      },
      navigation: {
        nextEl: ".swiper4-button-next",
        prevEl: ".swiper4-button-prev",
      },
    });
  };

  const handleTestimonialSwiper8 = () => {
    const sliderEl = document.querySelector(".testimonial-swiper8");

    if (sliderEl) {
      const testimonialSwiper8 = new Swiper(".testimonial-swiper8", {
        loop: true,
        spaceBetween: 25,
        slidesPerView: 1.3,
        pagination: {
          el: ".testimonial-pagination-swiper2",
          type: "progressbar",
        },
        breakpoints: {
          1481: {
            slidesPerView: 1.3,
          },
          1280: {
            slidesPerView: 1.6,
          },
          991: {
            slidesPerView: 1.2,
          },
          320: {
            slidesPerView: 1,
          },
        },
      });
    }
  };

  const handleTestimonialSwiper9 = () => {
    const sliderEl = document.querySelector(".testimonial-swiper9");

    if (sliderEl) {
      const testimonialSwiper9 = new Swiper(".testimonial-swiper9", {
        loop: true,
        spaceBetween: 25,
        slidesPerView: 1,
        autoplay: {
          delay: 3000,
        },
        centeredSlides: true,
        breakpoints: {
          1481: {
            slidesPerView: 4,
          },
          1200: {
            slidesPerView: 3,
          },
          991: {
            slidesPerView: 2.5,
          },
          767: {
            slidesPerView: 2,
          },
        },
      });
    }
  };

  const handleAwardSlider = () => {
    const swiperEl = document.querySelector(".awards-swiper");
    if (!swiperEl) return;

    new Swiper(".awards-swiper", {
      loop: true,
      slidesPerView: 5,
      autoplay: {
        delay: 3000,
      },
      breakpoints: {
        1200: {
          slidesPerView: 5,
        },
        991: {
          slidesPerView: 4,
        },
        767: {
          slidesPerView: 3,
        },
        575: {
          slidesPerView: 2.5,
        },
        320: {
          slidesPerView: 1.5,
        },
      },
    });
  };

  const handleClientSwiper = () => {
    const swiperEl = document.querySelector(".client-swiper");
    if (!swiperEl) return;

    new Swiper(".client-swiper", {
      loop: true,
      slidesPerView: 5,
      spaceBetween: 30,
      autoplay: {
        delay: 3000,
      },
      breakpoints: {
        1200: {
          slidesPerView: 6,
        },
        991: {
          slidesPerView: 4,
        },
        575: {
          slidesPerView: 3,
        },
        320: {
          slidesPerView: 2,
        },
      },
    });
  };

  const handleClientSwiper2 = () => {
    const swiperEl = document.querySelector(".client-swiper2");
    if (!swiperEl) return;

    new Swiper(".client-swiper2", {
      loop: true,
      slidesPerView: 4,
      spaceBetween: 30,
      autoplay: {
        delay: 3000,
      },
      breakpoints: {
        767: {
          slidesPerView: 4,
        },
        575: {
          slidesPerView: 3,
        },
        320: {
          slidesPerView: 2,
        },
      },
    });
  };

  const BlogSlideshowSwiper = () => {
    const swiperEl = document.querySelector(".blog-slideshow");
    if (!swiperEl) return;

    new Swiper(".blog-slideshow", {
      loop: true,
      spaceBetween: 0,
      slidesPerView: "auto",
      speed: 1500,
      autoplay: {
        delay: 2000,
      },
      pagination: {
        el: ".swiper-pagination-two",
        clickable: true,
      },
    });
  };

  if (
    document.querySelector(".galley-thumb-swiper") &&
    document.querySelector(".galley-swiper")
  ) {
    const swiperThumbs = new Swiper(".galley-thumb-swiper", {
      loop: false,
      spaceBetween: 10,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
    });

    new Swiper(".galley-swiper", {
      loop: true,
      spaceBetween: 10,
      thumbs: {
        swiper: swiperThumbs,
      },
    });
  }

  const handleTestimonialSwiper = function () {
    const wrapper = document.querySelector(".testimonial-swiper-wrapper");
    if (!wrapper) return;

    const testimonialThumbs = new Swiper(".testimonial-thumbs", {
      speed: 1500,
      parallax: true,
      slidesPerView: 1,
      spaceBetween: 10,
      loop: true,
      autoplay: {
        delay: 3000,
      },
    });

    new Swiper(".testimonial-swiper", {
      speed: 1500,
      parallax: true,
      slidesPerView: 1,
      spaceBetween: 10,
      loop: true,
      autoplay: {
        delay: 3000,
      },
      navigation: {
        nextEl: ".testimonial-button-next",
        prevEl: ".testimonial-button-prev",
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      thumbs: {
        swiper: testimonialThumbs,
      },
    });
  };

  const handleServiceSwiper = () => {
    const swiperEl = document.querySelector(".service-swiper");
    if (!swiperEl) return;

    new Swiper(".service-swiper", {
      speed: 1500,
      parallax: true,
      slidesPerView: 1,
      spaceBetween: 35,
      loop: true,
      autoplay: {
        delay: 3000,
      },
      breakpoints: {
        567: {
          slidesPerView: 1,
          spaceBetween: 15,
        },
        767: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1025: {
          slidesPerView: 4,
          spaceBetween: 35,
        },
      },
    });
  };

  const handleServiceSwiper2 = function () {
    const swiperContainer = document.querySelector(".service-swiper-2");

    if (swiperContainer) {
      const ServiceSwiper = new Swiper(".service-swiper-2", {
        loop: true,
        spaceBetween: 20,
        slidesPerView: 3,
        autoplay: {
          delay: 3000,
        },
        breakpoints: {
          1481: {
            slidesPerView: 3,
          },
          1200: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 2,
          },
          991: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 2,
          },
          576: {
            slidesPerView: 2,
          },
          320: {
            slidesPerView: 1,
          },
        },
        navigation: {
          nextEl: ".service-button-next",
          prevEl: ".service-button-prev",
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="${className}">0${index + 1}</span>`;
          },
        },
      });
    }
  };

  const handleServiceSwiper3 = () => {
    const sliderEl = document.querySelector(".service-swiper3");

    if (sliderEl) {
      const ServiceSwiper2 = new Swiper(".service-swiper3", {
        loop: true,
        spaceBetween: 0,
        slidesPerView: 1,
        autoplay: {
          delay: 3000,
        },
        navigation: {
          nextEl: ".service-button-next",
          prevEl: ".service-button-prev",
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          renderBullet: (index, className) =>
            `<span class="${className}">0${index + 1}</span>`,
        },
      });
    }
  };

  const handleVerticalSwiper = () => {
    const blogVerticalSwiper = document.querySelector(".blog-vertical-swiper");

    if (blogVerticalSwiper) {
      const teamSwiperThumb = new Swiper(".blog-vertical-swiper-thumb", {
        direction: "vertical",
        slidesPerView: 3,
        mousewheel: false,
        spaceBetween: 10,
        autoplay: {
          delay: 3000,
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
            direction: "horizontal",
          },
          767: {
            slidesPerView: 2,
            direction: "vertical",
          },
          1191: {
            slidesPerView: 3,
          },
        },
      });

      new Swiper(".blog-vertical-swiper", {
        slidesPerView: 1,
        effect: "fade",
        grabCursor: true,
        thumbs: {
          swiper: teamSwiperThumb,
        },
        navigation: {
          nextEl: ".blog-swiper-next",
          prevEl: ".blog-swiper-prev",
        },
      });
    }
  };

  const handleTestimonialSwiper3 = () => {
    const swiperEl = document.querySelector(".testimonial-swiper3");
    if (!swiperEl) return;

    new Swiper(".testimonial-swiper3", {
      loop: true,
      spaceBetween: 0,
      slidesPerView: 1,
      autoplay: {
        delay: 3000,
      },
      pagination: {
        el: ".testimonial-pagination-swiper3",
        clickable: true,
      },
    });
  };

  const handleCompareSwiper = () => {
    const compareSwiperEl = document.querySelector(".compare-swiper");

    if (!compareSwiperEl) return;

    const compareSwiper = new Swiper(".compare-swiper", {
      loop: true,
      slidesPerView: 4,
      spaceBetween: 20,
      centeredSlides: true,
      autoplay: {
        delay: 3000,
      },
      navigation: {
        nextEl: ".compare-swiper-next",
        prevEl: ".compare-swiper-prev",
      },
      pagination: {
        el: ".compare-pagination-swiper",
        type: "progressbar",
      },
      breakpoints: {
        1481: {
          slidesPerView: 4.4,
        },
        1280: {
          slidesPerView: 4,
        },
        991: {
          slidesPerView: 3.5,
        },
        320: {
          slidesPerView: 2,
        },
      },
    });

    const paginationContainer = document.querySelector(
      ".compare-slider__pagination"
    );
    if (paginationContainer) {
      const currentEl = document.querySelector(".compare-slider__current");
      const totalEl = document.querySelector(".compare-slider__total");

      const updatePagination = () => {
        const totalSlides =
          compareSwiperEl.querySelectorAll(".swiper-slide").length;
        let current = compareSwiper.realIndex + 1;

        if (current > totalSlides) current = 1;

        const idx = current < 10 ? "0" + current : current;
        const tdx = totalSlides < 10 ? "0" + totalSlides : totalSlides;

        if (currentEl) currentEl.textContent = idx;
        if (totalEl) totalEl.textContent = tdx;
      };

      updatePagination();
      compareSwiper.on("slideChange", updatePagination);
    }
  };

  const handleCompareSwiper2 = function () {
    const swiperContainer = document.querySelector(".compare-swiper-2");

    if (swiperContainer) {
      const compareSwiper = new Swiper(".compare-swiper-2", {
        loop: true,
        slidesPerView: 3,
        spaceBetween: 20,
        centeredSlides: true,
        autoplay: {
          delay: 3000,
        },
        navigation: {
          nextEl: ".compare-swiper-2-next",
          prevEl: ".compare-swiper-2-prev",
        },
        pagination: {
          el: ".compare-pagination-swiper",
          type: "progressbar",
        },
        breakpoints: {
          1481: {
            slidesPerView: 2.6,
          },
          1280: {
            slidesPerView: 3,
          },
          991: {
            slidesPerView: 3,
          },
          320: {
            slidesPerView: 2,
          },
        },
      });

      const paginationCurrent = document.querySelector(
        ".compare-slider__current"
      );
      const paginationTotal = document.querySelector(".compare-slider__total");

      if (paginationCurrent && paginationTotal) {
        const mainSliderPagination = () => {
          const totalSlides =
            compareSwiper.slides.length - compareSwiper.loopedSlides * 2;
          let current = compareSwiper.realIndex + 1;
          if (current > totalSlides) current = 1;
          const currentFormatted = current < 10 ? `0${current}` : current;
          const totalFormatted =
            totalSlides < 10 ? `0${totalSlides}` : totalSlides;

          paginationCurrent.innerHTML = currentFormatted;
          paginationTotal.innerHTML = totalFormatted;
        };

        mainSliderPagination();
        compareSwiper.on("slideChange", mainSliderPagination);
      }
    }
  };

  const handleTeamSwiper1 = () => {
    const swiperEl = document.querySelector(".dz-team-swiper1");
    if (!swiperEl) return;

    const teamSwiperThumb = new Swiper(".dz-team-swiper1-thumb", {
      slidesPerView: 2,
      grid: {
        rows: 2,
      },
      autoplay: {
        delay: 3000,
      },
      breakpoints: {
        320: {
          slidesPerView: 1.2,
          grid: {
            rows: 1,
          },
        },
        591: {
          slidesPerView: 2,
        },
        991: {
          slidesPerView: 3,
        },
        1200: {
          slidesPerView: 2,
        },
      },
    });

    const teamSwiper = new Swiper(".dz-team-swiper1", {
      slidesPerView: 1,
      effect: "fade",
      thumbs: {
        swiper: teamSwiperThumb,
      },
      pagination: {
        el: ".team-progressbar-swiper",
        type: "progressbar",
      },
      navigation: {
        nextEl: ".team-swiper-next",
        prevEl: ".team-swiper-prev",
      },
    });

    if (document.querySelector(".team-pagination-swiper")) {
      const currentEl = document.querySelector(".team-slider__current");
      const totalEl = document.querySelector(".team-slider__total");

      const mainSliderPagination = () => {
        const totalSlides = document.querySelectorAll(
          ".dz-team-swiper1 .swiper-slide"
        ).length;
        let current = teamSwiper.realIndex + 1;
        if (current > totalSlides) current = 1;

        const idx = current < 10 ? "0" + current : current;
        const tdx = totalSlides < 10 ? "0" + totalSlides : totalSlides;

        if (totalEl) totalEl.textContent = tdx;
        if (currentEl) currentEl.textContent = idx;
      };

      mainSliderPagination();
      teamSwiper.on("slideChange", mainSliderPagination);
    }
  };

  const handleTeamSwiper2 = () => {
    const imageEl = document.querySelector(".team-image-swiper");
    const contentEl = document.querySelector(".team-content-swiper");

    if (!imageEl || !contentEl) return;

    const imageSwiper = new Swiper(imageEl, {
      slidesPerView: 1.4,
      spaceBetween: 15,
      speed: 800,
      allowTouchMove: true,
      watchSlidesProgress: true,
      slideToClickedSlide: true,
      loopAdditionalSlides: 2,
      loopPreventsSliding: true,
      loop: true,
      breakpoints: {
        591: {
          slidesPerView: 1.9,
        },
        992: {
          slidesPerView: 2.05,
        },
      },
    });

    const contentSwiper = new Swiper(contentEl, {
      slidesPerView: 1,
      speed: 800,
      allowTouchMove: true,
      watchSlidesProgress: true,
      loop: true,
    });

    imageSwiper.controller.control = contentSwiper;
    contentSwiper.controller.control = imageSwiper;
  };

  const handleTeamSwiper3 = () => {
    const imageEl = document.querySelector(".team-image-swiper-2");
    const contentEl = document.querySelector(".team-content-swiper-2");

    if (!imageEl || !contentEl) return;

    const imageSwiper2 = new Swiper(imageEl, {
      slidesPerView: 1.4,
      spaceBetween: 15,
      speed: 800,
      allowTouchMove: true,
      watchSlidesProgress: true,
      loop: true,
      breakpoints: {
        591: {
          slidesPerView: 1.9,
        },
        992: {
          slidesPerView: 1.68,
        },
      },
    });

    const contentSwiper2 = new Swiper(contentEl, {
      slidesPerView: 1,
      speed: 800,
      allowTouchMove: true,
      watchSlidesProgress: true,
      loop: true,
    });

    imageSwiper2.controller.control = contentSwiper2;
    contentSwiper2.controller.control = imageSwiper2;
  };

  const handleTestimonialSwiper2 = () => {
    const swiperEl = document.querySelector(".testimonial-swiper2");
    if (!swiperEl) return;

    const testimonialSwiper2 = new Swiper(".testimonial-swiper2", {
      loop: true,
      spaceBetween: 0,
      slidesPerView: 2,
      autoplay: {
        delay: 3000,
      },
      pagination: {
        el: ".testimonial-pagination-swiper2",
        type: "progressbar",
      },
      breakpoints: {
        1481: {
          slidesPerView: 2,
        },
        1280: {
          slidesPerView: 1.6,
        },
        991: {
          slidesPerView: 1.2,
        },
        320: {
          slidesPerView: 1,
        },
      },
    });

    if (document.querySelector(".testimonial-slider__pagination2")) {
      const currentEl = document.querySelector(".testimonial-slider__current");
      const totalEl = document.querySelector(".testimonial-slider__total");

      const mainSliderPagination = () => {
        const totalSlides = document.querySelectorAll(
          ".testimonial-swiper2 .swiper-slide"
        ).length;
        let current = testimonialSwiper2.realIndex + 1;
        if (current > totalSlides) current = 1;

        const idx = current < 10 ? "0" + current : current;
        const tdx = totalSlides < 10 ? "0" + totalSlides : totalSlides;

        if (totalEl) totalEl.textContent = tdx;
        if (currentEl) currentEl.textContent = idx;
      };

      mainSliderPagination();
      testimonialSwiper2.on("slideChange", mainSliderPagination);
    }
  };

  const handleVerticalSwiper2 = function () {
    const swiperContainer = document.querySelector(".blog-vertical-swiper2");

    if (swiperContainer) {
      const teamSwiperThumb = new Swiper(".blog-vertical-swiper-thumb2", {
        direction: "vertical",
        slidesPerView: 3,
        mousewheel: false,
        spaceBetween: 10,
        autoplay: {
          delay: 3000,
        },
        breakpoints: {
          320: {
            slidesPerView: 1,
            direction: "horizontal",
          },
          767: {
            slidesPerView: 2,
            direction: "vertical",
          },
          1191: {
            slidesPerView: 3,
          },
        },
      });

      const teamSwiper = new Swiper(".blog-vertical-swiper2", {
        slidesPerView: 1,
        effect: "fade",
        grabCursor: true,
        thumbs: {
          swiper: teamSwiperThumb,
        },
        navigation: {
          nextEl: ".blog-swiper-next",
          prevEl: ".blog-swiper-prev",
        },
      });
    }
  };

  const handleTestimonialSwiper6 = () => {
    const swiperEl = document.querySelector(".testimonial-swiper6");

    if (swiperEl) {
      const testimonialSwiper6 = new Swiper(".testimonial-swiper6", {
        loop: true,
        spaceBetween: 20,
        speed: 1500,
        slidesPerView: 1,
        simulateTouch: false,
        allowTouchMove: false,
        autoplay: {
          delay: 2000,
        },
      });
    }
  };

  const handleTestimonialSwiper7 = function () {
    const swiperContainer = document.querySelector(".testimonial-swiper7");

    if (swiperContainer) {
      const testimonialSwiper7 = new Swiper(".testimonial-swiper7", {
        loop: true,
        spaceBetween: 0,
        slidesPerView: 1,
        autoplay: {
          delay: 3000,
        },
        pagination: {
          el: ".testimonial-pagination-swiper7",
          clickable: true,
        },
      });
    }
  };

  const handleDummySwiper = function () {
    const swiperContainer = document.querySelector(".dummy-swiper");

    if (swiperContainer) {
      const DummySwiper = new Swiper(".dummy-swiper", {
        loop: false,
        spaceBetween: 0,
        slidesPerView: 9,
        autoplay: {
          delay: 3000,
        },
        breakpoints: {
          1481: {
            slidesPerView: 9,
          },
          1400: {
            slidesPerView: 8,
          },
          1280: {
            slidesPerView: 7,
          },
          1199: {
            slidesPerView: 7,
          },
          991: {
            slidesPerView: 6,
          },
          768: {
            slidesPerView: 5,
          },
          320: {
            slidesPerView: 3,
          },
        },
      });
    }
  };

  const handlePortfolioSlider = () => {
    const sliderEl = document.querySelector(".portfolio-slider");

    if (sliderEl) {
      const swiper = new Swiper(".portfolio-slider", {
        speed: 1500,
        slidesPerView: 6.5,
        spaceBetween: 0,
        loop: true,
        autoplay: {
          delay: 2000,
        },
        breakpoints: {
          1600: {
            slidesPerView: 6.5,
          },
          1480: {
            slidesPerView: 7,
          },
          768: {
            slidesPerView: 4,
          },
          320: {
            slidesPerView: 2,
          },
        },
      });
    }
  };

  const handleHeroBannerSwiper = () => {
    const sliderEl = document.querySelector(".hero-banner-swiper");

    if (sliderEl) {
      const slides = document.querySelectorAll(
        ".hero-banner-swiper .swiper-slide"
      );

      const effect = new hoverEffect({
        parent: document.querySelector(".hero-effect-container"),
        intensity: 0.6,
        image1: slides[0].dataset.img1,
        image2: slides[0].dataset.img2,
        displacementImage: "../assets/images/1.jpg",
        speedIn: 0.7,
        speedOut: 0.7,
        hover: false,
      });

      const thumbsSwiper = new Swiper(".hero-banner-swiper-thumbs", {
        slidesPerView: 4,
        spaceBetween: 30,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
          1481: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          1200: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 15,
          },
          576: {
            slidesPerView: 2,
            spaceBetween: 15,
          },
          320: {
            slidesPerView: 1,
            spaceBetween: 15,
          },
        },
      });

      const mainSwiper = new Swiper(".hero-banner-swiper", {
        effect: "fade",
        fadeEffect: { crossFade: false },
        navigation: {
          nextEl: ".hero-banner-button-next",
          prevEl: ".hero-banner-button-prev",
        },
        thumbs: { swiper: thumbsSwiper },
      });

      mainSwiper.on("slideChangeTransitionStart", () => {
        const i = mainSwiper.activeIndex;
        effect.forceTransition(slides[i].dataset.img1, slides[i].dataset.img2);
      });

      const currentEl = document.querySelector(".hero-banner-slider__current");
      const totalEl = document.querySelector(".hero-banner-slider__total");

      const updatePagination = () => {
        const total = slides.length;
        const current = mainSwiper.realIndex + 1;

        currentEl.textContent = current < 10 ? `0${current}` : current;
        totalEl.textContent = total < 10 ? `0${total}` : total;
      };

      updatePagination();
      mainSwiper.on("slideChange", updatePagination);
    }
  };

  const handleServiceSwiper4 = function () {
    const swiperContainer = document.querySelector(".service-swiper-4");

    if (swiperContainer) {
      const ServiceSwiper = new Swiper(".service-swiper-4", {
        loop: true,
        spaceBetween: 20,
        slidesPerView: 4,
        autoplay: {
          delay: 3000,
        },
        breakpoints: {
          1481: {
            slidesPerView: 3.7,
          },
          1200: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 2,
          },
          991: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 2,
          },
          576: {
            slidesPerView: 2,
          },
          320: {
            slidesPerView: 1,
          },
        },
      });
    }
  };

  return {
    load() {
      handleTestimonialSwiper();
      handleTestimonialSwiper1();
      handleTestimonialSwiper2();
      handleTestimonialSwiper3();
      handleTestimonialSwiper4();
      handleTestimonialSwiper6();
      handleTestimonialSwiper7();
      handleTestimonialSwiper8();
      handleTestimonialSwiper9();
      handleAwardSlider();
      handleClientSwiper();
      handleClientSwiper2();
      BlogSlideshowSwiper();
      handleServiceSwiper();
      handleServiceSwiper2();
      handleServiceSwiper3();
      handleServiceSwiper4();
      handleVerticalSwiper();
      handleCompareSwiper();
      handleCompareSwiper2();
      handleTeamSwiper1();
      handleTeamSwiper2();
      handleTeamSwiper3();
      handleVerticalSwiper2();
      handleDummySwiper();
      handlePortfolioSlider();
      handleHeroBannerSwiper();
    },
  };
};

window.addEventListener("load", function () {
  ClinicMasterCarousel().load();
});
