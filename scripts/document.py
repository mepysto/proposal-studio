"""Document extraction and PDF QA. Never executes embedded document content."""
import sys, json, pathlib, subprocess, shutil, re
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw
import pdfplumber
import logging
logging.getLogger("pdfminer").setLevel(logging.ERROR)

def inspect_pdf(path, limit=None, full_fonts=False):
    reader = PdfReader(path)
    pages = reader.pages if limit is None else reader.pages[:limit]
    texts = [p.extract_text() or '' for p in pages]
    fonts = set(); colors = {}; sizes = {}
    with pdfplumber.open(path) as pdf:
        for p in pdf.pages if full_fonts else pdf.pages[:min(len(pdf.pages), 6)]:
            for c in p.chars:
                fonts.add(c.get('fontname','unknown'))
                s = str(round(c['size'],1)); sizes[s] = sizes.get(s,0)+1
                color = str(c.get('non_stroking_color')); colors[color] = colors.get(color,0)+1
    return {'pages':len(reader.pages), 'text':'\n\n'.join(texts), 'pageTexts':texts, 'imageBased':sum(len(t.strip())<30 for t in texts), 'fonts':sorted(fonts), 'fontSizes':sorted(sizes.items(),key=lambda x:-x[1])[:10], 'colors': sorted(colors.items(),key=lambda x:-x[1])[:12], 'dimensions':[[float(p.mediabox.width),float(p.mediabox.height)] for p in pages]}

mode, source = sys.argv[1:3]
if mode == 'extract':
    print(json.dumps(inspect_pdf(source),ensure_ascii=False))
elif mode == 'reference':
    out=pathlib.Path(sys.argv[3]); out.mkdir(parents=True,exist_ok=True)
    files=sorted(pathlib.Path(source).glob('*.pdf'))
    chosen=[]
    for pattern in ['AI스마트도시','Edge-AI','시장님보고용']:
        import unicodedata
        matches=[p for p in files if pattern in unicodedata.normalize('NFC',p.name)]
        if matches: chosen.append(matches[0])
    reports=[]
    for i,p in enumerate(chosen):
        data=inspect_pdf(p,3); data['path']=str(p.resolve()); data['role']='design-reference'; reports.append(data)
        subprocess.run(['pdftoppm','-f','1','-l','2','-scale-to','900','-png',str(p),str(out/f'ref-{i+1}')],check=True,stdout=subprocess.DEVNULL)
    (out/'analysis.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
    print(json.dumps([{'path':r['path'],'pages':r['pages'],'fonts':r['fonts'][:8]} for r in reports],ensure_ascii=False))
elif mode == 'verify':
    out=pathlib.Path(sys.argv[3]); expected=int(sys.argv[4]); out.mkdir(parents=True,exist_ok=True)
    data=inspect_pdf(source,full_fonts=True)
    subprocess.run(['pdftoppm','-scale-to','1600','-png',source,str(out/'slide')],check=True)
    paths=sorted(out.glob('slide-*.png'))
    sheet=Image.new('RGB',(1000,310*((len(paths)+1)//2)), '#e5e7eb'); draw=ImageDraw.Draw(sheet)
    for i,p in enumerate(paths):
        im=Image.open(p).convert('RGB'); im.thumbnail((480,270)); x=10+(i%2)*500; y=10+(i//2)*310
        sheet.paste(im,(x,y)); draw.text((x,y+275),f'SLIDE {i+1:02}',fill='#182331')
    sheet.save(out/'contact-sheet.png')
    blank=[i+1 for i,p in enumerate(paths) if Image.open(p).convert('L').getextrema()[0]>245]
    issues=[]
    if data['pages']!=expected or len(paths)!=expected: issues.append('page-count-mismatch')
    if blank: issues.append('blank-pages')
    if any('\ufffd' in t for t in [data['text']]): issues.append('replacement-glyph')
    print(json.dumps({'pages':data['pages'],'rendered':len(paths),'blankPages':blank,'fonts':data['fonts'],'issues':issues,'text':data['text'],'pageTexts':data['pageTexts']},ensure_ascii=False))
