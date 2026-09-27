from pathlib import Path
from PIL import Image
import re,json
root=Path('dist'); files=list(root.glob('*.html'))+list(root.glob('*.css'))+list(root.glob('*.js'))
refs=set()
for p in files:
 refs.update(re.findall(r'assets/([\w-]+\.png)',p.read_text(encoding='utf-8')))
refs.update(f'project-{i}.png' for i in range(1,5))
rows=[]
for name in sorted(refs):
 source=root/'assets'/name
 if not source.exists(): continue
 target=source.with_suffix('.webp')
 with Image.open(source) as im:
  im.save(target,'WEBP',quality=88,method=6)
 rows.append({'file':name,'before':source.stat().st_size,'after':target.stat().st_size})
for p in files:
 s=p.read_text(encoding='utf-8')
 for name in refs:s=s.replace('assets/'+name,'assets/'+name.replace('.png','.webp'))
 s=s.replace('assets/project-${p.image}.png','assets/project-${p.image}.webp')
 p.write_text(s,encoding='utf-8')
Path('.review/image-optimization.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
print(json.dumps({'images':len(rows),'before':sum(r['before'] for r in rows),'after':sum(r['after'] for r in rows)}))
