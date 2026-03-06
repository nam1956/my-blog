import os
import json

# 1. 설정 (폴더명 확인 필수!)
image_dir = 'images/result_family'  # 사진이 들어있는 폴더
json_output = 'data/family.json'    # 만들어질 결과 파일

if not os.path.exists(image_dir):
    print(f"❌ 에러: {image_dir} 폴더가 없습니다!")
else:
    # 2. 폴더 내 JPG, PNG 파일 모두 가져오기
    files = sorted([f for f in os.listdir(image_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

    family_list = []
    for filename in files:
        # 파일명에서 날짜 추출 (예: 20060604_...)
        parts = filename.split('_')
        date_str = "2006-06-04 12:00:00" # 기본값
        if len(parts) >= 1 and len(parts[0]) == 8 and parts[0].isdigit():
            date_str = f"{parts[0][:4]}-{parts[0][4:6]}-{parts[0][6:8]} 12:00:00"

        family_list.append({
            "filename": filename,
            "date": date_str,
            "category": "family",
            "title": "가족과 함께한 소중한 시간"
        })

    # 3. JSON 저장 (이게 630장 전체를 만듭니다)
    os.makedirs('data', exist_ok=True)
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump(family_list, f, ensure_ascii=False, indent=2)

    print(f"✅ 성공! {len(family_list)}장의 사진 정보를 {json_output}에 담았습니다.")
