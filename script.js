let currentPage = 1;
let filteredList = []; // 카테고리별 기본 리스트
let currentDisplayList = []; // [중요] 현재 화면에 실제로 나오고 있는 리스트 (동보회 등 검색 결과 포함)
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

    // 1. 왼쪽 메뉴 수량 표시 업데이트
    updateMenuCounts(expandedData);

    // 2. 카테고리 필터링 (기본값 설정)
    filteredList = expandedData.filter(p => (category === 'all') || (p.category || 'family') === category);

    // 3. 제목 설정
    const titleMap = { family: '🏠 가족', hiking: '⛰️ 등반', friend: '🤝 친구', interest: '💡 관심', travel: '✈️ 여행', memory: '🕰️ 추억' };
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = (titleMap[category] || '나의 인생') + ' 갤러리';

    // 4. 처음 시작할 때는 필터링된 기본 리스트를 보여줌
    renderGallery(1, filteredList);
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

// [핵심 수정] renderGallery가 호출될 때 보던 리스트를 기억하도록 변경
function renderGallery(page, listToRender = null) {
    const container = document.querySelector('.gallery');
    if (!container) return;
    
    // 만약 새로운 리스트(동보회 등)가 들어오면 그걸 기억하고, 
    // 페이지 번호만 들어오면 기존에 기억하던 리스트를 그대로 씁니다.
    if (listToRender !== null) {
        currentDisplayList = listToRender;
    }
    
    currentPage = page;
    container.innerHTML = '';
    
    // 현재 보여줘야 할 리스트(currentDisplayList)에서 20개씩 자르기
    const displayList = currentDisplayList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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

    document.getElementById('totalPhotoCount').innerText = `총 : ${currentDisplayList.length} 장`;
    displayPagination(currentDisplayList.length);
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const results = filteredList.filter(p => (p.theme || '').toLowerCase().includes(query) || (p.date || '').toLowerCase().includes(query));
    renderGallery(1, results); // 검색 결과를 renderGallery에 전달
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
    renderGallery(1, subResults); // 동보회/동구회 결과를 renderGallery에 전달하여 고정시킴
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
        // 페이지 번호만 넘겨도 renderGallery가 보던 리스트를 기억해서 보여줍니다.
        btn.onclick = () => { renderGallery(target); window.scrollTo(0, 0); };
        return btn;
    };

    if (currentPage > 1) {
        pagination.appendChild(createBtn('≪', 1, 'nav-btn'));
        pagination.appendChild(createBtn('<', currentPage - 1, 'nav-btn'));
    }
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, Math.max(1, currentPage - 2) + 4); i++) {
        if (i > 0 && i <= totalPages) {
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