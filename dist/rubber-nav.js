// Native DOM adaptation of React Bits RubberSegment.
(() => {
  const nav = document.querySelector('.nav');
  const links = [...nav.querySelectorAll('a')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const thumb = document.createElement('span');
  thumb.className = 'rubber-nav-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  nav.append(thumb);
  nav.classList.add('rubber-nav');
  let animation, selected, drag, suppressClick = false, lockUntil = 0, syncTimer;
  const box = link => ({left:link.offsetLeft, width:link.offsetWidth, top:link.offsetTop, height:link.offsetHeight});
  function move(link, immediate = false) {
    const current = getComputedStyle(thumb);
    const left = parseFloat(current.left) || 0, width = parseFloat(current.width) || 0;
    const radius = current.borderRadius;
    animation?.cancel();
    const b = box(link);
    Object.assign(thumb.style, {left:b.left+'px',width:b.width+'px',top:b.top+'px',height:b.height+'px'});
    selected = link;
    if (immediate || reduce.matches || !width) return;
    const start = Math.min(left, b.left), end = Math.max(left + width, b.left + b.width);
    // Ease each phase separately: a global ease compressed the long stretch
    // into a few frames and left the contraction appearing to stall.
    animation = thumb.animate([
      {left:left+'px',width:width+'px',borderRadius:radius,offset:0,easing:'cubic-bezier(.23,1,.32,1)'},
      {left:start+'px',width:(end-start)+'px',borderRadius:'10px',offset:.36,easing:'cubic-bezier(.16,1,.3,1)'},
      {left:b.left+'px',width:b.width+'px',borderRadius:'40px',offset:1}
    ], {duration:560,easing:'linear'});
  }
  function sync() {
    if (drag || performance.now() < lockUntil) return;
    const link = links.find(link => link.classList.contains('active')) || links[0];
    if (link !== selected) move(link);
  }
  function select(link) {
    nav.dataset.navigationTarget = link.hash;
    lockUntil = performance.now() + 1000;
    links.forEach(item => {
      item.classList.toggle('active', item === link);
      if (item === link) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
    move(link);
    clearTimeout(syncTimer);
    syncTimer = setTimeout(unlock, 1500);
  }
  function unlock() {
    clearTimeout(syncTimer);
    delete nav.dataset.navigationTarget;
    lockUntil = 0;
  }
  // Keep one committed selection throughout smooth anchor scrolling.
  window.addEventListener('scroll', () => {
    if (!nav.dataset.navigationTarget) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(unlock, 180);
  }, {passive:true});
  window.addEventListener('wheel', unlock, {passive:true});
  window.addEventListener('touchstart', event => {
    if (!nav.contains(event.target)) unlock();
  }, {passive:true});
  nav.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); suppressClick = false; return; }
    const link = event.target.closest('a');
    if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) select(link);
  });
  nav.addEventListener('keydown', event => {
    const index = links.indexOf(event.target);
    if (index < 0) return;
    const next = event.key === 'ArrowRight' ? Math.min(index+1,links.length-1) : event.key === 'ArrowLeft' ? Math.max(index-1,0) : event.key === 'Home' ? 0 : event.key === 'End' ? links.length-1 : null;
    if (next === null) return;
    event.preventDefault(); links[next].focus(); links[next].click();
  });
  nav.addEventListener('dragstart', event => event.preventDefault());
  nav.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (event.target.closest('a') !== selected) return;
    const b = box(selected);
    drag = {id:event.pointerId,x:event.clientX,last:event.clientX,time:event.timeStamp,velocity:0,left:b.left,width:b.width,live:false};
  });
  nav.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX-drag.x;
    if (!drag.live && Math.abs(dx) < 4) return;
    if (!drag.live) { drag.live = true; nav.setPointerCapture(event.pointerId); animation?.cancel(); nav.classList.add('is-dragging'); }
    const elapsed = event.timeStamp-drag.time;
    if (elapsed > 0) drag.velocity = (event.clientX-drag.last)/elapsed;
    drag.last = event.clientX; drag.time = event.timeStamp;
    const min = links[0].offsetLeft, last = box(links.at(-1)), max = last.left+last.width-drag.width;
    const left = Math.max(min,Math.min(max,drag.left+dx));
    thumb.style.left = left+'px'; thumb.style.width = drag.width+'px';
  });
  function release(event, cancelled = false) {
    if (!drag || drag.id !== event.pointerId) return;
    const d = drag; drag = null; nav.classList.remove('is-dragging');
    if (nav.hasPointerCapture(event.pointerId)) nav.releasePointerCapture(event.pointerId);
    if (!d.live) return;
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    if (cancelled) { move(selected); return; }
    const velocity = event.timeStamp-d.time < 100 ? Math.max(-2,Math.min(2,d.velocity)) : 0;
    const center = parseFloat(thumb.style.left)+d.width/2+velocity*110;
    const target = links.reduce((best,link) => {
      const a = box(best), b = box(link);
      return Math.abs(b.left+b.width/2-center) < Math.abs(a.left+a.width/2-center) ? link : best;
    });
    // Keep native anchor navigation and browser history for a drag selection.
    suppressClick = false; target.click(); suppressClick = true;
  }
  nav.addEventListener('pointerup', event => release(event));
  nav.addEventListener('pointercancel', event => release(event,true));
  nav.addEventListener('lostpointercapture', event => release(event,true));
  new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:['class']});
  new ResizeObserver(() => move(selected || links[0],true)).observe(nav);
  reduce.addEventListener('change', () => move(selected,true));
  move(links.find(link => link.classList.contains('active')) || links[0],true);
  document.fonts.ready.then(() => move(selected,true));
})();
