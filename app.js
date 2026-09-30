/**
 * GC CHRONO RÉSERVE 44 - LUXURY WATCH SCROLL ENGINE
 * High-performance canvas frame sequence scrubbing, Web Audio clockwork clicks,
 * interactive hotspots, and seamless storytelling.
 */

(function () {
  'use strict';

  // Configuration
  const TOTAL_FRAMES = 40;
  const FRAME_PREFIX = 'frames/ezgif-frame-';
  const FRAME_EXT = '.jpg';
  
  // Elements
  const preloader = document.getElementById('preloader');
  const preloaderPercent = document.getElementById('preloaderPercent');
  const preloaderProgress = document.getElementById('preloaderProgress');
  const preloaderRing = document.getElementById('preloaderRing');
  
  const canvas = document.getElementById('watchCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const scrollContainer = document.getElementById('scrollContainer');
  const ambientGlow = document.getElementById('ambientGlow');
  
  // HUD Elements
  const hudFrameNumber = document.getElementById('hudFrameNumber');
  const hudPhase = document.getElementById('hudPhase');
  const hudAngle = document.getElementById('hudAngle');
  const hotspotsOverlay = document.getElementById('hotspotsOverlay');
  
  // Controls
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioStatusText = document.getElementById('audioStatusText');
  const autoPlayBtn = document.getElementById('autoPlayBtn');
  const playIcon = autoPlayBtn ? autoPlayBtn.querySelector('.play-icon') : null;
  const pauseIcon = autoPlayBtn ? autoPlayBtn.querySelector('.pause-icon') : null;
  const playBtnText = document.getElementById('playBtnText');
  
  const scrubberTrack = document.getElementById('scrubberTrack');
  const scrubberProgress = document.getElementById('scrubberProgress');
  const scrubberThumb = document.getElementById('scrubberThumb');
  const stepPrevBtn = document.getElementById('stepPrevBtn');
  const stepNextBtn = document.getElementById('stepNextBtn');
  const resetAngleBtn = document.getElementById('resetAngleBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const replayExplosionBtn = document.getElementById('replayExplosionBtn');
  const exploreSpecsBtn = document.getElementById('exploreSpecsBtn');

  // Modal Elements
  const componentModal = document.getElementById('componentModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalDismissBtn = document.getElementById('modalDismissBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalBadge = document.getElementById('modalBadge');

  // State
  const images = [];
  let loadedCount = 0;
  let targetFrame = 0;
  let renderedFrame = 0;
  let lastDrawnFrameIndex = -1;
  let isAutoPlaying = false;
  let autoPlayDirection = 1;
  let isDraggingScrubber = false;
  let isAudioMuted = true;
  let audioCtx = null;
  let animationFrameId = null;

  // Frame details for phases
  const PHASES = [
    { maxFrame: 5, label: 'FRONTAL ARCHITECTURE', angle: '0° ALIGNED' },
    { maxFrame: 14, label: 'CHASSIS ROTATION', angle: '35° ISOMETRIC' },
    { maxFrame: 25, label: 'EXPLODED CALIBRE VIEW', angle: 'DECONSTRUCTED' },
    { maxFrame: 34, label: 'HARMONIC REALIGNMENT', angle: 'CONVERGING' },
    { maxFrame: 39, label: 'ASSEMBLED MASTERPIECE', angle: '0° FRONT FACING' }
  ];

  // Helper to format frame path
  function getFramePath(index) {
    const frameNumber = String(index + 1).padStart(3, '0');
    return `${FRAME_PREFIX}${frameNumber}${FRAME_EXT}`;
  }

  // Preload all 40 frames safely with cache support and watchdog
  function preloadFrames() {
    let completed = false;
    let watchdogTimer = null;

    function handleOneLoaded() {
      if (completed) return;
      loadedCount++;
      const percent = Math.min(100, Math.floor((loadedCount / TOTAL_FRAMES) * 100));
      
      if (preloaderPercent) preloaderPercent.textContent = `${percent}%`;
      if (preloaderProgress) preloaderProgress.style.width = `${percent}%`;
      if (preloaderRing) {
        const dashoffset = 276 - (percent / 100) * 276;
        preloaderRing.style.strokeDashoffset = dashoffset;
      }

      if (loadedCount >= TOTAL_FRAMES) {
        completed = true;
        if (watchdogTimer) clearTimeout(watchdogTimer);
        onAllFramesLoaded();
      }
    }

    // Safety watchdog: ensure preloader never hangs indefinitely
    watchdogTimer = setTimeout(() => {
      if (!completed) {
        console.warn('Preloader safety watchdog triggered. Starting experience.');
        completed = true;
        onAllFramesLoaded();
      }
    }, 3000);

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.onload = () => handleOneLoaded();
      img.onerror = () => {
        console.warn(`Frame ${i + 1} failed to load from ${img.src}`);
        handleOneLoaded();
      };
      img.src = getFramePath(i);

      if (img.complete && img.naturalWidth !== 0) {
        handleOneLoaded();
      }

      images.push(img);
    }
  }

  // Called when all images finish loading
  function onAllFramesLoaded() {
    setTimeout(() => {
      if (preloader) preloader.classList.add('fade-out');
      initCanvas();
      drawFrame(0);
      setupScrollObserver();
      startRenderLoop();
    }, 300);
  }

  // Handle Retina & Resize
  function initCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (images[0] && images[0].complete) {
      drawFrame(Math.round(renderedFrame));
    }
  }

  window.addEventListener('resize', initCanvas);

  // High quality draw on canvas (maintaining 16:9 aspect ratio)
  function drawFrame(frameIndex) {
    if (!ctx) return;
    const img = images[frameIndex];
    if (!img || !img.complete) return;

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate aspect ratio containment
    const naturalW = img.naturalWidth || 1280;
    const naturalH = img.naturalHeight || 720;
    const imgAspect = naturalW / naturalH;
    const screenAspect = canvasWidth / canvasHeight;

    let drawW, drawH, drawX, drawY;

    if (screenAspect > imgAspect) {
      // Screen is wider than image
      drawH = canvasHeight;
      drawW = drawH * imgAspect;
      drawX = (canvasWidth - drawW) / 2;
      drawY = 0;
    } else {
      // Screen is taller than image
      drawW = canvasWidth;
      drawH = drawW / imgAspect;
      drawX = 0;
      drawY = (canvasHeight - drawH) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Update UI elements for current frame
    updateHUD(frameIndex);
    updateScrubber(frameIndex);

    // Audio click trigger
    if (frameIndex !== lastDrawnFrameIndex) {
      if (!isAudioMuted && Math.abs(frameIndex - lastDrawnFrameIndex) >= 1) {
        playMechanicalTick();
      }
      lastDrawnFrameIndex = frameIndex;
    }
  }

  // Update HUD
  function updateHUD(frameIndex) {
    const frameNum = frameIndex + 1;
    if (hudFrameNumber) {
      hudFrameNumber.textContent = String(frameNum).padStart(2, '0');
    }

    // Find current phase
    const phase = PHASES.find(p => frameIndex <= p.maxFrame) || PHASES[PHASES.length - 1];
    if (hudPhase) {
      hudPhase.textContent = phase.label;
    }
    if (hudAngle) {
      hudAngle.textContent = phase.angle;
    }

    // Toggle Hotspots visibility (Frames 15 to 26: exploded deconstruction)
    if (hotspotsOverlay) {
      if (frameIndex >= 15 && frameIndex <= 26) {
        hotspotsOverlay.classList.add('active');
      } else {
        hotspotsOverlay.classList.remove('active');
      }
    }

    // Ambient glow pulse during exploded view
    if (ambientGlow) {
      if (frameIndex >= 15 && frameIndex <= 26) {
        ambientGlow.style.opacity = '1';
        ambientGlow.style.transform = 'scale(1.15)';
      } else {
        ambientGlow.style.opacity = '0.5';
        ambientGlow.style.transform = 'scale(1)';
      }
    }
  }

  // Update Scrubber Track & Milestones
  function updateScrubber(frameIndex) {
    const progress = (frameIndex / (TOTAL_FRAMES - 1)) * 100;
    if (scrubberProgress) scrubberProgress.style.width = `${progress}%`;
    if (scrubberThumb) scrubberThumb.style.left = `${progress}%`;

    // Highlight nearest milestone
    const milestones = document.querySelectorAll('.milestone-mark');
    milestones.forEach((m, idx) => {
      const milestoneFrame = [0, 9, 19, 29, 39][idx];
      if (Math.abs(frameIndex - milestoneFrame) <= 3) {
        m.classList.add('active-mark');
      } else {
        m.classList.remove('active-mark');
      }
    });
  }

  // Smooth Render Loop (Lerp interpolation)
  function startRenderLoop() {
    function loop() {
      if (isAutoPlaying) {
        // Auto play continuous loop
        targetFrame += 0.25 * autoPlayDirection;
        if (targetFrame >= TOTAL_FRAMES - 1) {
          targetFrame = TOTAL_FRAMES - 1;
          autoPlayDirection = -1; // bounce back
        } else if (targetFrame <= 0) {
          targetFrame = 0;
          autoPlayDirection = 1; // bounce forward
        }
      }

      // Linear Interpolation for buttery smoothness
      const delta = targetFrame - renderedFrame;
      if (Math.abs(delta) > 0.001) {
        renderedFrame += delta * 0.14;
        const currentIntFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(renderedFrame)));
        drawFrame(currentIntFrame);
      }

      animationFrameId = requestAnimationFrame(loop);
    }
    loop();
  }

  // Scroll Sync
  function onScroll() {
    if (isAutoPlaying) return;

    const scrollY = window.scrollY;
    const maxScroll = scrollContainer.offsetHeight - window.innerHeight;
    
    if (maxScroll <= 0) return;

    const scrollFraction = Math.max(0, Math.min(1, scrollY / maxScroll));
    targetFrame = scrollFraction * (TOTAL_FRAMES - 1);

    updateActiveChapter(scrollY, maxScroll);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Update Story Chapters active state
  function updateActiveChapter(scrollY, maxScroll) {
    const chapters = document.querySelectorAll('.story-chapter');
    const scrollPercent = scrollY / maxScroll;

    chapters.forEach((chapter, index) => {
      const chapterTargetPercent = index / (chapters.length - 1);
      const diff = Math.abs(scrollPercent - chapterTargetPercent);

      if (diff < 0.18) {
        chapter.classList.add('active');
      } else {
        chapter.classList.remove('active');
      }
    });
  }

  function setupScrollObserver() {
    onScroll();
  }

  // Seek to specific frame by setting scroll
  function seekToFrame(frameIndex) {
    const clampedFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex));
    targetFrame = clampedFrame;
    
    const maxScroll = scrollContainer.offsetHeight - window.innerHeight;
    const targetScrollY = (clampedFrame / (TOTAL_FRAMES - 1)) * maxScroll;
    
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }

  // Scrubber Track Interaction
  function handleScrubberInteraction(e) {
    const rect = scrubberTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const target = Math.round(fraction * (TOTAL_FRAMES - 1));
    seekToFrame(target);
  }

  if (scrubberTrack) {
    scrubberTrack.addEventListener('click', handleScrubberInteraction);
  }

  if (scrubberThumb) {
    scrubberThumb.addEventListener('mousedown', (e) => {
      isDraggingScrubber = true;
      e.preventDefault();
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingScrubber || !scrubberTrack) return;
    const rect = scrubberTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const frame = Math.round(fraction * (TOTAL_FRAMES - 1));
    targetFrame = frame;
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingScrubber) {
      isDraggingScrubber = false;
      seekToFrame(Math.round(targetFrame));
    }
  });

  // Step buttons
  if (stepPrevBtn) {
    stepPrevBtn.addEventListener('click', () => {
      seekToFrame(Math.round(targetFrame) - 1);
    });
  }

  if (stepNextBtn) {
    stepNextBtn.addEventListener('click', () => {
      seekToFrame(Math.round(targetFrame) + 1);
    });
  }

  if (resetAngleBtn) {
    resetAngleBtn.addEventListener('click', () => {
      seekToFrame(0);
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      seekToFrame(Math.round(targetFrame) + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      seekToFrame(Math.round(targetFrame) - 1);
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleAutoPlay();
    }
  });

  // Auto-Play Toggle
  function toggleAutoPlay() {
    isAutoPlaying = !isAutoPlaying;
    if (isAutoPlaying) {
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      if (autoPlayBtn) autoPlayBtn.classList.add('active');
      if (playBtnText) playBtnText.textContent = 'Pause 360°';
    } else {
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (autoPlayBtn) autoPlayBtn.classList.remove('active');
      if (playBtnText) playBtnText.textContent = 'Auto View';
    }
  }

  if (autoPlayBtn) {
    autoPlayBtn.addEventListener('click', toggleAutoPlay);
  }

  // Fullscreen Toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Web Audio Mechanical Clockwork Tick Synthesizer
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playMechanicalTick() {
    if (isAudioMuted || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;

      // Filtered noise burst for crisp metallic tooth click
      const bufferSize = audioCtx.sampleRate * 0.015; // 15ms duration
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(4, now);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.015);
    } catch (err) {
      // Ignore audio synthesis errors
    }
  }

  // Audio Toggle
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      initAudio();
      isAudioMuted = !isAudioMuted;
      
      if (isAudioMuted) {
        if (audioStatusText) audioStatusText.textContent = 'Mute';
        audioToggleBtn.classList.remove('active');
      } else {
        if (audioStatusText) audioStatusText.textContent = 'Sound ON';
        audioToggleBtn.classList.add('active');
        playMechanicalTick();
      }
    });
  }

  // Hotspot Click Inspection Modal
  document.querySelectorAll('.hotspot-node').forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = node.getAttribute('data-title');
      const desc = node.getAttribute('data-desc');
      const tag = node.querySelector('.hotspot-tag')?.textContent || 'COMPONENT';

      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalBadge) modalBadge.textContent = tag;
      if (componentModal) componentModal.classList.add('active');
    });
  });

  function closeModal() {
    if (componentModal) componentModal.classList.remove('active');
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeModal);
  if (componentModal) {
    componentModal.addEventListener('click', (e) => {
      if (e.target === componentModal) {
        closeModal();
      }
    });
  }

  // Action button links
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      seekToFrame(0);
    });
  }

  if (replayExplosionBtn) {
    replayExplosionBtn.addEventListener('click', () => {
      seekToFrame(19);
    });
  }

  if (exploreSpecsBtn) {
    exploreSpecsBtn.addEventListener('click', () => {
      const specs = document.getElementById('specs-section');
      if (specs) {
        specs.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Begin loading sequence
  preloadFrames();

})();
