import sys,json,shutil,subprocess
sys.path.insert(0,'.tools/python')
from psd_tools import PSDImage
from PIL import Image,ImageDraw
import imageio_ffmpeg
from pathlib import Path
src=Path('C:/Users/21086/Desktop/我的作品集/着陆页素材');out=Path('dist/assets/landing');out.mkdir(exist_ok=True)
p=PSDImage.open(src/'着陆页.psd');meta=[]
for i,l in enumerate(p):
 if i>=36:continue
 im=l.composite();im.save(out/f'layer-{i}.webp',quality=91)
 meta.append({'id':i,'name':l.name,'bbox':list(l.bbox),'file':f'layer-{i}.webp'})
(out/'layers.json').write_text(json.dumps(meta,ensure_ascii=False),encoding='utf-8')
for a,b in [('IP Idle.webm','ip-idle.webm'),('IP 回头.webm','ip-turn.webm'),('门内部 Glow.webm','portal-glow.webm'),('云-转场.webm','cloud-transition.webm')]:
 shutil.copyfile(src/a,out/b)
 subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-y','-c:v','libvpx-vp9','-i',str(src/a),'-frames:v','1',str(out/(b+'.png'))],capture_output=True,check=True)
 im=Image.open(out/(b+'.png'));print(b,im.size,im.getbbox())
 im.thumbnail((600,400));im.save('.review/'+b+'.png')
thumb=Image.new('RGB',(800,((len(meta)+3)//4)*145),'#ccc')
d=ImageDraw.Draw(thumb)
for j,m in enumerate(meta):
 im=Image.open(out/m['file']);im.thumbnail((195,115));x=(j%4)*200;y=(j//4)*145;thumb.paste(im,(x,y),im if im.mode=='RGBA' else None);d.text((x,y+117),str(m['id']),fill='black')
thumb.save('.review/layers.jpg')
