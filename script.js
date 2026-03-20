let currentPage = 1;
let filteredList = []; // 카테고리별 기본 리스트
let currentDisplayList = []; // [중요] 현재 화면에 표시 중인 리스트 (동보회 등 검색 결과 고정)
const ITEMS_PER_PAGE = 20;

function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type') || 'all';
    const rawData = (typeof photoData !== 'undefined') ? photoData : [];

    let expandedData = [];
    rawData.forEach(p => {
        if (p.images && Array.isArray(p.images)) {
            p.images.forEach(img => expandedData.push({ ...p, filename: img, images: undefined }));
        } else if (p.filename) {
            expandedData.push(p);
        }
    });

    updateMenuCounts(expandedData);

    // 1. 카테고리에 맞는 기본 리스트 생성
    filteredList = expandedData.filter(p => (category === 'all') || (p.category || 'family') === category);

    const titleMap = { family: '🏠 가족', hiking: '⛰️ 등반', friend: '🤝 친구', interest: '💡 관심', travel: '✈️ 여행', memory: '🕰️ 추억' };
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = (titleMap[category] || '나의 인생') + ' 갤러리';

    // [수정] 초기화 시점에 filteredList를 currentDisplayList에 명시적으로 박아넣습니다.
    currentDisplayList = filteredList;
    renderGallery(1);
}

function updateMenuCounts(allData) {
    const categories = ['family', 'hiking', 'friend', 'travel', 'interest', 'memory'];
    categories.forEach(cat => {
        const count = allData.filter(p => (p.category || 'family') === cat).length;
        const menuLink = document.querySelector(`.side-menu a[href*="type=${cat}"]`);
        if (menuLink) {
            let badge = menuLink.querySelector('.menu-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'menu-badge';
                menuLink.appendChild(badge);
            }
            badge.innerText = count;
        }
    });
}

// [수정] 인자 기본값을 삭제하여 꼬임을 방지합니다.
function renderGallery(page, listToRender) {
    const container = document.querySelector('.gallery') || document.querySelector('.slide-display-zone');
    if (!container) return;
    container.className = 'gallery';
    if (listToRender) { currentDisplayList = listToRender; }
    currentPage = page;
    container.innerHTML = '';
    
    const displayList = currentDisplayList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    displayList.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-item'; // [1] 가장 바깥 액자
        
        const imgSrc = `images/result_${photo.category || 'family'}/${photo.filename}`;
        
        // [중요] 아래 구조가 CSS의 액자 틀과 100% 일치해야 사진이 안 커집니다!
        div.innerHTML = `
            <div class="photo-item-inner">
                <div class="theme-text">${photo.theme || '제목 없음'}</div>
                <div class="img-container">
                    <img src="${imgSrc}" class="gallery-img" onerror="handleImageError(this)" onclick="openModal('${imgSrc}')">
                </div>
                <div class="date-text">${photo.date || ''}</div>
            </div>
        `;
        container.appendChild(div);
    });

    // 사진 수량 표시 (숫자만 청색으로 포인트)
const countElement = document.getElementById('totalPhotoCount');
if (countElement) {
    // 숫자에만 span 태그를 입혀서 인라인 스타일로 색상을 줍니다.
    // .toLocaleString()을 붙여주면 1000단위 쉼표가 생겨서 더 전문적으로 보입니다.
    countElement.innerHTML = `TOTAL : <span style="color: #007bff; margin: 0 5px;">${currentDisplayList.length.toLocaleString()}</span> Pic`;
}
    displayPagination(currentDisplayList.length);
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const results = filteredList.filter(p => (p.theme || '').toLowerCase().includes(query) || (p.date || '').toLowerCase().includes(query));
    renderGallery(1, results);
}

function filterBySubCategory(subCat) {
    const newUrl = window.location.pathname + '?type=friend';
    window.history.pushState({ path: newUrl }, '', newUrl);
    
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = '🤝 친구 갤러리 (' + subCat + ')';

    const rawData = (typeof photoData !== 'undefined') ? photoData : [];
    let allExpanded = [];
    rawData.forEach(p => {
        if (p.images && Array.isArray(p.images)) {
            p.images.forEach(img => allExpanded.push({ ...p, filename: img, images: undefined }));
        } else if (p.filename) {
            allExpanded.push(p);
        }
    });

    const subResults = allExpanded.filter(p => (p.theme || '').includes(subCat));
    // 동보회 32장 리스트를 renderGallery에 넘겨서 currentDisplayList를 교체합니다.
    renderGallery(1, subResults); 
}

