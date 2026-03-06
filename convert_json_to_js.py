import json
import os

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