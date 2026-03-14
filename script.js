let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

// 1. 초기화 함수
function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type') || 'all';

    const rawData = (typeof photoData !== 'undefined') ? photoData : [];

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

    filteredList = expandedData.filter(p => {
        const itemCategory = p.category || 'family'; 
        return (category === 'all') || (itemCategory === category);
    });

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

// 2. 갤러리 화면 그리기 (검색 리스트 대응 가능하도록 수정)
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
            <img src="${imgSrc}" 
                 class="gallery-img" 
                 onerror="handleImageError(this)">
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
    displayPagination(listToRender.length); // 개수를 전달하여 페이지네이션 호출
}

// [수정] 제목(theme) + 날짜(date) 모두 검색 가능하게 업그레이드!
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.trim().toLowerCase();
    
    const searchResults = filteredList.filter(photo => {
        const theme = (photo.theme || '').toLowerCase();
        const date = (photo.date || '').toLowerCase(); // 날짜 정보 가져오기
        
        // 제목에 포함되어 있거나, 날짜에 포함되어 있으면 결과에 포함!
        return theme.includes(query) || date.includes(query);
    });

    renderGallery(1, searchResults); 
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

// 4. 페이지네이션 (10개씩 표시 및 처음/끝 이동 추가)
function displayPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    // 설정: 한 번에 보여줄 숫자 버튼 개수 (5개가 가장 깔끔합니다)
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // [함수] 버튼 생성 공통 로직
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

    // 1. [처음] & [이전] 버튼
    if (currentPage > 1) {
        pagination.appendChild(createBtn('≪', 1, 'nav-btn')); // 맨 처음
        pagination.appendChild(createBtn('<', currentPage - 1, 'nav-btn')); // 이전 한 페이지
    }

    // 2. 숫자 버튼들
    for (let i = startPage; i <= endPage; i++) {
        const btn = createBtn(i, i, i === currentPage ? 'active' : '');
        pagination.appendChild(btn);
    }

    // 3. [다음] & [끝] 버튼
    if (currentPage < totalPages) {
        pagination.appendChild(createBtn('>', currentPage + 1, 'nav-btn')); // 다음 한 페이지
        pagination.appendChild(createBtn('≫', totalPages, 'nav-btn')); // 맨 끝
    }
}

// 5. 모달 열기
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

// 6. 모든 이벤트 리스너 통합
document.addEventListener('DOMContentLoaded', () => {
    init();

    // [중요] 검색창 엔터키 이벤트 추가
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