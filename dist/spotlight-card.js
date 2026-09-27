// Native adaptation of the supplied SpotlightCard; no React runtime required.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.skill-card').forEach(card => {
    card.classList.add('card-spotlight');
    const light = document.createElement('span');
    light.className = 'spotlight-layer';
    light.setAttribute('aria-hidden', 'true');
    card.append(light);
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || reduced.matches) return;
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      card.style.setProperty('--mouse-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
      card.style.setProperty('--mouse-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
    });
    card.addEventListener('focusin', () => {
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });
})();
