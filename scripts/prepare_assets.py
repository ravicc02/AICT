from pathlib import Path
from PIL import Image, ImageOps
import json, urllib.request
root=Path(__file__).resolve().parents[1]
source=root/'docs/assets/references'
out=root/'public/images'
out.mkdir(parents=True,exist_ok=True)
manifest=[]
def quad(name,file,points,display_width,size):
    im=Image.open(source/file).convert('RGB')
    ratio=im.width/display_width
    # Pillow QUAD order: upper-left, lower-left, lower-right, upper-right.
    tl,tr,br,bl=points
    data=tuple(v*ratio for p in [tl,bl,br,tr] for v in p)
    im=im.transform(size,Image.Transform.QUAD,data,Image.Resampling.BICUBIC)
    im.save(out/(name+'.webp'),'WEBP',quality=90)
    manifest.append({'asset':name+'.webp','source':file,'operation':'crop and perspective correction','sourcePoints':points})
quad('caravan','workwall-items-content-reference.png',[(28,30),(462,27),(463,352),(30,354)],2048,(650,488))
quad('fencing','workwall-items-content-reference.png',[(535,32),(969,39),(964,354),(529,349)],2048,(650,475))
quad('mech','work-detail-content-reference.png',[(980,198),(1918,217),(1903,899),(966,880)],2048,(1100,800))
quad('racing','workwall-items-content-reference.png',[(1533,40),(1960,34),(1963,352),(1535,356)],2048,(650,488))
quad('maze','workwall-items-content-reference.png',[(27,725),(455,713),(462,945),(34,945)],2048,(650,350))
quad('formation','workwall-items-content-reference.png',[(538,714),(968,720),(964,945),(536,945)],2048,(650,350))
quad('process-idea','work-process-content-reference.png',[(59,548),(296,545),(298,722),(62,725)],2048,(480,350))
quad('process-frame','work-process-content-reference.png',[(379,575),(616,576),(613,753),(377,752)],2048,(650,488))
quad('process-character','work-process-content-reference.png',[(691,548),(926,548),(925,722),(692,722)],2048,(650,480))
quad('process-update','work-process-content-reference.png',[(1003,579),(1238,578),(1239,752),(1006,753)],2048,(650,480))
quad('process-play','work-process-content-reference.png',[(1321,546),(1555,549),(1553,721),(1320,721)],2048,(650,480))
quad('process-rules','work-process-content-reference.png',[(1633,577),(1868,578),(1868,751),(1635,752)],2048,(650,480))
(out/'provenance.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
font_dir=root/'artifacts/font-source'
font_dir.mkdir(parents=True,exist_ok=True)
font=font_dir/'NotoSansSC.ttf'
if not font.exists():
    urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf',font)
license=root/'public/fonts/OFL.txt'
if not license.exists():
    urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt',license)
print('Prepared',len(manifest),'reference crops; font source ready.')
