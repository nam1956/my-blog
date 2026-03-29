import glob, re
import sys
sys.path.insert(0, '/tmp/bs4env')
from bs4 import BeautifulSoup

def update_html_with_modal(filepath):
    print(f"Updating {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
        
    soup = BeautifulSoup(html, 'html.parser')
    
    # Check if modal already exists
    if soup.find(id="memoryModal"):
        print(f"Skipping {filepath}, already has modal.")
        return
        
    for a in soup.find_all('a'):
        href = a.get('href', '')
        if 'window.open' in href or 'na_open_window' in href:
            img = a.find('img')
            if img:
                src = img.get('src', '')
                big_src = re.sub(r'-s(\.[a-zA-Z]+)$', r'\1', src)
                
                # Unwrap a tag by replacing it with its img content
                # Add onclick to img
                img['onclick'] = f"openMemoryModal('{big_src}')"
                img['style'] = "cursor: zoom-in;"
                a.replace_with(img)

    # Insert modal at the end of body
    body = soup.find('body')
    if body:
        modal_html = """
    <!-- 개별 사진 확대 모달 -->
    <div id="memoryModal" class="modal" onclick="closeMemoryModal()">
        <span class="close" title="닫기" onclick="closeMemoryModal()" style="position:absolute; top:20px; right:35px; color:white; font-size:40px; font-weight:bold; cursor:pointer; z-index:3010;">&times;</span>
        <img id="memoryModalImg" class="modal-content" onclick="event.stopPropagation()">
    </div>
    <script>
        function openMemoryModal(src) {
            var modal = document.getElementById("memoryModal");
            var img = document.getElementById("memoryModalImg");
            img.src = src;
            img.style.cursor = "zoom-out";
            modal.style.display = "flex";
            document.body.style.overflow = "hidden"; // 배경 스크롤 차단
        }
        function closeMemoryModal() {
            document.getElementById("memoryModal").style.display = "none";
            document.getElementById("memoryModalImg").src = "";
            document.body.style.overflow = "auto";
        }
    </script>
"""
        modal_soup = BeautifulSoup(modal_html, 'html.parser')
        body.append(modal_soup)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Done updating {filepath}")

for f in ['memory_3.html', 'memory_4.html']:
    update_html_with_modal(f)
