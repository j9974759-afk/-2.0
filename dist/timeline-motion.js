(() => {
  const cards = [...document.querySelectorAll('.experience-item')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!cards.length || reduced.matches) return;
  const waiting = new Map(), visible = new Set(), animations = new Set();
  const surfaces = new Map();
  cards.forEach(card => {
    const surface = document.createElement('div');
    surface.className = 'experience-surface about-border-glow';
    while (card.firstChild) surface.append(card.firstChild);
    card.append(surface);
    surfaces.set(card,surface);
    card.classList.add('timeline-prepared','experience-staged');
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // Keep reached cards eligible when a quick scroll passes several at once.
      if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) return;
      visible.add(entry.target);
      waiting.get(entry.target)?.();
      waiting.delete(entry.target);
    });
  }, {rootMargin:'0px 0px -8% 0px',threshold:0});
  cards.forEach(card => observer.observe(card));
  const waitVisible = card => visible.has(card) || reduced.matches ? Promise.resolve() : new Promise(resolve => waiting.set(card,resolve));
  async function play(card, pseudoElement, frames, duration, easing) {
    if (reduced.matches) return;
    const animation = card.animate(frames,{pseudoElement,duration,easing,fill:'forwards'});
    animations.add(animation);
    await animation.finished.catch(() => {});
    animations.delete(animation);
  }
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    cards.forEach(card => card.classList.remove('timeline-prepared'));
    waiting.forEach(resolve => resolve()); waiting.clear();
    animations.forEach(animation => animation.finish());
    surfaces.forEach(surface => surface.classList.add('has-entered'));
  });
  function enterCard(card) {
    const surface = surfaces.get(card);
    if (reduced.matches) { surface.classList.add('has-entered'); return; }
    surface.style.willChange = 'transform, opacity';
    const animation = surface.animate([
      {opacity:0,transform:'translate3d(0, 96px, 0) scale(.9)'},
      {opacity:1,transform:'translate3d(0, 0, 0) scale(1)'}
    ],{duration:1500,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
    animations.add(animation);
    const onFocus = () => animation.finish();
    const finish = () => {
      surface.removeEventListener('focusin', onFocus);
      surface.classList.add('has-entered');
      surface.style.willChange = '';
      animation.cancel(); animations.delete(animation);
    };
    animation.finished.then(finish,finish);
    surface.addEventListener('focusin', onFocus, {once:true});
  }
  (async () => {
    for (let i=0;i<cards.length;i++) {
      const card = cards[i];
      await waitVisible(card);
      enterCard(card);
      await play(card,'::before',[{scale:0},{scale:1}],400,'cubic-bezier(.22,1,.36,1)');
      if (i < cards.length-1) {
        await play(card,'::after',[{scale:'1 0'},{scale:'1 1'}],520,'cubic-bezier(.22,.65,.3,1)');
      }
      observer.unobserve(card);
    }
    observer.disconnect();
  })();
})();
