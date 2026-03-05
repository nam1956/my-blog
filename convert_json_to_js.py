import json
import os

# 1. 재료 위치 확인 (data 폴더 안의 family.json)
json_path = os.path.join('data', 'family.json')

if not os.path.exists(json_path):
    print(f"❌ 오류: '{json_path}' 파일을 찾을 수 없습니다. 폴더 위치를 확인하세요.")
    exit()

# 2. JSON 데이터 읽기
with open(json_path, 'r', encoding='utf-8') as f:
    json_data = json.load(f)

final_list = []

# 3. 데이터 변환 (사용자님의 JSON 구조에 맞춤)
for item in json_data:
    # 'category'를 제외하고 .jpg나 .png로 끝나는 실제 파일명만 골라냅니다.
    keys = [k for k in item.keys() if k.lower().endswith(('.jpg', '.png', '.jpeg'))]
    
    if keys:
        filename = keys[0]  # 실제 파일명 (예: IMG_1234.jpg)
        date_info = item.get(filename, "날짜미상") # 그 파일명에 적힌 날짜 값
        
        final_list.append({
            "filename": filename,
            "date": date_info,
            "title": "가족 추억",
            "category": "family" # images/result_family 폴더로 연결됨
        })

# 4. 결과물(data.js)을 루트 폴더에 저장
with open('data.js', 'w', encoding='utf-8') as f:
    f.write("const photoData = ")
    json.dump(final_list, f, ensure_ascii=False, indent=4)
    f.write(";")

print(f"✅ 드디어 성공! 총 {len(final_list)}장의 정보를 data.js로 변환했습니다.")