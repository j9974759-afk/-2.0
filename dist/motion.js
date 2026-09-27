(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const hero=document.querySelector('.hero'),controllers=[];
 const canMove=()=>!reduced.matches&&!document.hidden;
 const animate=(el,frames,options={})=>canMove()?el.animate(frames,{duration:650,easing:'cubic-bezier(.2,.75,.25,1)',...options}):null;
 function guide(selector){
  const img=document.querySelector(selector),box=document.createElement('div');
  box.className=img.classList.contains('hero-character')?'hero-character motion-character':img.classList.contains('works-character')?'works-character motion-character':'motion-character';
  if(img.alt){box.setAttribute('role','img');box.setAttribute('aria-label',img.alt);img.alt='';}
  img.classList.remove('hero-character','works-character');img.before(box);box.append(img);return box;
 } const heroGuide=guide('.hero-character','idle',true),skillsGuide=guide('.skills-visual img','skills'),contactGuide=guide('.contact-portrait img','contact');
 heroGuide.classList.add('hero-guide');skillsGuide.classList.add('skills-guide');contactGuide.classList.add('contact-guide');
 guide('.works-character').classList.add('works-guide');
 const environment=document.createElement('div');environment.className='dream-environment';environment.setAttribute('aria-hidden','true');
 environment.innerHTML='<i class="dream-cloud cloud-one"></i><i class="dream-cloud cloud-two"></i>'+[0,1,2].map(i=>`<i class="dream-bubble bubble-${i}"></i>`).join('')+'<i class="dream-star star-one">✦</i><i class="dream-star star-two">✦</i>';hero.append(environment);
 const parallax=[[hero,2],[environment,5],[hero.querySelector('.hero-play'),5],[hero.querySelector('.hero-audio'),5],...Array.from(environment.querySelectorAll('.dream-bubble')).map(el=>[el,15])];
 hero.addEventListener('pointermove',e=>{if(!fine.matches||!canMove()||e.pointerType==='touch')return;const r=hero.getBoundingClientRect(),x=((e.clientX-r.left)/r.width-.5)*2,y=((e.clientY-r.top)/r.height-.5)*2;parallax.forEach(([el,d])=>{el.style.setProperty('--mx',`${x*d}px`);el.style.setProperty('--my',`${y*d}px`);});});
 const resetParallax=()=>parallax.forEach(([el])=>{el.style.removeProperty('--mx');el.style.removeProperty('--my');});hero.addEventListener('pointerleave',resetParallax);window.addEventListener('blur',resetParallax);
 new IntersectionObserver(([e])=>hero.classList.toggle('scene-paused',!e.isIntersecting)).observe(hero);
 document.querySelectorAll('.project-card').forEach(card=>{
  const source=`assets/motion/preview-${card.dataset.project}-web.mp4`,surface=card.querySelector('.project-image'),video=document.createElement('video');
  video.className='project-preview';video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');surface.append(video);
  let badge=card.querySelector('.video-badge');if(!badge){badge=document.createElement('span');badge.className='video-badge';badge.textContent='▶ 动态预览';card.querySelector('.project-open').replaceWith(badge);}const original=badge.textContent;
  let hovered=false,focused=false,visible=false,token=0,finished=false;
  function stop(){token++;video.pause();card.classList.remove('previewing');badge.textContent=original;}
  function start(){if(!canMove()||!visible||document.querySelector('#project-dialog').open||finished)return;const attempt=++token;if(!video.getAttribute('src'))video.src=source;video.currentTime=0;video.play().then(()=>{if(attempt!==token||!canMove()||!(hovered||focused)){video.pause();return;}card.classList.add('previewing');badge.textContent='▶ 预览中 · 点击查看';}).catch(()=>{if(attempt===token)stop();});}
  const sync=()=>{if((hovered||focused)&&canMove()&&visible)start();else stop();};
  card.addEventListener('pointerenter',e=>{if(!fine.matches||e.pointerType==='touch')return;hovered=true;finished=false;start();});card.addEventListener('pointerleave',()=>{hovered=false;if(!focused)stop();});
  card.addEventListener('focus',()=>{focused=true;finished=false;start();});card.addEventListener('blur',()=>{focused=false;if(!hovered)stop();});card.addEventListener('click',()=>{finished=true;stop();});
  video.addEventListener('timeupdate',()=>{if(video.currentTime>=5){finished=true;stop();}});video.addEventListener('ended',()=>{finished=true;stop();});video.addEventListener('error',stop);
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(!visible)stop();else if(hovered||focused)start();}).observe(card);controllers.push(sync);
 });
 document.querySelectorAll('.skill-icon').forEach(img=>{const name=img.getAttribute('src').match(/icon-(\w+)/)?.[1];img.closest('.skill-card').classList.add(`micro-${name}`);});
 const contactButton=document.querySelector('.contact-copy .button');
 // The supplied clips have baked-in eyes; acknowledge with a gentle whole-character lean.
 contactButton.addEventListener('pointerenter',()=>{if(fine.matches&&canMove())contactGuide.classList.add('acknowledge');});contactButton.addEventListener('pointerleave',()=>contactGuide.classList.remove('acknowledge'));
 contactButton.addEventListener('focus',()=>{if(canMove())contactGuide.classList.add('acknowledge');});contactButton.addEventListener('blur',()=>contactGuide.classList.remove('acknowledge'));
 contactButton.addEventListener('click',()=>{animate(contactGuide,[{translate:'0 0',rotate:'0deg'},{translate:'0 -12px',rotate:'-3deg'},{translate:'0 0',rotate:'0deg'}]);if(!canMove())return;const ring=document.createElement('i');ring.className='contact-ripple';ring.setAttribute('aria-hidden','true');contactButton.append(ring);ring.addEventListener('animationend',()=>ring.remove(),{once:true});});
 const sync=()=>{document.body.classList.toggle('motion-paused',document.hidden);if(reduced.matches){resetParallax();document.querySelectorAll('.scene-reveal').forEach(el=>el.classList.add('is-visible'));document.getAnimations().forEach(a=>a.cancel());contactGuide.classList.remove('acknowledge');}controllers.forEach(fn=>fn());};
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
})();



