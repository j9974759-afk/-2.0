(() => {
 'use strict';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width: 800px) and (pointer: fine)');
 const ease='cubic-bezier(.16,1,.3,1)',running=new Set(),prepared=new Map(),sectionStart=new Map();
 function words(el){
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim()){fragment.append(document.createTextNode(word));return;}const mask=document.createElement('span'),inner=document.createElement('span');mask.className='editorial-word-mask';inner.className='editorial-word';inner.textContent=word;mask.append(inner);fragment.append(mask);});node.replaceWith(fragment);});
  return [...el.querySelectorAll('.editorial-word')];
 }
 const invitation=document.querySelector('.dream-invitation h1');
 const openingWords=words(invitation),overlineWords=words(document.querySelector('.dream-overline'));
 const titles=[...document.querySelectorAll('.section-heading .eyebrow,.contact-word')];
 const titleWords=new Map(titles.map(el=>[el,words(el)]));
 const wordFrames=[{transform:'translateY(115%) scaleY(.62) skewY(6deg)'},{transform:'translateY(0) scaleY(1) skewY(0deg)'}];
 function motion(el,frames,{delay=0,duration=1500,paused=false,easing=ease}={}){
  if(reduce.matches)return null;
  const animation=el.animate(frames,{duration,delay,easing,fill:'both'});
  running.add(animation);
  if(paused)animation.pause();
  animation.onfinish=()=>{animation.cancel();running.delete(animation);el.classList.remove('editorial-entering');};
  return animation;
 }
 // No loading gate: users can scroll or skip while the opening plays.
 if(!reduce.matches&&scrollY<innerHeight*.5&&!location.hash){
  motion(document.querySelector('.dream-camera'),[{scale:'1.13'},{scale:'1'}],{duration:2300,delay:100});
  overlineWords.forEach((word,i)=>motion(word,wordFrames,{duration:1650,delay:350+i*95}));
  openingWords.forEach((word,i)=>motion(word,wordFrames,{duration:1650,delay:600+i*95}));
  motion(document.querySelector('.dream-topline'),[{translate:'0 -70px'},{translate:'0 0'}],{duration:1500,delay:650});
  motion(document.querySelector('.dream-caption'),[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],{duration:1450,delay:1200});
 }

 // Prepare layers before the cloud transition reveals the homepage.
 const heroSequence=[
  ['.hero-type>span:first-child',0,190,1700],
  ['.hero-type>span:last-child',160,190,1700],
  ['.hero-play',360,95,1450],
  ['.hero-audio',500,95,1450],
  ['.hero-character',650,145,1700],
  ['.hero h1',820,60,1300],
  ['.hero-description',950,45,1250],
  ['.hero-actions>.button:first-child',1080,38,1200],
  ['.hero-actions>.button:last-child',1240,38,1200],
  ['.hero-heart',1180,55,1300],
  ['.hero-note',1280,40,1250],
 ];
 const heroAnimations=heroSequence.map(([selector,delay,distance,duration])=>{
  const el=document.querySelector(selector);
  if(!el)return null;
  return motion(el,[{opacity:0,translate:'0 '+distance+'px'},{opacity:1,translate:'0 0'}],{duration,delay,paused:true});
 }).filter(Boolean);
 let heroPlayed=false;
 function enterHero(){
  if(heroPlayed||reduce.matches)return;
  heroPlayed=true;
  heroAnimations.forEach(animation=>animation.play());
 }
 document.addEventListener('portfolio-enter',enterHero,{once:true});
 if(document.querySelector('.hero').dataset.entered)enterHero();
 function prepare(el,frames,duration=1500){const a=motion(el,frames,{duration,paused:true});if(a){prepared.set(el,[a]);el.classList.add('editorial-entering');}}
 titles.forEach(el=>{const list=titleWords.get(el).map((word,i)=>motion(word,wordFrames,{duration:1650,delay:i*110,paused:true})).filter(Boolean);prepared.set(el,list);});
 const sectionFor=el=>el.closest('.section,.contact');
 const titleObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const section=sectionFor(e.target);if(!sectionStart.has(section))sectionStart.set(section,performance.now());(prepared.get(e.target)||[]).forEach(a=>a.play());prepared.delete(e.target);titleObserver.unobserve(e.target);}),{rootMargin:'0px 0px -12% 0px',threshold:0});
 titles.forEach(el=>titleObserver.observe(el));
 const cards=[...document.querySelectorAll('.profile,.skill-card,.contact-copy')];
 cards.forEach(el=>prepare(el,[{translate:'0 105px',clipPath:'inset(0 0 100% 0)'},{translate:'0 0',clipPath:'inset(0 0 0% 0)'}],1550));
 const detailTargets=[...document.querySelectorAll('.section-heading h2,.subheading')];
 detailTargets.forEach(el=>prepare(el,[{translate:'0 40px',clipPath:'inset(0 0 100% 0)'},{translate:'0 0',clipPath:'inset(0 0 0 0)'}],1200));
 const surfaces=[...document.querySelectorAll('.project-image,.profile-portrait')];
 surfaces.filter(el=>!el.classList.contains('project-image')).forEach(el=>prepare(el,[{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)'}],1700));
 const contentObserver=new IntersectionObserver(entries=>{
  const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
  visible.forEach((entry,index)=>{
   const el=entry.target,section=sectionFor(el),start=sectionStart.get(section);
   // A shared section clock lets its headline lead; later rows enter as they arrive.
   if(start===undefined){sectionStart.set(section,performance.now());const title=section?.querySelector('.eyebrow,.contact-word');(prepared.get(title)||[]).forEach(a=>a.play());prepared.delete(title);if(title)titleObserver.unobserve(title);}
   const lead=Math.max(0,520-(performance.now()-(sectionStart.get(section)||0)));
   (prepared.get(el)||[]).forEach(a=>{a.effect.updateTiming({delay:lead+Math.min(index,3)*150+(el.classList.contains('project-image')?160:0)});a.play();});
   prepared.delete(el);contentObserver.unobserve(el);
  });
 },{rootMargin:'0px 0px -6% 0px',threshold:0});
 [...cards,...detailTargets,...surfaces.filter(el=>!el.classList.contains('project-image'))].forEach(el=>contentObserver.observe(el));
 // Animate each complete project card, without masking its cover image.
 const projectCards=[...document.querySelectorAll('.project-card')];
 // Sample BounceCards' elastic.out(1, .5) curve for the native animation API.
 const bounceFrames=Array.from({length:81},(_,i)=>{
  const t=i/80;
  const scale=t===0?0:t===1?1:1+Math.pow(2,-10*t)*Math.sin((t-.125)*4*Math.PI);
  return {scale:String(scale),offset:t};
 });
 projectCards.forEach(el=>{
  const animation=motion(el,bounceFrames,{duration:1200,paused:true,easing:'linear'});
  if(animation){prepared.set(el,[animation]);el.classList.add('editorial-entering');}
 });
 let nextProjectStart=0;
 const projectObserver=new IntersectionObserver(entries=>{
  const visible=entries.filter(entry=>entry.isIntersecting);
  if(!visible.length)return;
  // The desktop collage shares one sequence; mobile cards wait until visible.
  const targets=matchMedia('(min-width:601px)').matches?projectCards:visible.map(entry=>entry.target);
  const now=performance.now();
  targets.forEach(el=>{
   const animations=prepared.get(el);
   if(!animations)return;
   const section=sectionFor(el),sectionTime=sectionStart.get(section);
   const lead=sectionTime===undefined?180:Math.max(0,520-(now-sectionTime));
   const start=Math.max(now+lead,nextProjectStart);
   animations.forEach(a=>{a.effect.updateTiming({delay:start-now});a.play();});
   nextProjectStart=start+80;
   prepared.delete(el);projectObserver.unobserve(el);
  });
 },{rootMargin:'0px 0px -6% 0px',threshold:0});
 projectCards.forEach(el=>projectObserver.observe(el));
 // Small, damped image travel; only visible image surfaces participate.
 const visibleImages=new Set(),positions=new Map();let frame=0;
 const parallaxObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)visibleImages.add(e.target);else visibleImages.delete(e.target);});schedule();},{rootMargin:'80px'});
 surfaces.forEach(el=>parallaxObserver.observe(el));
 function tick(){frame=0;if(reduce.matches||!desktop.matches||document.hidden)return;let moving=false;
  const measurements=[...visibleImages].map(el=>[el,el.getBoundingClientRect()]);
  measurements.forEach(([el,rect])=>{const img=el.querySelector('img');if(!img)return;const target=Math.max(-12,Math.min(12,((innerHeight/2-rect.top-rect.height/2)/innerHeight)*25));const old=positions.get(el)||0,next=old+(target-old)*.085;positions.set(el,next);img.style.translate=`0 ${next.toFixed(2)}px`;img.style.scale='1.08';if(Math.abs(target-next)>.08)moving=true;});
  if(moving)frame=requestAnimationFrame(tick);
 }
 function schedule(){if(!frame&&visibleImages.size&&!reduce.matches&&desktop.matches&&!document.hidden)frame=requestAnimationFrame(tick);}
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
 function finishAll(){running.forEach(a=>{a.finish();});prepared.clear();}
 document.addEventListener('focusin',e=>{running.forEach(a=>{const el=a.effect.target;if(el===e.target||el.contains(e.target))a.finish();});});
 reduce.addEventListener('change',()=>{if(reduce.matches)finishAll();resetParallax();});
 function resetParallax(){surfaces.forEach(el=>{const img=el.querySelector('img');if(img){img.style.translate='';img.style.scale='';}});positions.clear();schedule();}
 desktop.addEventListener('change',resetParallax);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){running.forEach(a=>{if(a.playState==='running'){a.pause();a.wasPlaying=true;}});}else{running.forEach(a=>{if(a.wasPlaying){a.wasPlaying=false;a.play();}});schedule();}});
 window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);});
})();
