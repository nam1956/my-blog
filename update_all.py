import json
import os

# [설정] 폴더 경로 확인 (사장님의 현재 구조 유지)
DATA_DIR = 'data'
OUTPUT_JS = 'data.js'
CATEGORIES = ['family', 'hiking', 'interest', 'memory', 'travel', 'friend', 'slide']

def process_all_in_one():
    print("🚀 [로키리눅스] 갤러리 통합 업데이트를 시작합니다...")
    
    # data 폴더가 없으면 만듭니다.
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    all_photos = []

    # 1단계: 각 카테고리별 .txt 파일을 읽어서 처리합니다.
    for cat in CATEGORIES:
        txt_file = f"{cat}.txt"
        json_path = os.path.join(DATA_DIR, f"{cat}.json")
        
        if os.path.exists(txt_file):
            current_cat_list = []
            with open(txt_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()[1:]  # 첫 줄(헤더) 제외
                for line in lines:
                    parts = line.strip().split('\t')
                    if len(parts) >= 4:
                        filename, shot_date, _, keywords = parts
                        pure_date = shot_date.split(' ')[0]
                        
                        # 사진 정보 정리
                        photo_item = {
                            "src": f"images/result_{cat}/{filename}",
                            "theme": keywords,
                            "date": pure_date,
                            "category": cat,
                            "filename": filename
                        }
                        current_cat_list.append(photo_item)
            
            # 각각의 .json 파일로도 저장 (기존 방식 유지)
            with open(json_path, 'w', encoding='utf-8') as jf:
                json.dump(current_cat_list, jf, ensure_ascii=False, indent=2)
            
            # 전체 합치기용 리스트에 추가
            all_photos.extend(current_cat_list)
            print(f"✅ {cat}.txt 처리 완료: {len(current_cat_list)}개")
        else:
            print(f"⚠️  주의: {txt_file} 파일이 없어 건너뜁니다.")

    # 2단계: 최종 data.js 파일 생성
    try:
        with open(OUTPUT_JS, 'w', encoding='utf-8') as f:
            f.write("// 자동 생성된 데이터 파일입니다.\n")
            f.write("const photoData = ")
            json.dump(all_photos, f, ensure_ascii=False, indent=2)
            f.write(";\n")
        
        print("\n" + "="*50)
        print(f"✨ 축하합니다! {OUTPUT_JS} 생성이 완료되었습니다.")
        print(f"✨ 총 {len(all_photos)}장의 사진이 등록되었습니다.")
        print("="*50)

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    process_all_in_one()