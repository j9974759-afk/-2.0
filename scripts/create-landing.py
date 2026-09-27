import json
from pathlib import Path
p=Path('dist/index.html');s=p.read_text(encoding='utf-8');Path('backups/before-landing-20260924.html').write_text(s,encoding='utf-8')
layers=json.loads(Path('dist/assets/landing/layers.json').read_text(encoding='utf-8'))
html='''
  <section class="dream-intro" id="dream" aria-label="梦境之门，向下滚动进入金金的作品集">
    <div class="dream-stage">
      <div class="dream-camera" aria-hidden="true">
'''
for l in layers:
 i=l['id'];x,y,r,b=l['bbox']
 if i==0:continue
 if i==31:
  html+='<div class="portal-light" data-depth="1" style="left:59%;top:14%;width:11%;height:44%"></div>\n'
  html+='<video class="landing-layer portal-video" data-depth="1" style="inset:0;width:100%;height:100%" src="assets/landing/portal-glow.webm" muted playsinline loop preload="auto"></video>\n'
 if i==34:
  # Fit the visible character (video alpha bounds 364,144 to 1068,1300) to the PSD character.
  html+='''<div class="landing-layer landing-ip" data-depth="1.17" style="left:37.939%;top:27.17%;width:28.516%;height:61.545%">
    <img class="ip-poster" src="assets/landing/layer-34.webp" alt="">
    <video class="ip-idle" src="assets/landing/ip-idle.webm" muted playsinline loop preload="auto"></video>
    <video class="ip-turn" src="assets/landing/ip-turn.webm" muted playsinline preload="auto"></video>
  </div>''';continue
 depth=.2 if i==1 else (.52 if i in [2,3,4,8,11,13,19,30] else (1.28 if i in [5,6,7,20,21,23,24,25,26] else (1 if i in [31,32] else 1.12)))
 html+=f'<img class="landing-layer layer-{i}" data-depth="{depth}" src="assets/landing/{l["file"]}" alt="" style="left:{x/2048*100:.4f}%;top:{y/1152*100:.4f}%;width:{(r-x)/2048*100:.4f}%;height:{(b-y)/1152*100:.4f}%"'+(' fetchpriority="high"' if i==1 else '')+'>\n'
html+='''</div>
      <div class="dream-mist" aria-hidden="true"></div>
      <video class="dream-cloud-transition" src="assets/landing/cloud-transition.webm" muted playsinline preload="auto" aria-hidden="true"></video>
      <div class="dream-topline"><a href="#dream" class="dream-signature">JinJin <span>Portfolio</span></a><a class="dream-skip" href="#home">跳过开场 ↗</a></div>
      <a class="dream-invitation" href="#home"><span class="dream-overline">A LITTLE DREAM BY JINJIN</span><h1>Scroll to enter<br class="mobile-break"> my world.</h1><span class="dream-caption">滚动，进入我的世界</span><span class="dream-scroll-line" aria-hidden="true"></span></a>
      <div class="dream-progress" aria-hidden="true"><span></span></div>
    </div>
  </section>
'''
s=s.replace('  <header class="header">',html+'  <header class="header">')
s=s.replace('</head>','  <link rel="stylesheet" href="landing.css"><script defer src="landing.js"></script>\n</head>')
p.write_text(s,encoding='utf-8')
