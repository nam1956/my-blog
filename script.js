let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

// 1. 초기화 함수
function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type') || 'all';

    const rawData = (typeof photoData !== 'undefined') ? photoData : [];

    // 데이터 평탄화 (여러 장의 이미지를 각각의 아이템으로 분리)
    let expandedData = [];
    rawData.forEach(p => {
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
            p.images.forEach(imgFilename => {
                expandedData.push({
                    ...p,
                    filename: imgFilename,
                    images: undefined
                });
            });
        } 
        else if (p.filename) {
            expandedData.push(p);
        }
    });

    // 왼쪽 메뉴 수량 표시 업데이트 (평탄화된 전체 데이터 기준)
    updateMenuCounts(expandedData);

    // 현재 카테고리에 맞는 리스트 필터링
    filteredList = expandedData.filter(p => {
        const itemCategory = p.category || 'family'; 
        return (category === 'all') || (itemCategory === category);
    });

    // 상단 제목 변경
    const titleMap = {
        'family': '🏠 가족 갤러리',
        'hiking': '⛰️ 등반 사진첩',
        'friend': '🤝 친구 갤러리',
        'interest': '💡 관심 저장소',
        'travel': '✈️ 여행 기록',
        'memory': '🕰️ 소중한 추억'
    };
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = titleMap[category] || '나의 인생 갤러리';

    renderGallery(1);
}

// [신규] 왼쪽 메뉴 옆에 사진 수량 자동 표시
function updateMenuCounts(allData) {
    const categories = ['family', 'hiking', 'friend', 'travel', 'interest', 'memory'];
    
    categories.forEach(cat => {
        const count = allData.filter(p => (p.category || 'family') === cat).length;
        const menuLink = document.querySelector(`.side-menu a[href*="type=${cat}"]`);
        if (menuLink) {
            // 기존 텍스트(아이콘+이름)만 추출하고 뒤에 숫자 결합
            const baseText = menuLink.innerText.split(' (')[0]; 
            menuLink.innerText = `${baseText} (${count})`;
        }
    });
}

// 2. 갤러리 화면 그리기
function renderGallery(page, listToRender = filteredList) {
    const galleryContainer = document.querySelector('.gallery');
    const totalCountTag = document.getElementById('totalPhotoCount');
    if (!galleryContainer) return;
    
    currentPage = page;
    galleryContainer.innerHTML = '';
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    const displayList = listToRender.slice(start, end);

    displayList.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        
        const cat = photo.category || 'family';
        const folderPath = `images/result_${cat}`;
        const imgSrc = `${folderPath}/${photo.filename}`;

        div.innerHTML = `
            <img src="${imgSrc}" class="gallery-img" onerror="handleImageError(this)">
            <div class="photo-info">
                <strong>${photo.theme || '제목 없음'}</strong><br>
                <span>${photo.date || ''}</span>
            </div>
        `;
        
        const img = div.querySelector('img');
        if (img) {
            img.onclick = function() { openModal(img.src); };
        }
        galleryContainer.appendChild(div);
    });
    
    if (totalCountTag) totalCountTag.innerText = `총 : ${listToRender.length} 장의 사진이 있습니다`;
    displayPagination(listToRender.length);
}

// [검색] 제목 + 날짜 통합 검색
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.trim().toLowerCase();
    
    const searchResults = filteredList.filter(photo => {
        const theme = (photo.theme || '').toLowerCase();
        const date = (photo.date || '').toLowerCase();
        return theme.includes(query) || date.includes(query);
    });

    renderGallery(1, searchResults); 
}

// [신규] 서브 카테고리(동구회, 동보회 등) 필터링
function filterBySubCategory(subCat) {
    const subResults = filteredList.filter(photo => 
        (photo.theme || '').includes(subCat)
    );
    renderGallery(1, subResults);
}

// 3. 이미지 에러 처리
function handleImageError(image) {
    if (image.dataset.tried === "2") return;
    let currentSrc = image.src;
    
    if (!image.dataset.tried) {
        image.dataset.tried = "1";
        if (currentSrc.toLowerCase().endsWith('.jpg')) image.src = currentSrc.replace(/\.jpg/i, '.JPG');
        else if (currentSrc.toLowerCase().endsWith('.png')) image.src = currentSrc.replace(/\.png/i, '.PNG');
    } else {
        image.dataset.tried = "2";
        image.src = 'https://via.placeholder.com/200?text=Image+Not+Found';
    }
}

// 4. 페이지네이션 (개선된 화살표 버전)
function displayPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    const createBtn = (text, targetPage, className = '') => {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        if (className) btn.className = className;
        btn.onclick = () => {
            const query = document.getElementById('searchInput')?.value.trim().toLowerCase() || "";
            if (query) {
                const results = filteredList.filter(p => 
                    (p.theme || '').toLowerCase().includes(query) || (p.date || '').toLowerCase().includes(query)
                );
                renderGallery(targetPage, results);
            } else {
                renderGallery(targetPage);
            }
            window.scrollTo(0, 0);
        };
        return btn;
    };

    if (currentPage > 1) {
        pagination.appendChild(createBtn('≪', 1, 'nav-btn'));
        pagination.appendChild(createBtn('<', currentPage - 1, 'nav-btn'));
    }

    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createBtn(i, i, i === currentPage ? 'active' : ''));
    }

    if (currentPage < totalPages) {
        pagination.appendChild(createBtn('>', currentPage + 1, 'nav-btn'));
        pagination.appendChild(createBtn('≫', totalPages, 'nav-btn'));
    }
}

// 5. 모달 제어
function openModal(imgSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("imgFull");
    if (modal && modalImg) {
        modal.style.display = "flex"; 
        modalImg.src = imgSrc;
        modalImg.classList.remove('full-size');
        modalImg.style.cursor = 'zoom-in';
    }
}

// 6. 이벤트 통합
document.addEventListener('DOMContentLoaded', () => {
    init();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.onkeyup = function(e) {
            if (e.key === 'Enter') performSearch();
        };
    }

    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("imgFull");
    const closeBtn = document.querySelector(".close");

    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
            if (modalImg) modalImg.classList.remove('full-size');
        };
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            if (modalImg) modalImg.classList.remove('full-size');
        }
    };

    if (modalImg) {
        modalImg.onclick = function() {
            this.classList.toggle('full-size');
            this.style.cursor = this.classList.contains('full-size') ? 'zoom-out' : 'zoom-in';
        };
    }
});