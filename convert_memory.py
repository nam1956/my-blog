import os
import re
from bs4 import BeautifulSoup
import glob

def parse_html(filepath):
    # read euc-kr
    with open(filepath, 'r', encoding='euc-kr', errors='backslashreplace') as f:
        html = f.read()
    
    soup = BeautifulSoup(html, 'html.parser')
    
    items = []
    
    # Many tables inside, find the innermost ones containing photos
    # The structure: <tr> with images, followed by <tr> with text.
    # We can iterate over all <tr>
    rows = soup.find_all('tr')
    
    # We'll build a grid representation to handle rowspans
    grid = {}
    
    for r_idx, row in enumerate(rows):
        c_idx = 0
        for td in row.find_all(['td', 'th']):
            # find next available column in this row
            while (r_idx, c_idx) in grid:
                c_idx += 1
            
            # fill grid
            rowspan = int(td.get('rowspan', 1))
            colspan = int(td.get('colspan', 1))
            
            grid[(r_idx, c_idx)] = td
            
            for r in range(rowspan):
                for c in range(colspan):
                    grid[(r_idx + r, c_idx + c)] = td
            
            c_idx += colspan

    # Now we have a basic matrix.
    # Usually, images are in row R, and captions in row R+1
    # But some rowspan=2 images span R and R+1.
    
    # Let's extract all unique cells containing <a><img>
    processed = set()
    for (r, c), td in grid.items():
        if id(td) in processed: continue
        
        img = td.find('img')
        a = td.find('a')
        
        if img and a:
            processed.add(id(td))
            href = a.get('href', '')
            src = img.get('src', '')
            
            # replace old javascript popup with a cleaner vanilla one
            # javascript:na_open_window('win', 'tab/s131.htm', 0, 0, 510, 410, 0, 0, 0, 0, 0)
            clean_href = href
            m = re.search(r"na_open_window\('[^']*',\s*'([^']+)'(.*)\)", href)
            if m:
                url = m.group(1)
                # simpler onclick
                clean_href = f"javascript:window.open('{url}', 'win', 'width=600,height=500,scrollbars=yes,resizable=yes');"
            else:
                if 'javascript' not in href:
                    clean_href = f"javascript:window.open('{href}', 'win', 'width=600,height=500,scrollbars=yes,resizable=yes');"
            
            # caption is likely in r+1, c or we just text in the current td?
            # sometimes the caption is in a completely different row.
            rowspan = int(td.get('rowspan', 1))
            caption = ""
            
            # check cell below
            below_r = r + rowspan
            if (below_r, c) in grid:
                below_td = grid[(below_r, c)]
                # if below_td has no image, it's likely a caption
                if not below_td.find('img') and id(below_td) not in processed:
                    caption = below_td.get_text(separator=" ", strip=True)
                    processed.add(id(below_td))
            
            # what if caption is inside the same td?
            if not caption:
                text_in_td = td.get_text(separator=" ", strip=True)
                if text_in_td:
                    caption = text_in_td
            
            # clean up caption (remove blank spaces)
            if caption == '&nbsp;' or caption == 'nbsp': caption = ""
            
            items.append({
                'href': clean_href,
                'src': src,
                'caption': caption
            })

    title = "추억 (Memory)"
    title_el = soup.find('u') or soup.find('b') or soup.title
    if title_el:
        title = title_el.get_text(strip=True)

    # Generate modern HTML
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
        '    <div class="gallery-content" style="margin-left:0; padding:40px;">',  # Adjust if using sidebar
        f'        <h2 style="text-align:center; margin-bottom:40px; color:#333;">{title}</h2>',
        '        <div class="memory-grid">'
    ]
    
    for item in items:
        # Ignore empty dummy cells that don't have proper links/images
        if not item['src']: continue
        
        cap = f'<div class="memory-title">{item["caption"]}</div>' if item["caption"] else ''
        out.append('            <div class="memory-item">')
        out.append(f'                <a href="{item["href"]}"><img src="{item["src"]}" class="memory-img" alt="추억 사진"></a>')
        if cap:
            out.append(f'                {cap}')
        out.append('            </div>')
        
    out.extend([
        '        </div>',
        '        <div style="text-align:center; margin-top:40px;">',
        '            <button onclick="window.history.back()" style="padding:10px 20px; border-radius:8px; border:none; background:#007bff; color:white; font-size:16px; cursor:pointer;">뒤로 가기</button>',
        '        </div>',
        '    </div>',
        '</body>',
        '</html>'
    ])
    
    return '\n'.join(out)

for f in glob.glob('memory_*.htm'):
    print(f"Processing {f}...")
    new_html = parse_html(f)
    if new_html:
        new_f = f.replace('.htm', '.html')
        with open(new_f, 'w', encoding='utf-8') as out_f:
            out_f.write(new_html)
        print(f"Created {new_f}")

print("Done.")
