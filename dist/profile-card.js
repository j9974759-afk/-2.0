// React Bits ProfileCard interaction, adapted to this vanilla-JS portrait.
(() => {
  const portrait = document.querySelector('.profile-portrait');
  if (!portrait) return;
  const card = document.createElement('div');
  card.className = 'portrait-pc-card';
  while (portrait.firstChild) card.append(portrait.firstChild);
  for (const name of ['shine', 'glare']) {
    const layer = document.createElement('span');
    layer.className = `portrait-pc-${name}`;
    layer.setAttribute('aria-hidden', 'true');
    card.append(layer);
  }
  portrait.append(card);
  portrait.classList.add('portrait-pc');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let x = 50, y = 50, targetX = 50, targetY = 50, raf = 0, last = 0;
  const render = () => {
    portrait.style.setProperty('--pc-x', `${x}%`);
    portrait.style.setProperty('--pc-y', `${y}%`);
    portrait.style.setProperty('--pc-rx', `${-(y - 50) / 5}deg`);
    portrait.style.setProperty('--pc-ry', `${(x - 50) / 5}deg`);
    portrait.style.setProperty('--pc-avatar-x', `${(x - 50) * .06}px`);
  };
  function step(ts) {
    const k = 1 - Math.exp(-Math.min(last ? ts - last : 16, 64) / 140);
    last = ts;
    x += (targetX - x) * k; y += (targetY - y) * k;
    render();
    if (Math.abs(x - targetX) + Math.abs(y - targetY) > .04) raf = requestAnimationFrame(step);
    else { raf = 0; last = 0; card.style.willChange = ''; }
  }
  function start() {
    if (!raf) { card.style.willChange = 'transform'; raf = requestAnimationFrame(step); }
  }
  function move(event) {
    if (reduced.matches || !fine.matches || event.pointerType === 'touch') return;
    const rect = portrait.getBoundingClientRect();
    targetX = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
    targetY = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100));
    portrait.classList.add('pc-active'); start();
  }
  function reset() {
    portrait.classList.remove('pc-active');
    targetX = targetY = 50;
    if (reduced.matches || document.hidden) {
      cancelAnimationFrame(raf); raf = last = 0; x = y = 50; render(); card.style.willChange = '';
    } else start();
  }
  portrait.addEventListener('pointerenter', move);
  portrait.addEventListener('pointermove', move);
  portrait.addEventListener('pointerleave', reset);
  portrait.addEventListener('pointercancel', reset);
  reduced.addEventListener('change', reset);
  fine.addEventListener('change', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
})();
