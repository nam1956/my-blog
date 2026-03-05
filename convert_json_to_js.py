import json
import os

def convert():
    combined_data = []
    data_folder = 'data'
    
    # 1. 처리할 파일 리스트와 각 카테고리별 사진 폴더 매핑
    targets = [
        {'file': 'family.json', 'path': 'images/result_family/'},
        {'file': 'hiking.json', 'path': 'images/result_hiking/'}
    ]
    
    for target in targets:
        file_path = os.path.join(data_folder, target['file'])
        
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                items = json.load(f)
                for item in items:
                    # 파일명 앞에 올바른 폴더 경로를 붙여줍니다.
                    item['image_path'] = target['path'] + item['filename']
                    combined_data.append(item)
            print(f"✅ {target['file']} 로드 완료!")
        else:
            print(f"⚠️ {target['file']} 파일이 존재하지 않아 건너뜁니다.")

    # 2. 날짜 기준 정렬 (최신순)
    combined_data.sort(key=lambda x: x['date'], reverse=True)

    # 3. data.js 파일로 저장
    js_content = f"const galleryData = {json.dumps(combined_data, ensure_ascii=False, indent=2)};"
    
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print("-" * 30)
    print(f"🚀 총 {len(combined_data)}개의 데이터가 data.js로 통합되었습니다!")

if __name__ == "__main__":
    convert()