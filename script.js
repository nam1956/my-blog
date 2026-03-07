let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

// [1] 초기화: 제목 설정 및 데이터 로드
function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type') || 'all'; // 기본값 all

    // 변수명이 photoData인지 allPhotos인지 상관없이 로드
    const rawData = (typeof photoData !== 'undefined') ? photoData : (typeof allPhotos !== 'undefined' ? allPhotos : []);

    // 사진 필터링
    filteredList = (category === 'all') 
        ? rawData 
        : rawData.filter(p => p.category === category);

    // ★ 제목 매칭 수정: 사장님의 메뉴 이름에 딱 맞춤 ★
    const titleMap = {
        'family': '🏠 가족 갤러리',
        'hiking': '⛰️ 등반 사진첩',
        'friend': '🤝 친구 갤러리',
        'travel': '✈️ 여행 기록',
        'interest': '💡 관심 저장소',
        'memory': '🕰️ 추억 저장소'
    };

    const titleTag = document.getElementById('gallery-title');
    if (titleTag) {
        titleTag.innerText = titleMap[category] || '나의 인생 갤러리';
    }

    // 메인 페이지 타이핑 효과 (갤러리가 아닐 때만)
    if (!window.location.pathname.includes('gallery')) {
        const target = document.querySelector(".typing-text");
        if (target) {
            target.innerHTML = "";
            let text = "소중한 순간들을 기록합니다. 함께 추억을 나누어 보아요.";
            let i = 0;
            function type() {
                if (i < text.length) { target.innerHTML += text[i++]; setTimeout(type, 120); }
            }
            type();
        }
    } else {
        displayPage(1);
    }
}

// [2] 사진 출력 (photoData의 theme 속성 사용)
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
        
        const folderPath = `images/result_${photo.category || 'family'}`;
        const imgSrc = `${folderPath}/${photo.filename}`;

        // ★ 대소문자 문제 해결용 에러 처리 로직 추가 ★
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

// ★ 확장자가 대문자/소문자 섞여있을 때를 대비한 마법의 함수 ★
function handleImageError(image) {
    const originalSrc = image.src;
    
    // 이미 한 번 변환을 시도했다면 무한 루프 방지를 위해 중단
    if (image.dataset.tried === "upper") {
        image.src = 'https://via.placeholder.com/200?text=No+Image';
        return;
    }

    // .png를 .PNG로, .jpg를 .JPG로 바꿔서 다시 시도
    let newSrc = originalSrc;
    if (originalSrc.endsWith('.png')) newSrc = originalSrc.replace('.png', '.PNG');
    else if (originalSrc.endsWith('.jpg')) newSrc = originalSrc.replace('.jpg', '.JPG');
    
    image.dataset.tried = "upper";
    image.src = newSrc;
}

// ... (나머지 renderPagination, openModal 등 함수는 기존과 동일하게 유지)
// (복사가 번거로우시면 AI 반장에게 위 init 함수와 displayPage 함수만 바꿔달라고 하셔도 됩니다!)