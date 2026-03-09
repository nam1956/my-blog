import json
import os

def make_combined_data_js():
    # 저장소 경로 설정
    data_dir = 'data'
    output_file = 'data.js'
    
    categories = ['family', 'hiking', 'interest']
    combined_data = {}

    for cat in categories:
        json_path = os.path.join(data_dir, f'{cat}.json')
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                combined_data[cat] = json.load(f)
            print(f"{cat}.json 읽기 완료 ({len(combined_data[cat])}개)")
        else:
            combined_data[cat] = []
            print(f"주의: {cat}.json 파일이 없습니다.")

    # data.js 파일 쓰기
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("// 자동 생성된 데이터 파일입니다.\n")
        # 자바스크립트 변수 형태로 저장
        f.write("const galleryData = ")
        json.dump(combined_data, f, ensure_ascii=False, indent=2)
        f.write(";\n")
    
    print(f"\n--- 축하합니다! {output_file} 파일이 성공적으로 생성되었습니다. ---")

if __name__ == "__main__":
    make_combined_data_js()