// Anchor the visible character edge, excluding the PNG's transparent bottom margin.
(() => {
 const character=document.querySelector('.works-character'),card=document.querySelector('.project-third'),grid=document.querySelector('.projects-grid');
 function align(){
  const mobile=matchMedia('(max-width:600px)').matches;
  const angle=mobile?0:-2*Math.PI/180;
  character.style.left=`${card.offsetLeft+card.offsetWidth*.84-character.offsetWidth/2}px`;
  character.style.right="auto";
  const center=character.offsetLeft+character.offsetWidth/2;
  const edge=card.offsetTop+card.offsetHeight/2*(1-Math.cos(angle))+(center-card.offsetLeft-card.offsetWidth/2)*Math.sin(angle);
  character.style.top=`${edge-character.offsetHeight*(1478/1536)+14}px`;
  const heart=grid.querySelector('.works-heart'),star=grid.querySelector('.works-star');
  const x=character.offsetLeft,y=parseFloat(character.style.top),w=character.offsetWidth,h=character.offsetHeight;
  heart.style.left=`${x+w*.18}px`;heart.style.top=`${y+h*.18}px`;heart.style.right='auto';
  // Keep the star in open space above the cards, including their hover spread.
  const rightCard=grid.querySelector('.project-fourth');
  star.style.left=`${mobile?grid.clientWidth*.12:rightCard.offsetLeft+rightCard.offsetWidth*.5-star.offsetWidth/2}px`;
  star.style.top=`${mobile?card.offsetTop-105:rightCard.offsetTop-star.offsetHeight-55}px`;
  star.style.right='auto';
 }
 const observer=new ResizeObserver(align);[grid,card,character].forEach(el=>observer.observe(el));
 character.addEventListener('load',align);window.addEventListener('resize',align);align();
})();


// Align the artwork's visible bottom, accounting for transparent PNG padding.
(() => {
 const hero=document.querySelector('.hero'),character=document.querySelector('.hero-character');
 const align=()=>{character.style.bottom=`${-character.offsetWidth*(1-1904/2048)}px`;};
 const observer=new ResizeObserver(align);observer.observe(hero);observer.observe(character);align();
})();




