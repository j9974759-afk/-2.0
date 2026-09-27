import sys
sys.path.insert(0,'.tools/python')
from psd_tools import PSDImage
from pathlib import Path
import subprocess,imageio_ffmpeg
root=Path('C:/Users/21086/Desktop/我的作品集/着陆页素材')
for n in ['着陆页','转场-云']:
 p=PSDImage.open(root/(n+'.psd'))
 print(n,p.size)
 for i,l in enumerate(p): print(i,l.name,l.kind,l.bbox,l.visible)
 p.composite().save('.review/'+n+'.png')
for f in root.glob('*.webm'):
 r=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-i',str(f)],capture_output=True)
 print(f.name,r.stderr.decode('utf-8',errors='replace')[-1800:])
