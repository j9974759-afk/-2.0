(() => {
 'use strict';
 const intro=document.querySelector('.dream-intro'),stage=intro.querySelector('.dream-stage'),camera=intro.querySelector('.dream-camera');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),layers=[...camera.querySelectorAll('[data-depth]')];
 const idle=intro.querySelector('.ip-idle'),turn=intro.querySelector('.ip-turn'),ip=intro.querySelector('.landing-ip'),glow=intro.querySelector('.portal-video'),cloud=intro.querySelector('.dream-cloud-transition');
 const invitation=intro.querySelector('.dream-invitation'),topline=intro.querySelector('.dream-topline'),mist=intro.querySelector('.dream-mist'),bar=intro.querySelector('.dream-progress span');
 const hero=document.querySelector('.hero'),heroParts=[hero.querySelector('.hero-type'),hero.querySelector('.hero-character'),hero.querySelector('.hero-copy')];
 const header=document.querySelector('.header'),main=document.querySelector('main');
 new ResizeObserver(()=>document.documentElement.style.setProperty('--portfolio-nav-offset',`${header.offsetHeight+44}px`)).observe(header);
 const clamp=(v)=>Math.max(0,Math.min(1,v)),range=(p,a,b)=>clamp((p-a)/(b-a)),smooth=t=>t*t*(3-2*t);
 let pending=false,wasTurning=false,active=false,cloudTime=0,heroEntered=false,completedAt=null;
 const playPending=new WeakSet();
 const planes=layers.map(el=>({el,depth:Number(el.dataset.depth),x:parseFloat(el.style.left)||0,y:parseFloat(el.style.top)||0,ew:parseFloat(el.style.width)||100,eh:parseFloat(el.style.height)||100}));
 function play(video){if(video.paused&&!document.hidden&&!playPending.has(video)){playPending.add(video);video.play().then(()=>{if(document.hidden||!active)video.pause();}).catch(()=>{}).finally(()=>playPending.delete(video));}}
 idle.addEventListener('playing',()=>ip.classList.add('idle-ready'));
 turn.addEventListener('error',()=>ip.classList.remove('turning'));
 // Seek only after the previous seek completes, so reverse scrolling stays responsive.
 function seekCloud(){if(cloud.readyState>=1&&!cloud.seeking&&Math.abs(cloud.currentTime-cloudTime)>.035)cloud.currentTime=cloudTime;}
 cloud.addEventListener('seeked',seekCloud);
 cloud.addEventListener('loadedmetadata',schedule);
 function render(){
  pending=false;
  if(completedAt!==null&&scrollY>=completedAt&&!reduced.matches)return;
  // Read geometry together before writing animated styles.
  const introTop=intro.offsetTop,introHeight=intro.offsetHeight,vh=stage.offsetHeight;
  const w=camera.offsetWidth,h=camera.offsetHeight,cameraLeft=camera.offsetLeft,cameraTop=camera.offsetTop,stageWidth=stage.clientWidth;
  const homeStart=introTop+introHeight-(reduced.matches?0:vh);
  const docked=scrollY>=homeStart-1;
  main.style.translate='';header.style.translate='';
  header.classList.toggle('is-floating',docked);
  document.documentElement.classList.toggle('nav-floating',docked);
  stage.classList.toggle('ambient-paused',reduced.matches||document.hidden||scrollY>=introTop+(introHeight-vh)*.76);
  if(reduced.matches){layers.forEach(el=>el.style.transform='');heroParts.forEach(el=>{el.style.opacity='';el.style.transform='';});stage.classList.remove('is-complete');stage.style.background='#ccddfa';stage.style.setProperty('--scene-alpha',1);camera.style.opacity=1;invitation.style.visibility=topline.style.visibility='visible';mist.style.opacity=cloud.style.opacity=0;invitation.style.opacity=topline.style.opacity=1;[idle,turn,glow,cloud].forEach(v=>v.pause());return;}
  const p=clamp((scrollY-introTop)/(introHeight-vh));
  if(p>=.80&&!heroEntered){heroEntered=true;hero.dataset.entered='true';document.dispatchEvent(new Event('portfolio-enter'));}
  const traveling=smooth(range(p,.08,.74)),cameraScale=1+traveling*7;
  // The destination is inside the supplied door, at (1315, 410) in the PSD.
  const cx=(stageWidth/2-cameraLeft+w*(.5-.642))*traveling,cy=(vh/2-cameraTop+h*(.5-.356))*traveling;
  planes.forEach(({el,depth,x,y,ew,eh})=>{
   const scale=1+(cameraScale-1)*depth;
   const dx=((x+ew/2)/100-.642)*w*(scale-1)+cx-(el===ip?w*.20*traveling:0);
   const dy=((y+eh/2)/100-.356)*h*(scale-1)+cy;
   el.style.transform=`translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
  });
  const fade=1-smooth(range(p,.01,.17));invitation.style.opacity=fade;invitation.style.visibility=fade<.01?'hidden':'visible';
  topline.style.opacity=1-smooth(range(p,.55,.68));topline.style.visibility=p>.68?'hidden':'visible';bar.style.transform=`scaleX(${p})`;
  // Finish the cloud fade over an opaque light backing before revealing the homepage.
  const veil=smooth(range(p,.54,.69))*(1-smooth(range(p,.80,.98)));
  mist.style.opacity=veil;
  camera.style.opacity=1-smooth(range(p,.68,.76));stage.style.setProperty('--scene-alpha',camera.style.opacity);
  cloud.style.opacity=smooth(range(p,.51,.60))*(1-smooth(range(p,.69,.79)));
  cloudTime=Number.isFinite(cloud.duration)?range(p,.52,.79)*Math.max(0,cloud.duration-.04):0;seekCloud();
  // The stage itself becomes transparent, revealing the real homepage underneath.
  stage.style.background=p>.74?'transparent':'#ccddfa';
  const done=p>=.999;stage.classList.toggle('is-complete',done);
  // Hold the complete hero at the viewport top beneath the cloud curtain.
  // Release at its natural document position so continued scrolling is seamless.
  const hold=p>=.74&&p<1?Math.max(0,homeStart-scrollY):0;
  main.style.translate=hold?`0 ${-hold}px`:'';
  header.style.translate=hold&&!docked?`0 ${-hold}px`:'';
  heroParts.forEach(el=>{el.style.opacity='';el.style.transform='';});
  active=p<.8&&!document.hidden;
  const turning=p>.025&&p<.62;
  if(turning&&!wasTurning){turn.currentTime=0;play(turn);}
  if(!turning&&wasTurning){turn.pause();turn.currentTime=0;}
  ip.classList.toggle('turning',turning&&turn.readyState>=2&&!turn.error);wasTurning=turning;
  if(active){play(glow);if(!turning)play(idle);else idle.pause();}else{idle.pause();turn.pause();glow.pause();}
  completedAt=done&&docked?homeStart:null;
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(render);}}
 document.body.classList.add('landing-active');
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',()=>{completedAt=null;schedule();});document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{completedAt=null;schedule();});
 [idle,turn,glow,cloud].forEach(v=>v.addEventListener('loadeddata',schedule));
 // Native anchor navigation remains available without JavaScript.
 document.querySelectorAll('.dream-skip,.dream-invitation').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:intro.offsetTop+intro.offsetHeight-(reduced.matches?0:stage.offsetHeight),behavior:reduced.matches?'instant':'smooth'});document.querySelector('#hero-title').setAttribute('tabindex','-1');document.querySelector('#hero-title').focus({preventScroll:true});}));
 render();
})();




