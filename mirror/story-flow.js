(function () {
  var ASSET_ROOT = "./story-assets/";

  var media = {
    heroExterior: ASSET_ROOT + "apartment-exterior.jpeg",
    heroInterior: ASSET_ROOT + "apartment-interior.png"
  };

  var VIDEO_PLAYBACK_RATE = 1.85;
  var WHEEL_TRIGGER_DELTA = 4;
  var WHEEL_RESET_MS = 180;
  var TOUCH_TRIGGER_DELTA = 18;
  var TRANSITION_HANDOFF_MS = 90;
  var LOCKED_KEYS = {
    ArrowDown: 1,
    PageDown: 1,
    " ": 1,
    ArrowUp: -1,
    PageUp: -1
  };

  var chapters = [
    {
      restingImage: ASSET_ROOT + "story-point-1.png",
      forwardVideo: ASSET_ROOT + "chapter-1-forward.mp4",
      reverseVideo: ASSET_ROOT + "chapter-1-reverse.mp4",
      content: ""
    },
    {
      restingImage: ASSET_ROOT + "story-point-2.png",
      forwardVideo: ASSET_ROOT + "chapter-2-forward.mp4",
      reverseVideo: ASSET_ROOT + "chapter-2-reverse.mp4",
      content: ""
    },
    {
      restingImage: ASSET_ROOT + "story-point-3.png",
      forwardVideo: ASSET_ROOT + "chapter-3-forward.mp4",
      reverseVideo: ASSET_ROOT + "chapter-3-reverse.mp4",
      content: ""
    },
    {
      restingImage: ASSET_ROOT + "puppy-finale-focused.jpg",
      forwardVideo: ASSET_ROOT + "chapter-4-forward.mp4",
      reverseVideo: ASSET_ROOT + "chapter-4-reverse.mp4",
      content: ""
    }
  ];

  var currentState = 0;
  var isPlaying = false;
  var touchStartY = 0;
  var touchConsumed = false;
  var wheelDelta = 0;
  var wheelResetTimer = 0;
  var lockedScrollY = 0;
  var restSections = [];
  var targets = [];
  var transitionLayer;
  var activeTransitionVideo;
  var fixedVisualLayer;
  var fixedVisualImage;
  var preloadedVideos = {};
  var preloadedImages = {};
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pointerFrame = null;
  var pendingPointer = { x: 0, y: 0 };

  function initStoryFlow() {
    var hero = document.querySelector(".hero-section.is-home:not(.power)");
    var footer = document.querySelector("footer.footer-section");

    if (!hero || !footer) {
      return;
    }

    document.body.classList.add("nt-story-active");
    document.body.setAttribute("data-nt-story-state", "0");

    buildHeroReveal(hero);
    buildStorySections(hero);
    buildFixedVisualLayer();
    buildTransitionLayer();
    targets = [hero].concat(restSections);

    setupInput();
    setupStateSync();
    preloadImage(media.heroExterior);
    preloadImage(media.heroInterior);
    preloadAround(0);
    preloadAllVideos();
  }

  function buildHeroReveal(hero) {
    if (hero.querySelector(".nt-story-hero-media")) {
      return;
    }

    var shell = document.createElement("div");
    shell.className = "nt-story-hero-media";
    shell.setAttribute("aria-hidden", "true");
    shell.innerHTML = [
      '<img class="nt-story-hero-image nt-story-hero-interior" src="' + media.heroInterior + '" alt="" draggable="false">',
      '<img class="nt-story-hero-image nt-story-hero-exterior" src="' + media.heroExterior + '" alt="" draggable="false">',
      '<div class="nt-story-glass-edge"></div>'
    ].join("");

    hero.insertBefore(shell, hero.firstChild);

    shell.addEventListener("pointerenter", updateRevealPosition);
    shell.addEventListener("pointermove", updateRevealPosition);
    shell.addEventListener("pointerleave", function () {
      shell.classList.remove("is-revealing");
    });
  }

  function updateRevealPosition(event) {
    if (!window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 769px)").matches) {
      return;
    }

    var shell = event.currentTarget;
    var rect = shell.getBoundingClientRect();
    pendingPointer.x = event.clientX - rect.left;
    pendingPointer.y = event.clientY - rect.top;
    shell.classList.add("is-revealing");

    if (pointerFrame) {
      return;
    }

    pointerFrame = window.requestAnimationFrame(function () {
      shell.style.setProperty("--nt-reveal-x", pendingPointer.x + "px");
      shell.style.setProperty("--nt-reveal-y", pendingPointer.y + "px");
      pointerFrame = null;
    });
  }

  function buildStorySections(hero) {
    var shell = document.createElement("div");
    shell.className = "nt-story-shell";
    shell.setAttribute("data-story-system", "chapters");

    restSections = chapters.map(function (chapter, index) {
      var section = document.createElement("section");
      section.className = "nt-story-rest";
      section.setAttribute("data-story-state", String(index + 1));

      var image = document.createElement("img");
      image.className = "nt-story-rest-image";
      image.setAttribute("aria-hidden", "true");
      image.setAttribute("alt", "");
      image.setAttribute("draggable", "false");
      image.src = chapter.restingImage;

      var content = document.createElement("div");
      content.className = "nt-story-content";
      content.innerHTML = chapter.content || "";

      section.appendChild(image);
      section.appendChild(content);
      shell.appendChild(section);
      return section;
    });

    hero.insertAdjacentElement("afterend", shell);
  }

  function buildTransitionLayer() {
    transitionLayer = document.createElement("div");
    transitionLayer.className = "nt-story-transition";
    transitionLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(transitionLayer);
  }

  function buildFixedVisualLayer() {
    fixedVisualLayer = document.createElement("div");
    fixedVisualLayer.className = "nt-story-fixed-visual";
    fixedVisualLayer.setAttribute("aria-hidden", "true");

    fixedVisualImage = document.createElement("img");
    fixedVisualImage.alt = "";
    fixedVisualImage.draggable = false;

    fixedVisualLayer.appendChild(fixedVisualImage);
    document.body.appendChild(fixedVisualLayer);
  }

  function setupInput() {
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown, { passive: false });
  }

  function handleWheel(event) {
    if (isPlaying) {
      event.preventDefault();
      return;
    }

    var rawDirection = getRawDirection(event.deltaY);
    if (!rawDirection || !shouldControl(rawDirection)) {
      return;
    }

    event.preventDefault();
    wheelDelta += event.deltaY;
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(function () {
      wheelDelta = 0;
    }, WHEEL_RESET_MS);

    var direction = getDirection(wheelDelta);
    if (!direction || !shouldControl(direction)) {
      return;
    }

    wheelDelta = 0;
    goToState(currentState + direction);
  }

  function handleTouchStart(event) {
    if (!event.touches || !event.touches.length) {
      return;
    }

    touchStartY = event.touches[0].clientY;
    touchConsumed = false;
  }

  function handleTouchMove(event) {
    if (isPlaying) {
      event.preventDefault();
      return;
    }

    if (!event.touches || !event.touches.length) {
      return;
    }

    var delta = touchStartY - event.touches[0].clientY;
    var direction = getRawDirection(delta);

    if (!direction || !shouldControl(direction)) {
      return;
    }

    event.preventDefault();

    if (touchConsumed || Math.abs(delta) < TOUCH_TRIGGER_DELTA) {
      return;
    }

    touchConsumed = true;
    goToState(currentState + direction);
  }

  function handleTouchEnd() {
    touchConsumed = false;
  }

  function handleKeyDown(event) {
    var direction = LOCKED_KEYS[event.key];

    if (isPlaying) {
      if (direction || event.key === "Home" || event.key === "End") {
        event.preventDefault();
      }
      return;
    }

    if (event.key === " " && event.shiftKey) {
      direction = -1;
    }

    if (!direction || !shouldControl(direction)) {
      return;
    }

    event.preventDefault();
    goToState(currentState + direction);
  }

  function getRawDirection(delta) {
    if (delta === 0) {
      return 0;
    }

    return delta > 0 ? 1 : -1;
  }

  function getDirection(delta) {
    if (Math.abs(delta) < WHEEL_TRIGGER_DELTA) {
      return 0;
    }

    return delta > 0 ? 1 : -1;
  }

  function shouldControl(direction) {
    syncCurrentStateFromViewport();

    if (direction > 0 && currentState >= chapters.length) {
      return false;
    }

    if (direction < 0 && currentState <= 0) {
      return false;
    }

    return isTargetReadable(targets[currentState]);
  }

  function isTargetReadable(target) {
    if (!target) {
      return false;
    }

    var rect = target.getBoundingClientRect();
    var readLine = window.innerHeight * 0.42;
    return rect.top <= readLine && rect.bottom >= readLine;
  }

  function setupStateSync() {
    var ticking = false;

    window.addEventListener("scroll", function () {
      if (isPlaying) {
        window.requestAnimationFrame(function () {
          window.scrollTo({ top: lockedScrollY, behavior: "auto" });
        });
        return;
      }

      if (isPlaying || ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(function () {
        syncCurrentStateFromViewport();
        ticking = false;
      });
    }, { passive: true });
  }

  function syncCurrentStateFromViewport() {
    var bestState = currentState;
    var bestDistance = Infinity;
    var anchor = window.innerHeight * 0.42;

    targets.forEach(function (target, index) {
      var rect = target.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return;
      }

      var distance = Math.abs(rect.top - anchor);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestState = index;
      }
    });

    if (bestState !== currentState) {
      currentState = bestState;
      setFixedVisualForState(currentState);
    }
  }

  function goToState(nextState) {
    if (isPlaying || nextState < 0 || nextState > chapters.length) {
      return;
    }

    var fromState = currentState;
    var direction = nextState > fromState ? 1 : -1;
    var chapter = direction > 0 ? chapters[fromState] : chapters[nextState];

    if (!chapter) {
      return;
    }

    isPlaying = true;
    lockStoryScroll();
    if (window.__nomadaToastLenis && typeof window.__nomadaToastLenis.stop === "function") {
      window.__nomadaToastLenis.stop();
    }
    scrollToState(fromState);
    preloadAround(nextState);

    if (reducedMotion) {
      finishTransition(nextState);
      return;
    }

    playVideo(direction > 0 ? chapter.forwardVideo : chapter.reverseVideo, fromState, function (afterSealed) {
      finishTransition(nextState, afterSealed);
    });
  }

  function playVideo(src, fromState, onDone) {
    var done = false;
    var video = getPreloadedVideo(src);

    function finish() {
      if (done) {
        return;
      }

      done = true;
      video.pause();
      onDone(function () {
        window.setTimeout(function () {
          document.body.classList.remove("nt-story-transitioning");
          window.requestAnimationFrame(function () {
            transitionLayer.classList.remove("is-visible");
            transitionLayer.style.removeProperty("background-image");
            video.removeAttribute("data-active-transition");
            activeTransitionVideo = null;
          });
        }, TRANSITION_HANDOFF_MS);
      });
    }

    video.pause();
    video.setAttribute("data-active-transition", "true");
    video.onended = finish;
    video.onerror = finish;
    video.playbackRate = VIDEO_PLAYBACK_RATE;
    try {
      video.currentTime = 0;
    } catch (error) {
      video.load();
    }

    setTransitionPlaceholder(fromState);
    while (transitionLayer.firstChild) {
      transitionLayer.removeChild(transitionLayer.firstChild);
    }
    transitionLayer.appendChild(video);
    transitionLayer.classList.add("is-visible");
    activeTransitionVideo = video;

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(finish);
    }
  }

  function finishTransition(nextState, afterSealed) {
    currentState = nextState;
    setFixedVisualForState(nextState);
    scrollToState(nextState);
    preloadAround(nextState);

    window.requestAnimationFrame(function () {
      scrollToState(nextState);
    });

    window.setTimeout(function () {
      scrollToState(nextState);
      if (typeof afterSealed === "function") {
        afterSealed();
      }

      window.setTimeout(unlockStoryScroll, reducedMotion ? 0 : TRANSITION_HANDOFF_MS + 24);
    }, reducedMotion ? 0 : 16);
  }

  function scrollToState(state) {
    var target = targets[state];
    if (!target) {
      return;
    }

    var y = target.getBoundingClientRect().top + window.pageYOffset;
    if (isPlaying) {
      lockedScrollY = y;
    }

    if (window.__nomadaToastLenis && typeof window.__nomadaToastLenis.scrollTo === "function") {
      window.__nomadaToastLenis.scrollTo(y, { immediate: true });
    }

    window.scrollTo({ top: y, behavior: "auto" });
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
  }

  function setFixedVisualForState(state) {
    if (!fixedVisualLayer || !fixedVisualImage) {
      return;
    }

    if (state <= 0) {
      document.body.setAttribute("data-nt-story-state", "0");
      fixedVisualLayer.classList.remove("is-visible");
      return;
    }

    var chapter = chapters[state - 1];
    if (!chapter) {
      document.body.setAttribute("data-nt-story-state", "0");
      fixedVisualLayer.classList.remove("is-visible");
      return;
    }

    if (!fixedVisualImage.src || !fixedVisualImage.src.endsWith(chapter.restingImage.replace("./", ""))) {
      fixedVisualImage.src = chapter.restingImage;
    }
    document.body.setAttribute("data-nt-story-state", String(state));
    fixedVisualLayer.classList.add("is-visible");
  }

  function preloadAround(state) {
    var indexes = [state - 1, state, state + 1];

    indexes.forEach(function (index) {
      var chapter = chapters[index];
      if (!chapter) {
        return;
      }

      preloadVideo(chapter.forwardVideo);
      preloadVideo(chapter.reverseVideo);
      preloadImage(chapter.restingImage);
    });
  }

  function preloadAllVideos() {
    chapters.forEach(function (chapter) {
      preloadVideo(chapter.forwardVideo);
      preloadVideo(chapter.reverseVideo);
      preloadImage(chapter.restingImage);
    });
  }

  function preloadVideo(src) {
    if (!src || preloadedVideos[src]) {
      return;
    }

    var video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.playbackRate = VIDEO_PLAYBACK_RATE;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("preload", "auto");
    video.src = src;
    video.load();
    preloadedVideos[src] = video;
  }

  function preloadImage(src) {
    if (!src || preloadedImages[src]) {
      return;
    }

    var image = new Image();
    image.src = src;
    preloadedImages[src] = image;
  }

  function getPreloadedVideo(src) {
    preloadVideo(src);
    return preloadedVideos[src];
  }

  function setTransitionPlaceholder(state) {
    var image = getStateImage(state);
    if (image) {
      transitionLayer.style.backgroundImage = 'url("' + image + '")';
    } else {
      transitionLayer.style.removeProperty("background-image");
    }
  }

  function getStateImage(state) {
    if (state <= 0) {
      return media.heroExterior;
    }

    var chapter = chapters[state - 1];
    return chapter ? chapter.restingImage : "";
  }

  function lockStoryScroll() {
    lockedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    document.documentElement.classList.add("nt-story-lock");
    document.body.classList.add("nt-story-transitioning");
  }

  function unlockStoryScroll() {
    isPlaying = false;
    document.documentElement.classList.remove("nt-story-lock");
    document.body.classList.remove("nt-story-transitioning");
    if (window.__nomadaToastLenis && typeof window.__nomadaToastLenis.start === "function") {
      window.__nomadaToastLenis.start();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStoryFlow);
  } else {
    initStoryFlow();
  }
})();
