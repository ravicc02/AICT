from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
root = Path(__file__).resolve().parent.parent
source = root / 'artifacts/font-source/NotoSansSC.ttf'
text = ''.join(p.read_text(encoding='utf-8') for p in (root/'src').rglob('*') if p.suffix in ['.tsx','.ts','.css'])
text += ''.join(chr(i) for i in range(32,127)) + '有想法去创造预约作品课程方案星球编队'
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
font = TTFont(source)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
font.flavor='woff2'
target=root/'public/fonts/camp-sans.woff2'
font.save(target)
print(f'Font subset: {len(set(text))} characters, {target.stat().st_size} bytes')
