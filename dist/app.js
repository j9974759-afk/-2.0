const projects = {
  alipay: { title:'支付宝内容视频动效', type:'交互动效 / UI 动效 / 研发交付', image:1, intro:'围绕支付宝内容视频业务，将动效融入用户从发现内容到观看、互动与获得奖励的体验。', responsibilities:['视频栏目底部导航与 Tabbar 动效，强化视频入口的视觉引导。','激励弹窗、悬浮组件与常驻入口动效，反馈任务进度和奖励状态。','高保真交互演示，标注缓动曲线、时长参数与速度阈值。','Lottie 动效交付与低端机型渲染性能优化。'], videos:[['portfolio/alipay-study-02.mp4','支付宝 · 作品 2（临摹）'],['portfolio/alipay-tabbar.webm','支付宝 · Tabbar 动效']], note:'以上为支付宝项目动效作品，封面为作品集视觉展示。' },
  medical: { title:'医疗科普动画系列', type:'科普动画 / 项目统筹 / 后期合成', image:2, intro:'用清晰的叙事和生动的动画，帮助观众理解专业的医疗健康知识。承担从需求沟通到成片输出的全流程统筹与制作。', responsibilities:['独立对接客户需求，制定动画方案。','统筹脚本、分镜、插画、动画的质量审核与制作进度。','主导后期合成与成片输出。','任职期间公司获南方健康科普大赛「金虹奖」动画类奖项共 9 项，其中 4 项由本人主导完成。'], videos:[['portfolio/medical-01-web.mp4','医疗动画 01'],['portfolio/medical-montage-web.mp4','医疗动画合集混剪']], note:'以上为医疗科普项目合集，封面为作品集视觉展示。' },
  palace: { title:'《宫廷大宝贝》IP 动画', type:'IP 动画 / 短视频 / 视觉特效', image:3, intro:'通过动画短视频，让宫廷文化以轻松、有趣的方式进入日常。参与脚本构思、画面设计与特效制作全流程。', responsibilities:['参与动画短片的脚本构思、画面设计与特效制作。','从 0 起步运营账号，粉丝量增长至 103.5 万。','累计制作动画视频百余个，其中 80+ 条点赞量过万。'], videos:[['portfolio/palace-01-web.mp4','宫廷大宝贝 · 作品 01'],['portfolio/palace-02-web.mp4','宫廷大宝贝 · 作品 02']], note:'以上为原始项目成片，封面为作品集视觉展示。' },
  course: { title:'课程动画短片', type:'教育动画 / 角色绑定 / MG 动画', image:4, intro:'围绕小班课程的学习场景，用角色表演与动态叙事让引导、预习和教学内容更生动。', responsibilities:['课程引导视频、预习视频的角色绑定与动画短片创作。','与分镜团队配合，根据脚本完成角色动画及镜头设计。','成长中心：视频抠像、剪辑、包装与合成。','优享课：课程宣传片及教学视频的 MG 动画全流程制作。','小熊艺术：IP 形象动画片头。'], videos:[], note:'此处展示项目视觉封面与职责说明。' }
};
const dialog=document.querySelector('#project-dialog');
const detail=document.querySelector('#project-detail');
let opener;
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
 const p=projects[button.dataset.project];opener=button;
 detail.innerHTML=`<img class="detail-image" src="assets/project-${p.image}.webp" alt="${p.title}视觉封面"><div class="detail-body"><p class="detail-label">${p.type}</p><h2 id="detail-title">${p.title}</h2><p>${p.intro}</p><h3>我的工作</h3><ul>${p.responsibilities.map(item=>`<li>${item}</li>`).join('')}</ul>${p.videos.length?'<h3>作品播放</h3>':''}${p.videos.map(([src,label])=>`<figure class="work-video-card"><div class="work-video-frame"><video controls playsinline preload="none" aria-label="${label}"><source src="assets/${src}" type="${src.endsWith('.webm')?'video/webm':'video/mp4'}">你的浏览器无法播放此视频，可<a href="assets/${src}">打开原视频</a>。</video></div><figcaption class="video-caption">${label}</figcaption></figure>`).join('')}<p class="detail-footer">${p.note}</p><a class="detail-contact" href="mailto:13161775503@163.com">想了解更多？邮件联系我 <span>↗</span></a></div>`;
 dialog.showModal();dialog.scrollTop=0;document.body.classList.add('modal-open');
 detail.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{detail.querySelectorAll('video').forEach(other=>{if(other!==video)other.pause()})}));
}));
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('close',()=>{detail.querySelectorAll('video').forEach(v=>v.pause());detail.innerHTML='';document.body.classList.remove('modal-open');opener?.focus()});
let toastTimer;
const toast=document.querySelector('.toast');
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
 let message;try{await navigator.clipboard.writeText(button.dataset.copy);message='微信号已复制：'+button.dataset.copy}catch{message='微信号：'+button.dataset.copy+'（可手动复制）'}
 toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),4000);
}));
const links=[...document.querySelectorAll('.nav a')];
const observer=new IntersectionObserver(entries=>{if(document.querySelector('.nav').dataset.navigationTarget)return;entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(link=>{const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}})},{rootMargin:'-15% 0px -65% 0px',threshold:0});
document.querySelectorAll('main section[id]').forEach(section=>observer.observe(section));
