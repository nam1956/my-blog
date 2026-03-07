import json
import os
import re

# 합칠 파일 목록
json_files = {
    'family': 'data/family.json',
    'hiking': 'data/hiking.json',
    'interest': 'data/interest.json'
}

all_data = []

for category, file_path in json_files.items():
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                for item in data:
                    if 'file_range' in item and 'image_count' in item:
                        # e.g., "20060514_surak_001.JPG ~ 161.JPG"
                        m = re.search(r'(.+?)(\d+)\.([A-Za-z0-9]+)\s*~\s*(\d+)\.\3', item['file_range'])
                        if m:
                            prefix = m.group(1)
                            start_str = m.group(2)
                            ext = m.group(3)
                            end_num = int(m.group(4))
                            
                            num_len = len(start_str)
                            images = []
                            for i in range(1, end_num + 1):
                                images.append(f"{prefix}{str(i).zfill(num_len)}.{ext}")
                            
                            item['images'] = images

                all_data.extend(data)
                print(f"✅ {file_path}에서 {len(data)}개를 읽어왔습니다.")
        except Exception as e:
            print(f"❌ {file_path} 읽기 오류: {e}")
    else:
        print(f"⚠️ {file_path} 파일이 없습니다. 건너뜁니다.")

# 최종적으로 data.js 파일 생성 (웹사이트에서 사용되는 파일)
js_content = f"const photoData = {json.dumps(all_data, ensure_ascii=False, indent=2)};"

with open('data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"\n✨ 드디어 성공! 총 {len(all_data)}장의 정보를 data.js로 변환했습니다.")