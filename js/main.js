// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", function () {
  initializeNavigation();
  initializeTableOfContents();
  initializeSmoothScrolling();
  initializeMobileMenu();
  initializeScrollBehavior();
});

// Navigation Dropdown Functionality
function initializeNavigation() {
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  let closeTimeout;

  dropdownToggles.forEach((toggle) => {
    const dropdown = toggle.parentElement;
    const dropdownMenu = toggle.nextElementSibling;

    // Toggle dropdown on click
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Clear any pending close timeout
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }

      // Close other dropdowns
      dropdownToggles.forEach((otherToggle) => {
        if (otherToggle !== toggle) {
          const otherMenu = otherToggle.nextElementSibling;
          otherToggle.setAttribute("aria-expanded", "false");
          if (otherMenu) {
            otherMenu.classList.remove("active");
          }
        }
      });

      // Toggle current dropdown
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !isExpanded);
      if (dropdownMenu) {
        dropdownMenu.classList.toggle("active", !isExpanded);
      }
    });

    // Add hover support for better UX (but keep click as primary interaction)
    dropdown.addEventListener("mouseenter", function () {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }
    });

    dropdown.addEventListener("mouseleave", function () {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        // Add a small delay before closing to prevent accidental closes
        closeTimeout = setTimeout(() => {
          toggle.setAttribute("aria-expanded", "false");
          if (dropdownMenu) {
            dropdownMenu.classList.remove("active");
          }
          closeTimeout = null;
        }, 300); // 300ms delay
      }
    });

    // Cancel close timeout when hovering over menu items
    if (dropdownMenu) {
      dropdownMenu.addEventListener("mouseenter", function () {
        if (closeTimeout) {
          clearTimeout(closeTimeout);
          closeTimeout = null;
        }
      });

      dropdownMenu.addEventListener("mouseleave", function () {
        const isExpanded = toggle.getAttribute("aria-expanded") === "true";
        if (isExpanded) {
          closeTimeout = setTimeout(() => {
            toggle.setAttribute("aria-expanded", "false");
            dropdownMenu.classList.remove("active");
            closeTimeout = null;
          }, 300);
        }
      });
    }

    // Handle keyboard navigation
    toggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle.click();
      } else if (e.key === "Escape") {
        toggle.setAttribute("aria-expanded", "false");
        if (dropdownMenu) {
          dropdownMenu.classList.remove("active");
        }
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-dropdown")) {
      // Clear any pending timeouts
      if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
      }

      dropdownToggles.forEach((toggle) => {
        const dropdownMenu = toggle.nextElementSibling;
        toggle.setAttribute("aria-expanded", "false");
        if (dropdownMenu) {
          dropdownMenu.classList.remove("active");
        }
      });
    }
  });
}

// Table of Contents Active Link Tracking
function initializeTableOfContents() {
  const tocLinks = document.querySelectorAll(".toc-link");
  const sections = document.querySelectorAll(".content-section[id]");

  if (sections.length === 0 || tocLinks.length === 0) return;

  // Create intersection observer for section visibility
  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const tocLink = document.querySelector(`.toc-link[href="#${id}"]`);

      if (entry.isIntersecting) {
        // Remove active class from all TOC links
        tocLinks.forEach((link) => link.classList.remove("active"));
        // Add active class to current section's TOC link
        if (tocLink) {
          tocLink.classList.add("active");
        }
      }
    });
  }, observerOptions);

  // Observe all sections
  sections.forEach((section) => {
    observer.observe(section);
  });

  // Handle TOC link clicks
  tocLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Update active state
        tocLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");

        // Update URL without triggering scroll
        history.pushState(null, null, `#${targetId}`);
      }
    });
  });
}

// Smooth Scrolling for Anchor Links
function initializeSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    // Skip if already handled by TOC
    if (link.classList.contains("toc-link")) return;

    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Skip empty anchors
      if (href === "#" || href === "#!") return;

      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();

        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Update URL
        history.pushState(null, null, href);
      }
    });
  });
}

// Mobile Menu Functionality
function initializeMobileMenu() {
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const navList = document.querySelector(".nav-list");

  if (!mobileToggle || !navList) return;

  mobileToggle.addEventListener("click", function () {
    navList.classList.toggle("mobile-active");
    mobileToggle.classList.toggle("active");

    // Toggle aria-expanded
    const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
    mobileToggle.setAttribute("aria-expanded", !isExpanded);

    // Prevent body scrolling when menu is open
    document.body.style.overflow = navList.classList.contains("mobile-active")
      ? "hidden"
      : "";
  });

  // Close mobile menu on window resize
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      navList.classList.remove("mobile-active");
      mobileToggle.classList.remove("active");
      mobileToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });

  // Close mobile menu when clicking on nav links
  const navLinks = navList.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        navList.classList.remove("mobile-active");
        mobileToggle.classList.remove("active");
        mobileToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  });
}

// Scroll Behavior and Header
function initializeScrollBehavior() {
  const header = document.querySelector(".header");
  let lastScrollTop = 0;
  let ticking = false;

  function updateHeader() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add/remove scrolled class based on scroll position
    if (scrollTop > 10) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScrollTop = scrollTop;
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
}

// Utility Functions
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

// Handle browser back/forward with hash changes
window.addEventListener("hashchange", function () {
  const hash = window.location.hash;
  if (hash) {
    const targetElement = document.querySelector(hash);
    if (targetElement) {
      const headerHeight = document.querySelector(".header").offsetHeight;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  }
});

// Initialize on hash in URL when page loads
window.addEventListener("load", function () {
  const hash = window.location.hash;
  if (hash) {
    setTimeout(() => {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  }
});

// Keyboard Navigation Enhancement
document.addEventListener("keydown", function (e) {
  // Escape key closes all dropdowns
  if (e.key === "Escape") {
    // Clear any pending dropdown close timeouts
    const timeouts = window.dropdownTimeouts || [];
    timeouts.forEach((timeout) => clearTimeout(timeout));
    window.dropdownTimeouts = [];

    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
    dropdownToggles.forEach((toggle) => {
      const dropdownMenu = toggle.nextElementSibling;
      toggle.setAttribute("aria-expanded", "false");
      if (dropdownMenu) {
        dropdownMenu.classList.remove("active");
      }
    });

    // Close mobile menu
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    const navList = document.querySelector(".nav-list");
    if (mobileToggle && navList) {
      navList.classList.remove("mobile-active");
      mobileToggle.classList.remove("active");
      mobileToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  }
});

// Performance: Lazy load images if any
function initializeLazyLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// Call lazy loading initialization
document.addEventListener("DOMContentLoaded", initializeLazyLoading);

// Add smooth reveal animations for cards and sections
function initializeAnimations() {
  const animatedElements = document.querySelectorAll(
    ".card, .use-case-item, .benefit-item, .solution-card, .practice-item"
  );

  if ("IntersectionObserver" in window) {
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            animationObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    animatedElements.forEach((element) => {
      element.style.opacity = "0";
      element.style.transform = "translateY(20px)";
      element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      animationObserver.observe(element);
    });
  }
}

// Initialize animations when DOM is ready
document.addEventListener("DOMContentLoaded", initializeAnimations);
