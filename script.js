(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var navToggle = document.querySelector(".site-header__toggle");
  var nav = document.getElementById("site-nav");
  var navOverlay = document.getElementById("nav-overlay");
  var submenuToggle = document.querySelector(".site-nav__submenu-toggle");
  var modal = document.getElementById("contact-modal");
  var modalPanel = modal ? modal.querySelector(".modal__panel") : null;
  var modalStepChoices = document.getElementById("modal-step-choices");
  var modalStepForm = document.getElementById("modal-step-form");
  var showFormButton = document.getElementById("show-contact-form");
  var backToChoicesButton = document.getElementById("back-to-choices");
  var contactForm = document.getElementById("contact-form");
  var openModalButtons = document.querySelectorAll("[data-open-contact-modal]");
  var closeModalElements = document.querySelectorAll("[data-close-contact-modal]");
  
  var lastFocusedElement = null;
  var focusableSelector =
    'a[href], button:not([disabled]), textarea, input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function init() {
    initHeaderScroll();
    initMobileNav();
    initSubmenu();
    initPageAnchorLinks();
    initContactModal();
    initAppliedLightbox();
    initRecognitionPhotoLightbox();
    initContactForm();
    initAudioPlayers();
  }

  function initHeaderScroll() {
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function isHashAnchorLink(href) {
    return Boolean(href && href.charAt(0) === "#");
  }

  function isHtmlPageLink(href) {
    if (!href || isHashAnchorLink(href)) {
      return false;
    }

    return /\.html(?:[?#].*)?$/i.test(href) || /(?:^|\/)[^/?#]+\.html(?:[?#].*)?$/i.test(href);
  }

  function isExternalHttpLink(href) {
    return /^https?:\/\//i.test(href || "");
  }

  function closeSubmenu() {
    if (submenuToggle) {
      submenuToggle.setAttribute("aria-expanded", "false");
    }
  }

  function scrollToHashTarget(href) {
    if (!isHashAnchorLink(href) || href.length < 2) {
      return false;
    }

    var target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) {
      return false;
    }

    var behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

    target.scrollIntoView({ behavior: behavior, block: "start" });

    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", href);
    }

    return true;
  }

  function followInPageAnchor(href, event) {
    if (!scrollToHashTarget(href)) {
      return;
    }

    if (event) {
      event.preventDefault();
    }
  }

  function scheduleInPageAnchorScroll(href, event) {
    if (!isHashAnchorLink(href) || href.length < 2) {
      return;
    }

    if (!document.getElementById(decodeURIComponent(href.slice(1)))) {
      return;
    }

    if (event) {
      event.preventDefault();
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scrollToHashTarget(href);
      });
    });
  }

  function handleNavLinkClick(link, event) {
    var href = link.getAttribute("href") || "";

    if (isHashAnchorLink(href)) {
      closeSubmenu();

      if (window.matchMedia("(max-width: 63.9375rem)").matches) {
        closeMobileNav();
        scheduleInPageAnchorScroll(href, event);
      } else {
        followInPageAnchor(href, event);
      }

      return;
    }

    if (isExternalHttpLink(href) || isHtmlPageLink(href)) {
      closeSubmenu();
      if (window.matchMedia("(max-width: 63.9375rem)").matches) {
        closeMobileNav();
      }
      return;
    }

    closeSubmenu();
    if (window.matchMedia("(max-width: 63.9375rem)").matches) {
      closeMobileNav();
    }
  }

  function initPageAnchorLinks() {
    document.querySelectorAll('a[href="#passport"]').forEach(function (link) {
      if (link.closest("#site-nav")) {
        return;
      }

      link.addEventListener("click", function (event) {
        followInPageAnchor("#passport", event);
      });
    });
  }

  function initMobileNav() {
    if (!navToggle || !nav) return;

    navToggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
      document.body.classList.toggle("nav-open", isOpen);

      if (navOverlay) {
        navOverlay.hidden = !isOpen;
        navOverlay.classList.toggle("is-visible", isOpen);
        navOverlay.setAttribute("aria-hidden", String(!isOpen));
      }
    });

    if (navOverlay) {
      navOverlay.addEventListener("click", closeMobileNav);
    }

    nav.querySelectorAll(".site-nav__link:not(.site-nav__submenu-toggle), .site-nav__sublink").forEach(function (link) {
      link.addEventListener("click", function (event) {
        handleNavLinkClick(link, event);
      });
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 64rem)").matches) {
        closeMobileNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMobileNav();
        navToggle.focus();
      }
    });
  }

  function closeMobileNav() {
    if (!nav || !navToggle) return;

    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("nav-open");

    if (navOverlay) {
      navOverlay.hidden = true;
      navOverlay.classList.remove("is-visible");
      navOverlay.setAttribute("aria-hidden", "true");
    }
  }

  function initSubmenu() {
    if (!submenuToggle) return;

    submenuToggle.addEventListener("click", function () {
      var isExpanded = submenuToggle.getAttribute("aria-expanded") === "true";
      submenuToggle.setAttribute("aria-expanded", String(!isExpanded));
    });
  }

  function initContactModal() {
    if (!modal) return;

    openModalButtons.forEach(function (button) {
      button.addEventListener("click", openContactModal);
    });

    closeModalElements.forEach(function (element) {
      element.addEventListener("click", closeContactModal);
    });

    if (showFormButton) {
      showFormButton.addEventListener("click", showContactForm);
    }

    if (backToChoicesButton) {
      backToChoicesButton.addEventListener("click", showContactChoices);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;

      var appliedLightbox = document.getElementById("applied-lightbox");
      if (appliedLightbox && !appliedLightbox.hidden) {
        return;
      }

      var recognitionPhotoLightbox = document.getElementById("recognition-photo-lightbox");
      if (recognitionPhotoLightbox && !recognitionPhotoLightbox.hidden) {
        return;
      }

      if (!modal.hidden) {
        closeContactModal();
      }
    });

    modal.addEventListener("keydown", trapFocus);
  }

  function getVisibleFocusableElements() {
    if (!modal) return [];

    return Array.prototype.slice.call(modal.querySelectorAll(focusableSelector)).filter(function (element) {
      if (element.closest("[hidden]")) return false;
      return element.offsetParent !== null || element === modal.querySelector(".modal__backdrop");
    });
  }

  function openContactModal() {
    if (!modal) return;

    showContactChoices();
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");

    var focusable = getVisibleFocusableElements();
    if (focusable.length) {
      focusable[0].focus();
    }
  }

  function closeContactModal() {
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.classList.remove("modal-open");
    showContactChoices();

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function showContactForm() {
    if (!modalStepChoices || !modalStepForm) return;

    modalStepChoices.hidden = true;
    modalStepForm.hidden = false;

    if (modalPanel) {
      modalPanel.classList.add("is-form-active");
    }

    var firstField = contactForm ? contactForm.querySelector("input, textarea") : null;
    if (firstField) {
      firstField.focus();
    } else if (backToChoicesButton) {
      backToChoicesButton.focus();
    }
  }

  function showContactChoices() {
    if (!modalStepChoices || !modalStepForm) return;

    modalStepChoices.hidden = false;
    modalStepForm.hidden = true;

    if (modalPanel) {
      modalPanel.classList.remove("is-form-active");
    }

    if (contactForm) {
      contactForm.reset();
    }
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || modal.hidden) return;

    var focusable = getVisibleFocusableElements();
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initContactForm() {
    if (!contactForm) return;
  
    var submitButton = contactForm.querySelector('[type="submit"]');
    var functionUrl = "https://functions.yandexcloud.net/d4e4vgfdsor8hr626i30";
  
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
  
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
  
      var formData = new FormData(contactForm);
  
      var payload = {
        name: String(formData.get("name") || "").trim(),
        contact: String(formData.get("contact") || "").trim(),
        task: String(formData.get("message") || "").trim(),
        consent: formData.get("consent") === "on",
        website: String(formData.get("website") || "").trim()
      };
  
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Отправка...";
      }
  
      fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().catch(function () {
            return {
              ok: false,
              message: "Сервис вернул непонятный ответ."
            };
          }).then(function (result) {
            return {
              response: response,
              result: result
            };
          });
        })
        .then(function (data) {
          if (!data.response.ok || !data.result.ok) {
            throw new Error(
              data.result.message || "Не удалось отправить заявку. Попробуйте ещё раз."
            );
          }
  
          alert(
            data.result.message ||
            "Заявка отправлена. Я свяжусь с вами удобным способом."
          );
  
          contactForm.reset();
          showContactChoices();
        })
        .catch(function (error) {
          alert(error.message || "Не удалось отправить заявку. Попробуйте ещё раз.");
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Отправить заявку";
          }
        });
    });
  }

  function formatAudioTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ":" + String(secs).padStart(2, "0");
  }

  function initAudioPlayers() {
    var playerRoots = document.querySelectorAll("[data-audio-player]");
    if (!playerRoots.length) return;

    var players = [];

    playerRoots.forEach(function (root) {
      players.push(createAudioPlayer(root, players));
    });
  }

  function createAudioPlayer(root, allPlayers) {
    var audio = root.querySelector("audio");
    var playBtn = root.querySelector(".music-player__play");
    var progress = root.querySelector(".music-player__progress");
    var progressTrack = root.querySelector(".music-player__progress-track");
    var progressFill = root.querySelector(".music-player__progress-fill");
    var currentTimeEl = root.querySelector(".music-player__time--current");
    var durationEl = root.querySelector(".music-player__time--duration");
    var errorEl = root.querySelector(".music-player__error");
    var playLabel = playBtn ? playBtn.getAttribute("aria-label") : "";
    var isSeeking = false;
    var playerApi = {
      audio: audio,
      pause: pause
    };

    if (!audio || !playBtn || !progress || !progressTrack || !progressFill) {
      return playerApi;
    }

    function updateDuration() {
      if (durationEl) {
        durationEl.textContent = formatAudioTime(audio.duration);
      }
    }

    function updateProgress() {
      if (!audio.duration || !isFinite(audio.duration)) return;

      var percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = percent + "%";
      progress.setAttribute("aria-valuenow", String(Math.round(percent)));

      if (currentTimeEl) {
        currentTimeEl.textContent = formatAudioTime(audio.currentTime);
      }
    }

    function setPlayingState(isPlaying) {
      root.classList.toggle("is-playing", isPlaying);
      playBtn.setAttribute(
        "aria-label",
        isPlaying ? playLabel.replace("Воспроизвести", "Приостановить") : playLabel
      );
    }

    function pause() {
      audio.pause();
    }

    function pauseOthers() {
      allPlayers.forEach(function (other) {
        if (other !== playerApi && other.audio) {
          other.pause();
        }
      });
    }

    function seekToRatio(ratio) {
      if (!audio.duration || !isFinite(audio.duration)) return;

      var clamped = Math.max(0, Math.min(1, ratio));
      audio.currentTime = clamped * audio.duration;
      updateProgress();
    }

    function seekFromClientX(clientX) {
      var rect = progressTrack.getBoundingClientRect();
      if (!rect.width) return;
      seekToRatio((clientX - rect.left) / rect.width);
    }

    function handleLoadError() {
      root.classList.add("is-error");
      if (errorEl) errorEl.hidden = false;
      playBtn.disabled = true;
      progress.setAttribute("aria-disabled", "true");
      progress.tabIndex = -1;
      pause();
    }

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("play", function () {
      setPlayingState(true);
    });
    audio.addEventListener("pause", function () {
      setPlayingState(false);
    });
    audio.addEventListener("timeupdate", function () {
      if (!isSeeking) updateProgress();
    });
    audio.addEventListener("ended", function () {
      pause();
      audio.currentTime = 0;
      updateProgress();
    });
    audio.addEventListener("error", handleLoadError);

    playBtn.addEventListener("click", function () {
      if (audio.error || playBtn.disabled) return;

      if (audio.paused) {
        pauseOthers();
        var playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            pause();
          });
        }
      } else {
        pause();
      }
    });

    progress.addEventListener("click", function (event) {
      if (audio.error || playBtn.disabled) return;
      seekFromClientX(event.clientX);
    });

    progress.addEventListener("keydown", function (event) {
      if (audio.error || playBtn.disabled || !audio.duration) return;

      var step = 5;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
        updateProgress();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - step);
        updateProgress();
      } else if (event.key === "Home") {
        event.preventDefault();
        audio.currentTime = 0;
        updateProgress();
      } else if (event.key === "End") {
        event.preventDefault();
        audio.currentTime = audio.duration;
        updateProgress();
      }
    });

    function onPointerMove(event) {
      if (!isSeeking) return;
      seekFromClientX(event.clientX);
    }

    function onPointerUp() {
      if (!isSeeking) return;
      isSeeking = false;
      root.classList.remove("is-seeking");
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    }

    progress.addEventListener("pointerdown", function (event) {
      if (audio.error || playBtn.disabled) return;

      isSeeking = true;
      root.classList.add("is-seeking");
      seekFromClientX(event.clientX);
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    });

    if (audio.readyState >= 1) {
      updateDuration();
    }

    if (audio.error) {
      handleLoadError();
    }

    return playerApi;
  }

  function initAppliedLightbox() {
    var lightbox = document.getElementById("applied-lightbox");
    if (!lightbox) return;

    var image = lightbox.querySelector(".applied-lightbox__image");
    var caption = lightbox.querySelector(".applied-lightbox__caption");
    var counter = lightbox.querySelector(".applied-lightbox__counter");
    var prevButton = lightbox.querySelector(".applied-lightbox__nav--prev");
    var nextButton = lightbox.querySelector(".applied-lightbox__nav--next");
    var closeElements = lightbox.querySelectorAll("[data-close-applied-lightbox]");
    var triggers = document.querySelectorAll("[data-applied-gallery]");

    var galleries = {
      "call-quality": [
        {
          src: "assets/images/call-quality-overview.webp",
          alt: "Обзор системы оценки качества звонков",
          caption: "Обзор системы оценки"
        },
        {
          src: "assets/images/call-quality-methodology.webp",
          alt: "Методика и критерии оценки звонков",
          caption: "Методика и критерии"
        },
        {
          src: "assets/images/call-quality-management.webp",
          alt: "Итоговая шкала и управленческий результат",
          caption: "Итоговая шкала и управленческий результат"
        }
      ],
      "telegram-bots": [
        {
          src: "assets/images/telegram-bot-lead-followup.png",
          alt: "Telegram-бот получает контакт и возвращает клиента к диалогу",
          caption: "Передача лида и повторное касание"
        },
        {
          src: "assets/images/telegram-bot-objection-handling.webp",
          alt: "Telegram-бот отвечает на возражение клиента",
          caption: "Работа с возражением"
        }
      ]
    };

    var currentGalleryId = null;
    var currentIndex = 0;
    var lastFocusedElement = null;

    function getCurrentSlides() {
      return galleries[currentGalleryId] || [];
    }

    function updateLightboxSlide() {
      var slides = getCurrentSlides();
      var slide = slides[currentIndex];

      if (!slide || !image || !caption || !counter) return;

      image.src = slide.src;
      image.alt = slide.alt;
      caption.textContent = slide.caption;
      counter.textContent = (currentIndex + 1) + " / " + slides.length;

      if (prevButton) {
        prevButton.disabled = currentIndex === 0;
      }

      if (nextButton) {
        nextButton.disabled = currentIndex >= slides.length - 1;
      }
    }

    function openAppliedLightbox(galleryId, index) {
      if (!galleries[galleryId]) return;

      currentGalleryId = galleryId;
      currentIndex = Math.max(0, Math.min(index, galleries[galleryId].length - 1));
      lastFocusedElement = document.activeElement;
      updateLightboxSlide();
      lightbox.hidden = false;
      document.body.classList.add("modal-open");

      var closeButton = lightbox.querySelector(".applied-lightbox__close");
      if (closeButton) {
        closeButton.focus();
      }
    }

    function closeAppliedLightbox() {
      if (lightbox.hidden) return;

      lightbox.hidden = true;
      document.body.classList.remove("modal-open");

      if (image) {
        image.removeAttribute("src");
      }

      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }

    function showPreviousSlide() {
      if (currentIndex > 0) {
        currentIndex -= 1;
        updateLightboxSlide();
      }
    }

    function showNextSlide() {
      var slides = getCurrentSlides();
      if (currentIndex < slides.length - 1) {
        currentIndex += 1;
        updateLightboxSlide();
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var galleryId = trigger.getAttribute("data-applied-gallery");
        var index = parseInt(trigger.getAttribute("data-applied-index"), 10) || 0;
        openAppliedLightbox(galleryId, index);
      });
    });

    closeElements.forEach(function (element) {
      element.addEventListener("click", closeAppliedLightbox);
    });

    if (prevButton) {
      prevButton.addEventListener("click", showPreviousSlide);
    }

    if (nextButton) {
      nextButton.addEventListener("click", showNextSlide);
    }

    lightbox.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeAppliedLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousSlide();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextSlide();
      }
    });
  }

  function initRecognitionPhotoLightbox() {
    var lightbox = document.getElementById("recognition-photo-lightbox");
    if (!lightbox) return;

    var image = lightbox.querySelector(".recognition-photo-lightbox__image");
    var triggers = document.querySelectorAll("[data-open-recognition-photo]");
    var closeElements = lightbox.querySelectorAll("[data-close-recognition-photo]");
    var lastFocusedElement = null;

    var photos = {
      "creative-generation": {
        src: "assets/images/creative-generation-award-2025.jpg",
        alt: "Награждение Creative Generation 2025 в Москве",
        label: "Фотография награждения Creative Generation 2025",
        document: false
      },
      "dobro-rf": {
        src: "assets/images/dobro-rf-letter-2025.jpg",
        alt: "Благодарственное письмо Добро.РФ Гульшат Ахмадиевой, 2025",
        label: "Благодарственное письмо Добро.РФ",
        document: true
      }
    };

    function openRecognitionPhotoLightbox(photoId) {
      var photo = photos[photoId];
      if (!photo || !image) return;

      lastFocusedElement = document.activeElement;
      image.src = photo.src;
      image.alt = photo.alt;
      lightbox.setAttribute("aria-label", photo.label);
      lightbox.classList.toggle("recognition-photo-lightbox--document", photo.document);
      lightbox.hidden = false;
      document.body.classList.add("modal-open");

      var closeButton = lightbox.querySelector(".recognition-photo-lightbox__close");
      if (closeButton) {
        closeButton.focus();
      }
    }

    function closeRecognitionPhotoLightbox() {
      if (lightbox.hidden) return;

      lightbox.hidden = true;
      lightbox.classList.remove("recognition-photo-lightbox--document");
      document.body.classList.remove("modal-open");

      if (image) {
        image.removeAttribute("src");
        image.alt = "";
      }

      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var photoId = trigger.getAttribute("data-open-recognition-photo");
        openRecognitionPhotoLightbox(photoId);
      });
    });

    closeElements.forEach(function (element) {
      element.addEventListener("click", closeRecognitionPhotoLightbox);
    });

    lightbox.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeRecognitionPhotoLightbox();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
// Лайтбокс для изображения кейса WB/Ozon
(() => {
  const lightbox = document.querySelector('#case-lightbox');
  const triggers = document.querySelectorAll('[data-case-lightbox]');

  if (!lightbox || triggers.length === 0) return;

  const lightboxImage = lightbox.querySelector('.case-lightbox__image');
  const closeButtons = lightbox.querySelectorAll('[data-close-case-lightbox]');
  const closeButton = lightbox.querySelector('.case-lightbox__close');

  let previousBodyOverflow = '';
  let lastFocusedElement = null;

  function openLightbox(event) {
    event.preventDefault();

    const currentTrigger = event.currentTarget;
    const previewImage =
      currentTrigger.querySelector('img') ||
      document.querySelector('.cases__preview-image');

    lastFocusedElement = document.activeElement;

    lightboxImage.src = currentTrigger.href;
    lightboxImage.alt =
      previewImage?.alt ||
      'Пример Telegram-отчётов Wildberries и Ozon';

    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    lightbox.hidden = false;
    closeButton?.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute('src');
    lightboxImage.alt = '';

    document.body.style.overflow = previousBodyOverflow;
    lastFocusedElement?.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', openLightbox);
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) {
      closeLightbox();
    }
  });
})();
