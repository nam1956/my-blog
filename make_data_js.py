import json
import os

def make_combined_data_js():
    data_dir = 'data'
    output_file = 'data.js'
    
    categories = ['family', 'hiking', 'interest']
    # 수정: 카테고리 구분 없이 모든 사진을 하나의 리스트(배열)로 합칩니다.
    all_photos = []

    for cat in categories:
        json_path = os.path.join(data_dir, f'{cat}.json')
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # 각 사진 객체에 filename이 없다면 src에서 추출해주는 센스!
                for item in data:
                    if 'src' in item and 'filename' not in item:
                        item['filename'] = os.path.basename(item['src'])
                all_photos.extend(data)
            print(f"{cat}.json 읽기 완료 ({len(data)}개)")
        else:
            print(f"주의: {cat}.json 파일이 없습니다.")

    # data.js 파일 쓰기
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("// 자동 생성된 데이터 파일입니다.\n")
        # 수정: script.js가 찾는 이름인 'photoData'로 저장합니다.
        f.write("const photoData = ") 
        json.dump(all_photos, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    
    print(f"\n--- 축하합니다! {output_file} 파일이 성공적으로 생성되었습니다. ---")
    print(f"--- 총 {len(all_photos)}장의 사진이 등록되었습니다. ---")

if __name__ == "__main__":
    make_combined_data_js()