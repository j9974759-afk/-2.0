// React Bits BounceCards sibling interaction, adapted to native DOM cards.
(() => {
  const grid = document.querySelector('.projects-grid');
  const cards = [...grid.querySelectorAll('.project-card')];
  const enabled = matchMedia('(min-width: 801px) and (hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let hovered = null;
  let focused = null;
  function update() {
    const active = focused || hovered;
    const index = cards.indexOf(active);
    // Keep the spread inside this collage's available page margins.
    const push = Math.min(65, grid.clientWidth * .06);
    cards.forEach((card, i) => {
      const spread = enabled.matches && !reduced.matches && index >= 0 && i !== index;
      const moveDown = active?.dataset.project === 'medical' && card.dataset.project === 'palace';
      const moveUp = active?.dataset.project === 'palace' && card.dataset.project === 'medical';
      const vertical = moveDown || moveUp;
      const extraDown = active?.dataset.project === 'alipay' && card.dataset.project === 'palace' ? 15 : 0;
      const extraUp = active?.dataset.project === 'alipay' && card.dataset.project === 'medical' ? 45 : 0;
      const courseMedical = active?.dataset.project === 'course' && card.dataset.project === 'medical';
      const coursePalace = active?.dataset.project === 'course' && card.dataset.project === 'palace';
      const courseX = courseMedical ? 20 : coursePalace ? 10 : 0;
      const courseY = courseMedical ? -25 : coursePalace ? 25 : 0;
      card.style.setProperty('--bounce-push', `${spread && !vertical ? (i < index ? -push : push) - (extraUp ? 23 : 0) + courseX : 0}px`);
      card.style.setProperty('--bounce-push-y', `${spread ? (vertical ? (moveDown ? push : -push) : 0) + extraDown - extraUp + courseY : 0}px`);
      card.style.setProperty('--bounce-delay', `${spread ? Math.abs(index - i) * 50 : 0}ms`);
    });
  }
  cards.forEach(card => {
    card.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = card;
      update();
    });
    card.addEventListener('pointerleave', () => { hovered = null; update(); });
    card.addEventListener('focus', () => { focused = card; update(); });
    card.addEventListener('blur', () => { focused = null; update(); });
  });
  enabled.addEventListener('change', update);
  reduced.addEventListener('change', update);
  window.addEventListener('blur', () => { hovered = null; focused = null; update(); });
})();

