import json
import os

def convert_txt_to_json(txt_filename, json_path, category):
    if not os.path.exists(txt_filename):
        print(f"파일이 없습니다: {txt_filename}")
        return

    data_list = []
    with open(txt_filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()[1:]  # 헤더 제외
        for line in lines:
            parts = line.strip().split('\t')
            if len(parts) >= 4:
                filename, shot_date, _, keywords = parts
                # 날짜에서 시간 제외하고 yyyy-mm-dd만 추출
                pure_date = shot_date.split(' ')[0]
                
                data_list.append({
                    "src": f"images/result_{category}/{filename}",
                    "theme": keywords,
                    "date": pure_date,
                    "category": category
                })

    # JSON 파일로 저장
    with open(json_path, 'w', encoding='utf-8') as jf:
        json.dump(data_list, jf, ensure_ascii=False, indent=2)
    print(f"성공: {json_path} 에 {len(data_list)}개 저장됨.")

# 실행 부분
if __name__ == "__main__":
    # 1. 가족사진
    convert_txt_to_json('family.txt', 'data/family.json', 'family')
    # 2. 등산
    convert_txt_to_json('hiking.txt', 'data/hiking.json', 'hiking')
    # 3. 관심사
    convert_txt_to_json('interest.txt', 'data/interest.json', 'interest')
    # 4. 추억
    convert_txt_to_json('memory.txt', 'data/memory.json', 'memory')
    # 5. 여행
    convert_txt_to_json('travel.txt', 'data/travel.json', 'travel')
    # 6. 친구
    convert_txt_to_json('friend.txt', 'data/friend.json', 'friend')