from pathlib import Path
from datetime import datetime
import re,shutil,zipfile,json
root=Path('dist').resolve()
release=Path('release')/('jinjin-portfolio-'+datetime.now().strftime('%Y%m%d-%H%M%S'))
release.mkdir(parents=True,exist_ok=False)
queue=['index.html'];seen=set()
# These filenames are assembled dynamically in the page scripts.
app=(root/'app.js').read_text(encoding='utf-8')
queue += ['assets/'+x for x in re.findall(r"'((?:portfolio/)[^']+\.(?:mp4|webm))'",app)]
queue += [f'assets/project-{i}.webp' for i in range(1,5)]
queue += [f'assets/motion/preview-{name}-web.mp4' for name in ['alipay','medical','palace','course']]
queue += [f'assets/motion/character-{name}.webm' for name in ['home','works','skills','contact']]
while queue:
 name=queue.pop().split('?')[0].split('#')[0]
 if not name or name in seen:continue
 source=(root/name).resolve()
 if not source.is_relative_to(root) or not source.is_file():raise RuntimeError('Missing asset: '+name)
 if source.stat().st_size>25*1024*1024:raise RuntimeError('Over 25 MiB: '+name)
 seen.add(name)
 dest=release/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest)
 if source.suffix in ['.html','.css','.js']:
  text=source.read_text(encoding='utf-8')
  refs=re.findall(r'(?:src|href)=[\"\x27]([^\"\x27]+)',text)+re.findall(r'url\(\s*[\"\x27]?([^\"\x27\s)]+)',text)
  for ref in refs:
   if re.match(r'^(?:[a-z]+:|//|#)',ref) or '${' in ref:continue
   queue.append((Path(name).parent/ref).as_posix())
manifest=[{'path':name,'bytes':(root/name).stat().st_size} for name in sorted(seen)]
archive=release.with_suffix('.zip')
with zipfile.ZipFile(archive,'w') as z:
 for name in sorted(seen):z.write(release/name,name,compress_type=zipfile.ZIP_STORED if Path(name).suffix in ['.mp4','.webm','.webp'] else zipfile.ZIP_DEFLATED)
with zipfile.ZipFile(archive) as z:
 assert 'index.html' in z.namelist() and z.testzip() is None
report={'folder':str(release.resolve()),'zip':str(archive.resolve()),'files':len(seen),'bytes':sum(x['bytes'] for x in manifest),'largest':max(manifest,key=lambda x:x['bytes']),'manifest':manifest}
Path('release/latest-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
Path('release/发布说明.txt').write_text('上传同目录中的 ZIP，或上传解压后含 index.html 的文件夹。ZIP 根目录就是网站首页，不需要构建或运行 Node。\n发布包仅含正在引用的页面资源；原始视频、备份、工具、审查截图均未包含。\n所有文件小于 25 MiB。不要上传本说明和 latest-manifest.json。\n此包为当前版本快照，后续修改网站后请重新运行 scripts/package-release.py。\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='manifest'},ensure_ascii=False,indent=2))
