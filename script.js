let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

// [1] 초기화
function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type');
    const path = window.location.pathname;

    // 데이터가 로드되었는지 확인 (allPhotos 또는 photoData)
    const rawData = (typeof allPhotos !== 'undefined') ? allPhotos : (typeof photoData !== 'undefined' ? photoData : []);

    if (category || path.includes('gallery')) {
        const activeCategory = category || 'all';
        
        filteredList = (activeCategory === 'all') 
            ? rawData 
            : rawData.filter(p => p.category === activeCategory);

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
            titleTag.innerText = titleMap[activeCategory] || '나의 인생 갤러리';
        }
        displayPage(1);
    } 
    else {
        const target = document.querySelector(".typing-text");
        if (target) {
            target.innerHTML = "";
            let text = "소중한 순간들을 기록합니다. 함께 추억을 나누어 보아요.";
            let i = 0;
            function type() {
                if (i < text.length) {
                    target.innerHTML += text[i++];
                    setTimeout(type, 120);
                }
            }
            type();
        }
    }
}

// [2] 사진 출력 (경로 및 theme 속성 수정)
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
        
        // 경로 확인: result_ 폴더 구조 유지
        const folderPath = `images/result_${photo.category}`;
        const imgSrc = `${folderPath}/${photo.filename}`;

        // photo.title 대신 photo.theme 사용
        div.innerHTML = `
            <img src="${imgSrc}" class="gallery-img" onclick="openModal('${imgSrc}')" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
            <div class="photo-info"><strong>${photo.theme || '제목 없음'}</strong><br><span>${photo.date || ''}</span></div>
        `;
        galleryContainer.appendChild(div);
    });
    
    if (totalCountTag) totalCountTag.innerText = `총 : ${filteredList.length} 장의 사진이 있습니다`;
    renderPagination();
}

// ... (이하 페이지네이션 및 모달 코드는 동일하므로 생략하거나 기존 것 유지)