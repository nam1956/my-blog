import os
import json
from datetime import datetime

def update_photo_database():
    # 사장님의 실제 폴더 구조 (폴더명: 생성될 JSON명)
    folder_map = {
        "images/result_hiking": "hiking",
        "images/result_interest": "interest",
        "images/result_family": "family"
    }

    for folder_path, json_name in folder_map.items():
        if not os.path.exists(folder_path):
            continue

        photo_data = []
        extensions = ('.jpg', '.jpeg', '.png', '.gif', '.JPG', '.PNG')

        for filename in os.listdir(folder_path):
            if filename.lower().endswith(extensions):
                file_path = os.path.join(folder_path, filename)
                
                # 파일의 수정 날짜 가져오기
                mtime = os.path.getmtime(file_path)
                date_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')

                # 파일명을 테마(theme)로 사용 (예: '설악산_공룡능선')
                theme_name = os.path.splitext(filename)[0]

                photo_data.append({
                    "filename": filename,
                    "theme": theme_name,
                    "date": date_str
                })

        # ⭐ [배열 정렬] 날짜(date) 기준으로 내림차순 정렬 (최신 사진이 맨 위로!)
        # 만약 옛날 사진이 위로 가게 하려면 reverse=False로 바꾸면 됩니다.
        photo_data.sort(key=lambda x: x['date'], reverse=True)

        # 결과 저장
        with open(f"{json_name}.json", "w", encoding="utf-8") as f:
            json.dump(photo_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ {json_name}.json 정렬 및 생성 완료! ({len(photo_data)}장)")

if __name__ == "__main__":
    update_photo_database()

    print("\n🚀 블로그 업데이트를 시작합니다 (Git Push)...")
    os.system("git add .")
    os.system('git commit -m "사진 자동 업데이트"')
    os.system("git push")