(function () {
  var ASSET_ROOT = "./story-assets/";
  var HERO_IMAGE = ASSET_ROOT + "hero-static.jpeg";
  var HERO_WATER_IMAGE = ASSET_ROOT + "hero-water.png";
  var VIDEO_PLAYBACK_RATE = 1.9;
  var WHEEL_TRIGGER_DELTA = 4;
  var WHEEL_RESET_MS = 180;
  var TOUCH_TRIGGER_DELTA = 18;
  var LOCKED_KEYS = {
    ArrowDown: 1,
    PageDown: 1,
    " ": 1,
    ArrowUp: -1,
    PageUp: -1
  };

  var states = [
    {
      image: HERO_IMAGE,
      text: {
        title: ["Curated", "Lived", "Spaces"],
        subtitle: "Unlocking Refined Atmosphere For Design-Led Living"
      }
    },
    {
      image: ASSET_ROOT + "story-point-1.png",
      text: {
        title: ["Composed", "Spaces"],
        subtitle: "Lasting Atmosphere."
      }
    },
    {
      image: ASSET_ROOT + "story-point-2.png",
      text: {
        title: ["Architectural", "Storytelling"],
        subtitle: "Interior Design, Composed."
      }
    },
    {
      image: ASSET_ROOT + "story-point-3.png?v=image6-active-bg-20260622-1725",
      text: {
        title: ["Process"],
        subtitle: "Initial Atmosphere. Design Direction. Material Resolution."
      }
    },
    {
      image: ASSET_ROOT + "puppy-finale-focused.jpg",
      text: {
        title: ["Jo", "Mendes"],
        subtitle: "Nomada Toast Services"
      }
    }
  ];

  var edges = [
    {
      fromState: 0,
      toState: 1,
      forwardVideo: ASSET_ROOT + "chapter-1-forward.mp4",
      reverseVideo: ASSET_ROOT + "chapter-1-reverse.mp4"
    },
    {
      fromState: 1,
      toState: 2,
      forwardVideo: ASSET_ROOT + "chapter-2-forward.mp4",
      reverseVideo: ASSET_ROOT + "chapter-2-reverse.mp4"
    },
    {
      fromState: 2,
      toState: 3,
      forwardVideo: ASSET_ROOT + "chapter-3-forward.mp4",
      reverseVideo: ASSET_ROOT + "chapter-3-reverse.mp4"
    },
    {
      fromState: 3,
      toState: 4,
      forwardVideo: ASSET_ROOT + "chapter-4-forward.mp4",
      reverseVideo: ASSET_ROOT + "chapter-4-reverse.mp4"
    }
  ];

  var currentState = 0;
  var inputLocked = false;
  var activeTransition = null;
  var touchStartY = 0;
  var touchConsumed = false;
  var wheelDelta = 0;
  var wheelResetTimer = 0;
  var lockedScrollY = 0;
  var restSections = [];
  var targets = [];
  var transitionLayer;
  var fixedVisualLayer;
  var fixedVisualImage;
  var restVisualImage;
  var heroStaticLayer;
  var heroStaticImage;
  var waterFrame = null;
  var waterPoint = { x: 50, y: 50 };
  var imageReadyPromises = {};
  var videoPreloadLinks = {};
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initStoryFlow() {
    var hero = document.querySelector(".hero-section.is-home:not(.power)");
    var footer = document.querySelector("footer.footer-section");

    if (!hero || !footer) {
      return;
    }

    document.body.classList.add("nt-story-active");
    document.body.setAttribute("data-nt-story-state", "0");
    window.setTimeout(function () {
      document.body.classList.add("nt-loader-finished");
    }, 1900);

    buildStaticHero(hero);
    buildStorySections(hero);
    buildFixedVisualLayer();
    buildTransitionLayer();
    targets = [hero].concat(restSections);

    setVisualForState(0);
    setupInput();
    setupStateSync();
    preloadAround(0);
    preloadAllMedia();
    ensureImageReady(HERO_WATER_IMAGE);
  }

  function buildStaticHero(hero) {
    if (hero.querySelector(".nt-story-hero-static")) {
      heroStaticLayer = hero.querySelector(".nt-story-hero-static");
      heroStaticImage = heroStaticLayer.querySelector("img");
      return;
    }

    var shell = document.createElement("div");
    var image = document.createElement("img");
    var waterImage = document.createElement("img");

    shell.className = "nt-story-hero-static";
    shell.setAttribute("aria-hidden", "true");

    image.className = "nt-story-hero-static-image";
    image.alt = "";
    image.draggable = false;
    image.decoding = "async";
    image.loading = "eager";

    image.src = HERO_IMAGE;

    waterImage.className = "nt-story-hero-water";
    waterImage.alt = "";
    waterImage.draggable = false;
    waterImage.decoding = "async";
    waterImage.loading = "eager";
    waterImage.src = HERO_WATER_IMAGE;

    shell.appendChild(image);
    shell.appendChild(waterImage);
    hero.insertBefore(shell, hero.firstChild);
    heroStaticLayer = shell;
    heroStaticImage = image;

    hero.addEventListener("pointerenter", updateWaterEffect);
    hero.addEventListener("pointermove", updateWaterEffect);
    hero.addEventListener("pointerleave", clearWaterEffect);
  }

  function updateWaterEffect(event) {
    if (!heroStaticLayer || currentState !== 0 || inputLocked) {
      return;
    }

    var rect = heroStaticLayer.getBoundingClientRect();
    waterPoint.x = event.clientX - rect.left;
    waterPoint.y = event.clientY - rect.top;
    heroStaticLayer.classList.add("is-water-active");

    if (waterFrame) {
      return;
    }

    waterFrame = window.requestAnimationFrame(function () {
      heroStaticLayer.style.setProperty("--nt-water-x", waterPoint.x + "px");
      heroStaticLayer.style.setProperty("--nt-water-y", waterPoint.y + "px");
      waterFrame = null;
    });
  }

  function clearWaterEffect() {
    if (!heroStaticLayer) {
      return;
    }

    heroStaticLayer.classList.remove("is-water-active");
  }

  function buildStorySections(hero) {
    var shell = document.createElement("div");
    shell.className = "nt-story-shell";
    shell.setAttribute("data-story-system", "chapters");

    restSections = states.slice(1).map(function (_state, index) {
      var section = document.createElement("section");
      var content = document.createElement("div");

      section.className = "nt-story-rest";
      section.setAttribute("data-story-state", String(index + 1));
      content.className = "nt-story-content";
      content.appendChild(createStateText(index + 1, "nt-story-state-copy"));

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
    fixedVisualImage.decoding = "async";

    fixedVisualLayer.appendChild(fixedVisualImage);
    document.body.appendChild(fixedVisualLayer);
  }

  function setupInput() {
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    window.addEventListener("keydown", handleKeyDown, { passive: false });
  }

  function handleWheel(event) {
    if (inputLocked) {
      stopInput(event);
      return;
    }

    var rawDirection = getRawDirection(event.deltaY);
    if (!rawDirection || !canMove(rawDirection)) {
      return;
    }

    stopInput(event);
    wheelDelta += event.deltaY;
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(function () {
      wheelDelta = 0;
    }, WHEEL_RESET_MS);

    var direction = getDirection(wheelDelta);
    if (!direction || !canMove(direction)) {
      return;
    }

    wheelDelta = 0;
    beginTransition(currentState + direction);
  }

  function handleTouchStart(event) {
    if (inputLocked) {
      stopInput(event);
      return;
    }

    if (!event.touches || !event.touches.length) {
      return;
    }

    touchStartY = event.touches[0].clientY;
    touchConsumed = false;
  }

  function handleTouchMove(event) {
    if (inputLocked) {
      stopInput(event);
      return;
    }

    if (!event.touches || !event.touches.length) {
      return;
    }

    var delta = touchStartY - event.touches[0].clientY;
    var direction = getRawDirection(delta);

    if (!direction || !canMove(direction)) {
      return;
    }

    stopInput(event);

    if (touchConsumed || Math.abs(delta) < TOUCH_TRIGGER_DELTA) {
      return;
    }

    touchConsumed = true;
    beginTransition(currentState + direction);
  }

  function handleTouchEnd(event) {
    if (inputLocked) {
      stopInput(event);
      return;
    }

    touchConsumed = false;
  }

  function handleKeyDown(event) {
    var direction = LOCKED_KEYS[event.key];

    if (event.key === " " && event.shiftKey) {
      direction = -1;
    }

    if (inputLocked) {
      if (direction || event.key === "Home" || event.key === "End") {
        stopInput(event);
      }
      return;
    }

    if (!direction || !canMove(direction)) {
      return;
    }

    stopInput(event);
    beginTransition(currentState + direction);
  }

  function stopInput(event) {
    event.preventDefault();
    event.stopPropagation();
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

  function canMove(direction) {
    syncCurrentStateFromViewport();

    if (direction > 0 && currentState >= states.length - 1) {
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
      if (inputLocked) {
        window.requestAnimationFrame(function () {
          forceScrollTo(lockedScrollY);
        });
        return;
      }

      if (ticking) {
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
      setVisualForState(currentState);
    }
  }

  function beginTransition(toState) {
    var transition = createTransition(toState);

    if (!transition || inputLocked) {
      return;
    }

    activeTransition = transition;
    inputLocked = true;
    lockStoryScroll(transition.fromState);
    preloadAround(transition.toState);

    prepareTransition(transition)
      .then(function (prepared) {
        if (activeTransition !== transition) {
          destroyVideo(prepared.video);
          return;
        }

        playTransition(transition, prepared.video);
      })
      .catch(function (error) {
        window.console.warn("Story transition was cancelled because media was not ready.", error);
        cancelTransition();
      });
  }

  function createTransition(toState) {
    if (toState < 0 || toState >= states.length || toState === currentState) {
      return null;
    }

    var direction = toState > currentState ? 1 : -1;
    var edge = edges[Math.min(currentState, toState)];

    if (!edge || Math.abs(toState - currentState) !== 1) {
      return null;
    }

    return {
      fromState: currentState,
      toState: toState,
      direction: direction,
      video: direction > 0 ? edge.forwardVideo : edge.reverseVideo,
      destinationImage: getStateImage(toState)
    };
  }

  function prepareTransition(transition) {
    var imageReady = ensureImageReady(transition.destinationImage);

    if (reducedMotion) {
      return imageReady.then(function () {
        return { video: null };
      });
    }

    return Promise.all([
      prepareVideo(transition.video),
      imageReady
    ]).then(function (results) {
      return { video: results[0] };
    });
  }

  function playTransition(transition, video) {
    if (reducedMotion || !video) {
      commitTransition(transition, null);
      return;
    }

    video.defaultPlaybackRate = VIDEO_PLAYBACK_RATE;
    video.playbackRate = VIDEO_PLAYBACK_RATE;
    video.setAttribute("data-active-transition", "true");
    video.onended = function () {
      commitTransition(transition, video);
    };
    video.onerror = function () {
      commitTransition(transition, video);
    };

    transitionLayer.replaceChildren(video);
    mountTransitionText(transition, video);
    transitionLayer.classList.add("is-visible");
    document.body.classList.add("nt-story-video-active");

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        commitTransition(transition, video);
      });
    }
  }

  function mountTransitionText(transition, video) {
    var overlay = document.createElement("div");
    var thread = document.createElement("div");
    var duration = 1400;

    if (video && isFinite(video.duration) && video.duration > 0) {
      duration = Math.max(900, Math.round((video.duration / VIDEO_PLAYBACK_RATE) * 1000));
    }

    overlay.className = "nt-story-copy-rail";
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("data-direction", String(transition.direction));
    thread.className = "nt-story-copy-thread";
    thread.style.setProperty("--nt-copy-duration", duration + "ms");
    thread.style.setProperty("--nt-thread-from", "-" + (transition.fromState * 100) + "vh");
    thread.style.setProperty("--nt-thread-to", "-" + (transition.toState * 100) + "vh");

    states.forEach(function (_state, index) {
      var item = document.createElement("div");
      item.className = "nt-story-copy-thread-item";
      item.setAttribute("data-story-thread-state", String(index));
      item.appendChild(createStateText(index, "nt-story-thread-copy"));
      thread.appendChild(item);
    });

    overlay.appendChild(thread);
    transitionLayer.appendChild(overlay);
  }

  function createStateText(stateIndex, className) {
    var state = states[stateIndex] || states[0];
    var text = state.text || states[0].text;
    var wrap = document.createElement("div");
    var title = document.createElement("div");
    var subtitle = document.createElement("p");

    wrap.className = "nt-story-copy " + className;
    title.className = "nt-story-copy-title";

    text.title.forEach(function (line) {
      var lineNode = document.createElement("span");
      lineNode.textContent = line;
      title.appendChild(lineNode);
    });

    subtitle.className = "nt-story-copy-subtitle";
    subtitle.textContent = text.subtitle || "";

    wrap.appendChild(title);
    if (text.subtitle) {
      wrap.appendChild(subtitle);
    }

    return wrap;
  }

  function commitTransition(transition, video) {
    if (activeTransition !== transition) {
      destroyVideo(video);
      return;
    }

    currentState = transition.toState;
    setVisualForState(transition.toState);
    scrollToState(transition.toState);
    preloadAround(transition.toState);

    window.requestAnimationFrame(function () {
      transitionLayer.classList.remove("is-visible");
      document.body.classList.remove("nt-story-video-active");
      destroyVideo(video);
      transitionLayer.replaceChildren();
      transitionLayer.removeAttribute("data-transition");
      activeTransition = null;
      unlockStoryScroll();
    });
  }

  function cancelTransition() {
    transitionLayer.classList.remove("is-visible");
    transitionLayer.replaceChildren();
    document.body.classList.remove("nt-story-video-active");
    activeTransition = null;
    setVisualForState(currentState);
    unlockStoryScroll();
  }

  function setVisualForState(state) {
    document.body.setAttribute("data-nt-story-state", String(state));
    syncRestBackgrounds(state);

    if (!fixedVisualLayer || !fixedVisualImage) {
      return;
    }

    if (state <= 0) {
      fixedVisualLayer.classList.remove("is-visible");
      fixedVisualImage.removeAttribute("src");
      fixedVisualImage.removeAttribute("data-current-image");
      return;
    }

    var src = getStateImage(state);
    if (fixedVisualImage.getAttribute("src") !== src) {
      fixedVisualImage.src = src;
    }
    fixedVisualImage.setAttribute("data-current-image", src);
    fixedVisualLayer.classList.add("is-visible");
  }

  function syncRestBackgrounds(state) {
    var activeImage = state > 0 ? getStateImage(state) : "";
    document.body.style.setProperty("--nt-story-body-image", activeImage ? "url(\"" + activeImage + "\")" : "none");

    restSections.forEach(function (section, index) {
      var stateIndex = index + 1;
      var image = stateIndex === state ? activeImage : "";
      section.style.backgroundImage = image ? "url(\"" + image + "\")" : "";
    });

    if (state <= 0) {
      removeRestVisualImage();
      return;
    }

    var activeSection = restSections[state - 1];
    if (!activeSection || !activeImage) {
      removeRestVisualImage();
      return;
    }

    if (!restVisualImage) {
      restVisualImage = document.createElement("img");
      restVisualImage.className = "nt-story-rest-image";
      restVisualImage.alt = "";
      restVisualImage.draggable = false;
      restVisualImage.decoding = "async";
      restVisualImage.loading = "eager";
    }

    if (restVisualImage.getAttribute("src") !== activeImage) {
      restVisualImage.src = activeImage;
    }

    if (restVisualImage.parentElement !== activeSection) {
      activeSection.insertBefore(restVisualImage, activeSection.firstChild);
    }
  }

  function removeRestVisualImage() {
    if (restVisualImage && restVisualImage.parentElement) {
      restVisualImage.remove();
    }
  }

  function preloadAround(state) {
    [state - 1, state, state + 1].forEach(function (stateIndex) {
      ensureImageReady(getStateImage(stateIndex));
    });

    [state - 1, state].forEach(function (edgeIndex) {
      var edge = edges[edgeIndex];
      if (!edge) {
        return;
      }

      preloadVideo(edge.forwardVideo);
      preloadVideo(edge.reverseVideo);
    });
  }

  function preloadAllMedia() {
    states.forEach(function (_state, stateIndex) {
      ensureImageReady(getStateImage(stateIndex));
    });
    ensureImageReady(HERO_WATER_IMAGE);

    edges.forEach(function (edge) {
      preloadVideo(edge.forwardVideo);
      preloadVideo(edge.reverseVideo);
    });
  }

  function preloadVideo(src) {
    if (!src || videoPreloadLinks[src]) {
      return;
    }

    var link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = src;
    link.type = "video/mp4";
    document.head.appendChild(link);
    videoPreloadLinks[src] = link;
  }

  function prepareVideo(src) {
    return new Promise(function (resolve, reject) {
      var video = document.createElement("video");
      var loadedData = false;
      var canPlay = false;
      var settled = false;

      function cleanup() {
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("error", handleError);
      }

      function resolveIfReady() {
        if (settled || !loadedData || !canPlay) {
          return;
        }

        settled = true;
        cleanup();
        try {
          video.currentTime = 0;
        } catch (error) {
          video.load();
        }
        video.defaultPlaybackRate = VIDEO_PLAYBACK_RATE;
        video.playbackRate = VIDEO_PLAYBACK_RATE;
        resolve(video);
      }

      function handleLoadedData() {
        loadedData = true;
        resolveIfReady();
      }

      function handleCanPlay() {
        canPlay = true;
        resolveIfReady();
      }

      function handleError() {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        reject(video.error || new Error("Video failed to load: " + src));
      }

      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.defaultPlaybackRate = VIDEO_PLAYBACK_RATE;
      video.playbackRate = VIDEO_PLAYBACK_RATE;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "auto");
      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("error", handleError);
      video.src = src;
      video.load();

      if (video.readyState >= 2) {
        loadedData = true;
      }

      if (video.readyState >= 3) {
        canPlay = true;
      }

      resolveIfReady();
    });
  }

  function ensureImageReady(src) {
    if (!src) {
      return Promise.resolve();
    }

    if (imageReadyPromises[src]) {
      return imageReadyPromises[src];
    }

    imageReadyPromises[src] = new Promise(function (resolve, reject) {
      var image = new Image();

      function resolveLoaded() {
        resolve(src);
      }

      function rejectFailed() {
        reject(new Error("Image failed to load: " + src));
      }

      image.decoding = "async";
      image.onload = resolveLoaded;
      image.onerror = rejectFailed;
      image.src = src;

      if (image.decode) {
        image.decode().then(resolveLoaded).catch(function () {
          if (image.complete && image.naturalWidth > 0) {
            resolveLoaded();
          }
        });
      } else if (image.complete && image.naturalWidth > 0) {
        resolveLoaded();
      }
    });

    return imageReadyPromises[src];
  }

  function destroyVideo(video) {
    if (!video) {
      return;
    }

    video.pause();
    video.removeAttribute("data-active-transition");
    video.removeAttribute("src");
    video.load();
    video.remove();
  }

  function getStateImage(state) {
    if (state <= 0) {
      return getHeroImageSource();
    }

    return states[state] ? states[state].image : "";
  }

  function getHeroImageSource() {
    return HERO_IMAGE;
  }

  function lockStoryScroll(state) {
    lockedScrollY = getStateScrollY(state);
    document.documentElement.classList.add("nt-story-lock");
    document.body.classList.add("nt-story-transitioning");

    if (window.__nomadaToastLenis && typeof window.__nomadaToastLenis.stop === "function") {
      window.__nomadaToastLenis.stop();
    }

    forceScrollTo(lockedScrollY);
  }

  function unlockStoryScroll() {
    inputLocked = false;
    document.documentElement.classList.remove("nt-story-lock");
    document.body.classList.remove("nt-story-transitioning");

    if (window.__nomadaToastLenis && typeof window.__nomadaToastLenis.start === "function") {
      window.__nomadaToastLenis.start();
    }

    syncCurrentStateFromViewport();
  }

  function scrollToState(state) {
    forceScrollTo(getStateScrollY(state));
  }

  function getStateScrollY(state) {
    var target = targets[state];

    if (!target) {
      return 0;
    }

    return target.getBoundingClientRect().top + window.pageYOffset;
  }

  function forceScrollTo(y) {
    lockedScrollY = y;

    if (window.__nomadaToastLenis && typeof window.__nomadaToastLenis.scrollTo === "function") {
      window.__nomadaToastLenis.scrollTo(y, { immediate: true });
    }

    window.scrollTo({ top: y, behavior: "auto" });
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStoryFlow);
  } else {
    initStoryFlow();
  }
})();
