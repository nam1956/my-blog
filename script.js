let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type') || 'all';

    // 데이터 로드 확인
    const rawData = (typeof photoData !== 'undefined') ? photoData : [];

    // 배열 형태의 images가 있다면 개별 객체로 풀어서 평탄화 (단일 항목은 그대로 유지)
    let expandedData = [];
    rawData.forEach(p => {
        // 이미지가 배열로 주어진 경우
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
            p.images.forEach(imgFilename => {
                expandedData.push({
                    ...p,                // 기존 속성(category, theme, date 등) 유지
                    filename: imgFilename, // 실제 이미지 파일명만 교체
                    images: undefined    // 중복 방지를 위해 제거
                });
            });
        } 
        // 기존처럼 filename 하나만 주어진 경우
        else if (p.filename) {
            expandedData.push(p);
        }
    });

    // 필터링 로직 강화 (카테고리가 없는 데이터는 'family'로 취급)
    filteredList = expandedData.filter(p => {
        const itemCategory = p.category || 'family'; 
        return (category === 'all') || (itemCategory === category);
    });

    const titleMap = {
        'family': '🏠 가족 갤러리',
        'hiking': '⛰️ 등반 사진첩',
        'friend': '🤝 친구 갤러리',
        'interest': '💡 관심 저장소'
    };
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = titleMap[category] || '나의 인생 갤러리';

    displayPage(1);
}

function displayPage(page) {
    const galleryContainer = document.querySelector('.gallery');
    const totalCountTag = document.getElementById('totalPhotoCount');
    if (!galleryContainer) return;
    
    currentPage = page;
    galleryContainer.innerHTML = '';
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    filteredList.slice(start, end).forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        
        // 카테고리 보정: 데이터에 없으면 'family' 폴더로 연결
        const cat = photo.category || 'family';
        const folderPath = `images/result_${cat}`;
        const imgSrc = `${folderPath}/${photo.filename}`;

        div.innerHTML = `
            <img src="${imgSrc}" 
                 class="gallery-img" 
                 onclick="openModal('${imgSrc}')" 
                 onerror="handleImageError(this)">
            <div class="photo-info">
                <strong>${photo.theme || '제목 없음'}</strong><br>
                <span>${photo.date || ''}</span>
            </div>
        `;
        galleryContainer.appendChild(div);
    });
    
    if (totalCountTag) totalCountTag.innerText = `총 : ${filteredList.length} 장의 사진이 있습니다`;
    renderPagination();
}

// 대소문자(PNG/png) 및 경로 오류 복구 함수
function handleImageError(image) {
    if (image.dataset.tried === "2") return; // 두 번 실패하면 중단

    let currentSrc = image.src;
    
    if (!image.dataset.tried) {
        // 1차 시도: 확장자를 대문자로 변경 (.jpg -> .JPG)
        image.dataset.tried = "1";
        if (currentSrc.toLowerCase().endsWith('.jpg')) image.src = currentSrc.replace(/\.jpg/i, '.JPG');
        else if (currentSrc.toLowerCase().endsWith('.png')) image.src = currentSrc.replace(/\.png/i, '.PNG');
    } else {
        // 2차 시도: 그래도 안되면 'family' 대신 'hiking' 등 다른 폴더나 기본 이미지 표시
        image.dataset.tried = "2";
        image.src = 'https://via.placeholder.com/200?text=Check+Path';
    }
}

// ... 나머지 renderPagination, openModal 등은 기존과 동일
document.addEventListener('DOMContentLoaded', init);