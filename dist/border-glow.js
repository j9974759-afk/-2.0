// Adapted from the supplied React Bits BorderGlow for the static portfolio.
(() => {
  const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const targets = [...document.querySelectorAll('.skill-card.border-glow-card')].map(card => ({host:card,card}));
  document.querySelectorAll('#about .profile, #about .experience-item').forEach(host => {
    host.classList.add('about-border-glow');
    const card = document.createElement('div');
    card.className = 'border-glow-card border-glow-card--light about-glow-layer';
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = '<span class="edge-light"></span>';
    host.prepend(card);
    targets.push({host,card});
  });
  targets.forEach(({host,card}) => {
    ['', '-60', '-50', '-40', '-30', '-20', '-10'].forEach((suffix, i) => {
      const opacity = [100, 60, 50, 40, 30, 20, 10][i];
      card.style.setProperty(`--glow-color${suffix}`, `hsl(255deg 80% 80% / ${opacity}%)`);
    });
    host.addEventListener('pointermove', event => {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      const rect = host.getBoundingClientRect();
      if (host !== card) card.classList.add('sweep-active');
      if (!rect.width || !rect.height) return;
      const dx = event.clientX - rect.left - rect.width / 2;
      const dy = event.clientY - rect.top - rect.height / 2;
      const edge = Math.min(1, Math.max(Math.abs(dx) / (rect.width / 2), Math.abs(dy) / (rect.height / 2)));
      const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360;
      card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    });
    const reset = () => { card.style.setProperty('--edge-proximity', '0'); card.classList.remove('sweep-active'); };
    host.addEventListener('pointerleave', reset);
    host.addEventListener('pointercancel', reset);
  });
})();