function handleImageError(img) {
    if (img.dataset.tried === "2") return;
    img.dataset.tried = img.dataset.tried ? "2" : "1";
    if (img.dataset.tried === "1") {
        img.src = img.src.toLowerCase().endsWith('.jpg') ? img.src.replace(/\.jpg/i, '.JPG') : img.src.replace(/\.png/i, '.PNG');
    } else {
        img.src = 'https://via.placeholder.com/200?text=Error';
    }
}

function displayPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const createBtn = (text, target, cls = '') => {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        if (cls) btn.className = cls;
        // 이제 인자 없이 호출해도 currentDisplayList를 참조하므로 섞이지 않습니다.
        btn.onclick = () => { renderGallery(target); window.scrollTo(0, 0); };
        return btn;
    };

    if (currentPage > 1) {
        pagination.appendChild(createBtn('≪', 1, 'nav-btn'));
        pagination.appendChild(createBtn('<', currentPage - 1, 'nav-btn'));
    }
    // 페이지 번호 생성
    for (let i = 1; i <= totalPages; i++) {
        // 현재 페이지 주변 번호만 보여주기 (선택사항)
        if (i >= currentPage - 2 && i <= currentPage + 2) {
            pagination.appendChild(createBtn(i, i, i === currentPage ? 'active' : ''));
        }
    }
    if (currentPage < totalPages) {
        pagination.appendChild(createBtn('>', currentPage + 1, 'nav-btn'));
        pagination.appendChild(createBtn('≫', totalPages, 'nav-btn'));
    }
}

function openModal(src) {
    const modal = document.getElementById("imageModal");
    const img = document.getElementById("imgFull");
    modal.style.display = "flex"; img.src = src; img.classList.remove('full-size');
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('searchInput').onkeyup = (e) => { if (e.key === 'Enter') performSearch(); };
    document.querySelector(".close").onclick = () => document.getElementById("imageModal").style.display = "none";
    window.onclick = (e) => { if (e.target.id === 'imageModal') e.target.style.display = "none"; };
    document.getElementById("imgFull").onclick = function() { this.classList.toggle('full-size'); };
});

// [최종 확정] 클릭 불필요, 모달 불필요. 9장 사진을 바둑판으로 강제 배치합니다.
function showSlideStrip() {
    const container = document.querySelector('.gallery') || document.querySelector('.slide-display-zone');
    if (!container) return;

    // 1. 초기화 및 컨테이너 클래스 변경 (기존 gallery의 이중 그리드 방지!)
    container.innerHTML = ''; 
    container.className = 'slide-display-zone';

    // 2. 사장님의 보물 같은 사진 9장 명단
    const slideFiles = [
        "412221.jpg", "412222.jpg", "412223.jpg", 
        "412311.jpg", "412312.jpg", "501011.jpg", 
        "501012.jpg", "501091.jpg", "501092.jpg"
    ];

    // 3. 사진 뿌리기 (디자인은 style.css 의 .slide-display-zone img 에 위임)
    slideFiles.forEach(fileName => {
        const img = document.createElement('img');
        // 경로: images/result_slide/파일명
        img.src = `images/result_slide/${fileName}`; 
        img.alt = "추억 슬라이드";
        
        container.appendChild(img);
    });

    // 4. 상단 제목 업데이트
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = "🎞️ 추억의 슬라이드 전시장";
    
    // 사진 수량 표시 (TOTAL 9 Pic)
    const countElement = document.getElementById('totalPhotoCount');
    if (countElement) {
        countElement.innerHTML = `TOTAL : <span style="color: #007bff; font-weight: bold;">${slideFiles.length}</span> Pic`;
    }

    // 하단 페이지 번호는 필요 없으니 숨기기
    const pagination = document.getElementById('pagination');
    if (pagination) pagination.innerHTML = '';
}