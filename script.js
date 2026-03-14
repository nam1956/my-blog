let currentPage = 1;
let filteredList = [];
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

    // 1. 왼쪽 메뉴 수량 표시 업데이트 (음각 배지)
    updateMenuCounts(expandedData);

    // 2. 카테고리 필터링
    filteredList = expandedData.filter(p => (category === 'all') || (p.category || 'family') === category);

    // 3. 제목 설정
    const titleMap = { family: '🏠 가족', hiking: '⛰️ 등반', friend: '🤝 친구', interest: '💡 관심', travel: '✈️ 여행', memory: '🕰️ 추억' };
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = (titleMap[category] || '나의 인생') + ' 갤러리';

    renderGallery(1);
}

// 음각 배지 업데이트 함수
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

function renderGallery(page, listToRender = filteredList) {
    const container = document.querySelector('.gallery');
    if (!container) return;
    
    currentPage = page;
    container.innerHTML = '';
    const displayList = listToRender.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    displayList.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        const imgSrc = `images/result_${photo.category || 'family'}/${photo.filename}`;
        div.innerHTML = `
            <img src="${imgSrc}" class="gallery-img" onerror="handleImageError(this)" onclick="openModal('${imgSrc}')">
            <div class="photo-info"><strong>${photo.theme || '제목 없음'}</strong><br>${photo.date || ''}</div>
        `;
        container.appendChild(div);
    });

    document.getElementById('totalPhotoCount').innerText = `총 : ${listToRender.length} 장`;
    displayPagination(listToRender.length);
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const results = filteredList.filter(p => (p.theme || '').toLowerCase().includes(query) || (p.date || '').toLowerCase().includes(query));
    renderGallery(1, results);
}

// [수정] 서브 카테고리 필터링 (현재 필터에 상관없이 전체에서 찾기)
function filterBySubCategory(subCat) {
    // 1. URL 파라미터를 'friend'로 강제 변경 (화면 제목 등을 맞추기 위해)
    const newUrl = window.location.pathname + '?type=friend';
    window.history.pushState({ path: newUrl }, '', newUrl);
    
    // 2. 제목 업데이트
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = '🤝 친구 갤러리 (' + subCat + ')';

    // 3. rawData(전체 데이터)에서 해당 서브 카테고리 키워드 찾기
    const rawData = (typeof photoData !== 'undefined') ? photoData : [];
    
    // 전체 데이터를 펼쳐서(Flatten) 검색 대상을 만듭니다.
    let allExpanded = [];
    rawData.forEach(p => {
        if (p.images && Array.isArray(p.images)) {
            p.images.forEach(img => allExpanded.push({ ...p, filename: img, images: undefined }));
        } else if (p.filename) {
            allExpanded.push(p);
        }
    });

    // 4. 전체 데이터에서 subCat(동구회 등)이 포함된 것만 필터링
    const subResults = allExpanded.filter(p => 
        (p.theme || '').includes(subCat)
    );

    // 5. 결과 화면에 그리기
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
        btn.onclick = () => { renderGallery(target); window.scrollTo(0, 0); };
        return btn;
    };

    if (currentPage > 1) {
        pagination.appendChild(createBtn('≪', 1, 'nav-btn'));
        pagination.appendChild(createBtn('<', currentPage - 1, 'nav-btn'));
    }
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, Math.max(1, currentPage - 2) + 4); i++) {
        pagination.appendChild(createBtn(i, i, i === currentPage ? 'active' : ''));
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