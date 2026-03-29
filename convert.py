import sys, re, glob
sys.path.insert(0, '/tmp/bs4env')
from bs4 import BeautifulSoup

def build_grid(table):
    grid = {}
    processed_tds = set()
    rows = table.find_all('tr', recursive=False)
    if not rows:
        # Sometimes tbody is used
        tbody = table.find('tbody', recursive=False)
        if tbody:
            rows = tbody.find_all('tr', recursive=False)
            
    for r_idx, row in enumerate(rows):
        c_idx = 0
        for td in row.find_all(['td', 'th'], recursive=False):
            while (r_idx, c_idx) in grid:
                c_idx += 1
            rowspan = int(td.get('rowspan', 1))
            colspan = int(td.get('colspan', 1))
            
            for r in range(rowspan):
                for c in range(colspan):
                    orig = (r == 0 and c == 0)
                    grid[(r_idx + r, c_idx + c)] = {'td': td, 'orig': orig}
            c_idx += colspan
    return grid

def process_file(filepath):
    print(f"Processing {filepath}...")
    
    with open(filepath, 'rb') as f:
        raw = f.read()

    html = ""
    try:
        decoded_utf8 = raw.decode('utf-8')
        if '°¡' in decoded_utf8 or '¾Æ' in decoded_utf8 or 'Ãß¾ï' in decoded_utf8:
            html = decoded_utf8.encode('iso-8859-1').decode('euc-kr')
        else:
            html = decoded_utf8
    except Exception:
        pass
        
    if not html:
        html = raw.decode('euc-kr', errors='replace')
        
    soup = BeautifulSoup(html, 'html.parser')
    
    title = "추억 (Memory)"
    t = soup.find('title')
    if t and t.text.strip(): title = t.text.strip()
    
    items = []
    processed_img_srcs = set()
    
    # 1. Find all valid images
    for img in soup.find_all('img'):
        src = img.get('src', '')
        if 'photo/' not in src: continue
        if src in processed_img_srcs: continue
        processed_img_srcs.add(src)
        
        big_src = re.sub(r'-s(\.[a-zA-Z]+)$', r'\1', src)
        
        td = img.find_parent('td')
        caption = ""
        
        if td:
            # check inside td directly
            texts = []
            for el in td.contents:
                if isinstance(el, str):
                    if el.strip() and el.strip() not in ['&nbsp;', 'nbsp']:
                        texts.append(el.strip())
                elif el.name not in ['img', 'a', 'table']:
                    txt = el.get_text(strip=True)
                    if txt and txt not in ['&nbsp;', 'nbsp']:
                        texts.append(txt)
            
            caption = " ".join(texts).strip()
            
            if not caption:
                # check grid below
                table = td.find_parent('table')
                if table:
                    grid = build_grid(table)
                    my_rc = None
                    for (r, c), data in grid.items():
                        if data['td'] == td and data['orig']:
                            my_rc = (r, c)
                            break
                    if my_rc:
                        r, c = my_rc
                        rowspan = int(td.get('rowspan', 1))
                        below_r = r + rowspan
                        if (below_r, c) in grid:
                            b_data = grid[(below_r, c)]
                            if b_data['orig'] and not b_data['td'].find('img'):
                                caption = b_data['td'].get_text(separator=' ', strip=True)
        
        if caption == '&nbsp;' or caption == 'nbsp': caption = ""
        
        items.append({
            'thumb_src': src,
            'big_src': big_src,
            'caption': caption
        })
        
    out = [
        '<!DOCTYPE html>',
        '<html lang="ko">',
        '<head>',
        '    <meta charset="UTF-8">',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        f'    <title>{title}</title>',
        '    <link rel="stylesheet" href="style.css">',
        '</head>',
        '<body>',
        '    <div class="gallery-content" style="margin-left:0; padding:40px;">',
        f'        <h2 style="text-align:center; margin-bottom:40px; color:#333;">{title}</h2>',
        '        <div class="memory-grid">'
    ]
    
    for item in items:
        cap_str = f'<br><div class="memory-title">{item["caption"]}</div>' if item["caption"] else ''
        out.append('            <div class="memory-item">')
        out.append(f'                <img src="{item["thumb_src"]}" class="memory-img" alt="추억 사진" onclick="openMemoryModal(\'{item["big_src"]}\')" style="cursor: zoom-in;">')
        out.append(f'                {cap_str}')
        out.append('            </div>')
    
    out.extend([
        '        </div>',
        '        <div style="text-align:center; margin-top:40px;">',
        '            <button onclick="window.history.back()" style="padding:10px 20px; border-radius:8px; border:none; background:#007bff; color:white; font-size:16px; cursor:pointer;">뒤로 가기</button>',
        '        </div>',
        '    </div>',
        '',
        '    <!-- 개별 사진 확대 모달 -->',
        '    <div id="memoryModal" class="modal" onclick="closeMemoryModal()">',
        '        <span class="close" title="닫기" onclick="closeMemoryModal()" style="position:absolute; top:20px; right:35px; color:white; font-size:40px; font-weight:bold; cursor:pointer; z-index:3010;">&times;</span>',
        '        <img id="memoryModalImg" class="modal-content" onclick="event.stopPropagation()">',
        '    </div>',
        '    <script>',
        '        function openMemoryModal(src) {',
        '            var modal = document.getElementById("memoryModal");',
        '            var img = document.getElementById("memoryModalImg");',
        '            img.src = src;',
        '            img.style.cursor = "zoom-out";',
        '            modal.style.display = "flex";',
        '            document.body.style.overflow = "hidden"; // 배경 스크롤 차단',
        '        }',
        '        function closeMemoryModal() {',
        '            document.getElementById("memoryModal").style.display = "none";',
        '            document.getElementById("memoryModalImg").src = "";',
        '            document.body.style.overflow = "auto";',
        '        }',
        '    </script>',
        '</body>',
        '</html>'
    ])
    
    new_filepath = filepath.replace('.htm', '.html')
    with open(new_filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    print(f"Correctly converted to {new_filepath} (Found {len(items)} items)")

for f in glob.glob('memory_*.htm'):
    process_file(f)

