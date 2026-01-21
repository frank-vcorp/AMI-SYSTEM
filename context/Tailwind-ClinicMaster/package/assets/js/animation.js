const ClinicMasterGsap = function () {
  gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

  let smoother;

  if (!smoother) {
    smoother = ScrollSmoother.create({
      smooth: 2,
      effects: true,
      normalizeScroll: true,
      smoothTouch: 0.1,
    });
  }

  const headerEl = document.querySelector("#headerWrapper1");
  if (headerEl) {

      let tl = gsap.timeline({ paused: true });

      tl.to(headerEl, {
          top: -98,
          duration: 0.3,
          ease: "power2.out"
      });

      ScrollTrigger.create({
          trigger: headerEl,
          start: "bottom top",
          onEnter: () => tl.play(),
          onLeaveBack: () => tl.reverse()
      });
  }


  const initHeaderSticky = () => {
    const header = document.querySelector(".site-header");
    const sidebarStickyWrap = document.querySelector(".sidebar-sticky");

    if (!header) return;

    let lastScroll = 0;
    let animationFrameId;
    const headerHeight = header.offsetHeight || 80;

    const updateStickyHeader = (scrollY) => {
      const shouldFix = scrollY > 100;
      header.classList.toggle("is-fixed", shouldFix);

      if (sidebarStickyWrap) {
        sidebarStickyWrap.style.top = shouldFix
          ? `${headerHeight + 10}px`
          : "60%";
      }

      lastScroll = scrollY;
    };

    const loop = () => {
      const currentScroll =
        typeof smoother?.scrollTop === "function"
          ? smoother.scrollTop()
          : window.scrollY || document.documentElement.scrollTop;

      updateStickyHeader(currentScroll);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  };

  let cleanupSticky = null;
  const initStickyPosition = (selector = ".my-sticky", offset = 100) => {
    ScrollTrigger.matchMedia({
      "(min-width: 992px)": () => {
        const elements = document.querySelectorAll(selector);
        const triggers = [];
        elements.forEach((el) => {
          const parent = el.parentElement;
          if (!parent) return;

          const spacer = document.createElement("div");
          spacer.style.position = "relative";
          spacer.style.height = el.classList.contains("sidebar-sticky")
            ? 0
            : `${el.offsetHeight + offset}px`;
          parent.insertBefore(spacer, el);
          spacer.appendChild(el);

          Object.assign(el.style, {
            position: "absolute",
            top: el.classList.contains("space-top-0") ? 0 : `${offset}px`,
            left: 0,
            right: 0,
          });

          const trigger = ScrollTrigger.create({
            trigger: spacer,
            start: "top top",
            end: () => `+=${parent.offsetHeight - el.offsetHeight - offset}`,
            pin: el,
            pinSpacing: false,
            scroller: "#smooth-wrapper",
            anticipatePin: 1,
          });

          triggers.push({ trigger, spacer, el });
        });

        return () => {
          triggers.forEach(({ trigger, spacer, el }) => {
            trigger.kill();

            const parent = spacer.parentElement;
            if (parent) {
              parent.insertBefore(el, spacer);
              parent.removeChild(spacer);
            }

            Object.assign(el.style, {
              position: "",
              top: "",
              left: "",
              right: "",
            });
          });
        };
      },
    });
  };

  const initApplySticky = () => {
    if (cleanupSticky) cleanupSticky();
    cleanupSticky = initStickyPosition();
  };

  document.querySelectorAll(".sticky-update-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(() => {
        initApplySticky();
      }, 200);
    });
  });

  const initCustomScroll = () => {
    const content = document.querySelectorAll(".custom-scroll");

    content.forEach((item) => {
      item.addEventListener(
        "wheel",
        function (e) {
          e.stopPropagation();
        },
        { passive: false }
      );

      let startY = 0;
      let startX = 0;

      item.addEventListener(
        "touchstart",
        (e) => {
          const touch = e.touches[0];
          startY = touch.clientY;
          startX = touch.clientX;
        },
        { passive: true }
      );

      item.addEventListener(
        "touchmove",
        (e) => {
          const touch = e.touches[0];
          const deltaY = startY - touch.clientY;
          const deltaX = startX - touch.clientX;

          item.scrollTop += deltaY;
          item.scrollLeft += deltaX;

          startY = touch.clientY;
          startX = touch.clientX;

          e.stopPropagation();
          e.preventDefault();
        },
        { passive: false }
      );
    });
  };
  const initScrollTop = function () {
    const scrollBtn = document.getElementById("scrollProgress");
    if (!scrollBtn) return;

    const circle = scrollBtn.querySelector("circle");
    if (!circle) return;

    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollPercent = scrollTop / docHeight;
      const offset = circumference * (1 - scrollPercent);
      circle.style.strokeDashoffset = offset;

      if (scrollTop > 200) {
        scrollBtn.classList.add("active");
      } else {
        scrollBtn.classList.remove("active");
      }
    }

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  const initAnimateSplitTitle = function () {
    const titles = document.querySelectorAll(".split-title");

    titles.forEach((title) => {
      const words = title.innerText.split(" ");

      title.innerHTML = words
        .map((word) => `<span class="word">${word}</span>`)
        .join(" ");

      gsap.to(title.querySelectorAll(".word"), {
        scrollTrigger: {
          trigger: title,
          start: "top 80%",
          end: "bottom 20%",
          scrub: true,
        },
        opacity: 1,
        duration: 0.8,
        stagger: 0.5,
      });
    });
  };

  const initAnimateSlider = function () {
    const el = document.querySelector(".dz-features");
    if (!el) return;

    el.innerHTML = el.textContent
      .split("")
      .map((char) => {
        return `<span class="letter">${char}</span>`;
      })
      .join("");

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      repeat: -1,
      repeatDelay: 0.1,
    });

    tl.to(".dz-features .letter", {
      color: "#141414",
      duration: 0.3,
      stagger: 0.05,
    });

    tl.to(
      ".dz-features .letter",
      {
        color: "yellow",
        duration: 0.4,
        stagger: 0.05,
      },
      "<2.6"
    );

    tl.to(
      ".dz-features .letter",
      {
        color: "#141414",
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.05,
      },
      "<2.2"
    );
  };

  const initImageHover = () => {
    if (document.querySelectorAll(".dz-hover-item").length) {
      const hoverAnimationDo = (container, images) => {
        const img = images[0];
        const displacement = container.dataset.displacement;
        const intensity = container.dataset.intensity || undefined;
        const speedIn = container.dataset.speedin || undefined;
        const speedOut = container.dataset.speedout || undefined;
        const easing = container.dataset.easing || undefined;

        const hover = new hoverEffect({
          parent: container,
          intensity,
          speedIn,
          speedOut,
          easing,
          hover: false,
          image1: img.getAttribute("src"),
          image2: img.getAttribute("src"),
          displacementImage: displacement,
          imagesRatio: img.naturalHeight / img.naturalWidth,
        });

        const hoverItem = container.closest(".dz-hover-item");
        if (hoverItem) {
          hoverItem.addEventListener("mouseenter", () => hover.next());
          hoverItem.addEventListener("mouseleave", () => hover.previous());
        }
      };

      const hoverAnimation = () => {
        const imageContainers = document.querySelectorAll(".dz-hover-img");

        imageContainers.forEach((container) => {
          const images = container.querySelectorAll("img");
          const firstImg = images[0];

          if (firstImg.complete) {
            hoverAnimationDo(container, images);
          } else {
            firstImg.addEventListener("load", () => {
              hoverAnimationDo(container, images);
            });
          }
        });
      };

      hoverAnimation();
    }
  };

  const initVideoAnimation = () => {
    const imgZoomElements = document.querySelectorAll(".img-zoom");

    imgZoomElements.forEach((imgZoom) => {
      const target = imgZoom.querySelector(".img-box");
      if (!target) return;

      ScrollTrigger.create({
        trigger: imgZoom,
        start: "top+=100 bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const scaleValue = Math.min(1.5, 1 + progress);
          target.style.transform = `scale(${scaleValue.toFixed(3)})`;
        },
      });
    });
  };

  const initTitleAnimations = () => {
    const titles = document.querySelectorAll(".headline");
    if (!titles.length) return;

    titles.forEach((title) => {
      if (title.dataset.split === "true") return;
      title.dataset.split = "true";

      const split = new SplitType(title, {
        types: "lines, chars"
      });

      gsap.from(split.chars, {
        x: 120,
        opacity: 0,
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.04,
        scrollTrigger: {
          trigger: title,
          start: "top 80%",
          once: true,
          ...(window.smoother && {
            scroller: smoother.wrapper()
          })
        }
      });
    });
  };


  const handleVideoZoom = () => {
    const zoomBox = document.querySelectorAll(".video-zoom-bx");
    if (!zoomBox.length) return;
    gsap.to(".video-zoom-bx", {
      scale: 1,
      borderRadius: "0px",
      ease: "none",
      scrollTrigger: {
        trigger: ".video-zoom-bx",
        start: "top 80%",
        end: "top 30%",
        scrub: true
      }
    });
  }


  return {
    init() {
      initHeaderSticky();
      initApplySticky();
      initCustomScroll();
      initScrollTop();
      initAnimateSplitTitle();
      initAnimateSlider();
      initImageHover();
      initVideoAnimation();
      initTitleAnimations();
      handleVideoZoom();
    },
  };
};

window.addEventListener("load", () => {
  ClinicMasterGsap().init();
});

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});
