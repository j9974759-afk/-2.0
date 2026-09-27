(() => {
  // Remove the dark export fringe by trimming only the video's alpha edge.
  const filters = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  filters.setAttribute('width', '0');
  filters.setAttribute('height', '0');
  filters.setAttribute('aria-hidden', 'true');
  filters.style.position = 'absolute';
  filters.innerHTML = '<defs><filter id="home-ip-clean-edge" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="trimmed"/><feGaussianBlur in="trimmed" stdDeviation="0.3" result="softEdge"/><feComposite in="SourceGraphic" in2="softEdge" operator="in"/></filter></defs>';
  document.body.append(filters);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const bindings = [
    ['.hero-guide', 'home'], ['.works-guide', 'works'],
    ['.skills-guide', 'skills'], ['.contact-guide', 'contact']
  ];
  const states = bindings.map(([selector, name]) => {
    const host = document.querySelector(selector);
    const video = document.createElement('video');
    video.className = 'ip-animation';
    video.muted = video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('disablepictureinpicture', '');
    host.append(video);
    if (name === 'contact') {
      const portrait = host.parentElement;
      let visibleBottom = null;
      const alignBottom = () => {
        if (visibleBottom === null || !video.videoWidth) return;
        const width = host.offsetWidth, height = host.offsetHeight;
        const renderedHeight = Math.min(height, width * video.videoHeight / video.videoWidth);
        const bottom = (height - renderedHeight) / 2 + renderedHeight * visibleBottom;
        portrait.style.bottom = `${-(height - bottom)}px`;
      };
      // Align visible artwork, excluding transparent padding and object-fit letterboxing.
      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = Math.round(256 * video.videoHeight / video.videoWidth);
        const context = canvas.getContext('2d', {willReadFrequently:true});
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let y = canvas.height - 1; y >= 0; y--) {
          let count = 0;
          for (let x = 0; x < canvas.width; x++) {
            if (pixels[(y * canvas.width + x) * 4 + 3] > 24) count++;
          }
          if (count >= 3) { visibleBottom = (y + 1) / canvas.height; break; }
        }
        alignBottom();
      }, {once:true});
      new ResizeObserver(alignBottom).observe(host);
    }
    const state = {host, video, visible:false, source:`assets/motion/character-${name}.webm`, pending:false};
    video.addEventListener('playing', () => host.classList.add('has-video'));
    video.addEventListener('error', () => host.classList.remove('has-video'));
    return state;
  });
  function sync(state) {
    const {video, host} = state;
    if (!state.visible || document.hidden || reduced.matches) {
      video.pause();
      if (reduced.matches) host.classList.remove('has-video');
      return;
    }
    if (!video.hasAttribute('src')) video.src = state.source;
    if (state.pending || !video.paused) return;
    state.pending = true;
    video.play().then(() => {
      if (!state.visible || document.hidden || reduced.matches) video.pause();
    }).catch(() => host.classList.remove('has-video')).finally(() => { state.pending = false; });
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = states.find(state => state.host === entry.target);
      state.visible = entry.isIntersecting;
      sync(state);
    });
  }, {threshold:0});
  states.forEach(state => observer.observe(state.host));
  document.addEventListener('visibilitychange', () => states.forEach(sync));
  reduced.addEventListener('change', () => states.forEach(sync));
})();
