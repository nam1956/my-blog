let currentPage = 1;
let filteredList = [];
let allExpandedData = []; // 검색을 위해 전체 데이터를 따로 보관합니다.
const ITEMS_PER_PAGE = 20;

// 1. 초기화 함수
function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type') || 'all';

    const rawData = (typeof photoData !== 'undefined') ? photoData : [];

    allExpandedData = [];
    rawData.forEach(p => {
        if (p.images && Array.isArray(p.images) && p.images.length > 0) {
            p.images.forEach(imgFilename => {
                allExpandedData.push({
                    ...p,
                    filename: imgFilename,
                    images: undefined
                });
            });
        } 
        else if (p.filename) {
            allExpandedData.push(p);
        }
    });

    // 필터링 로직
    filteredList = allExpandedData.filter(p => {
        const itemCategory = p.category || 'family'; 
        return (category === 'all') || (itemCategory === category);
    });

    // 제목 변경
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
    
    // 페이지네이션 함수 호출 (전체 개수 전달)
    displayPagination(listToRender.length);
}

// 3. 이미지 에러 처리 (대소문자 보정)
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

// 4. 페이지네이션 (검색 결과 연동형)
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

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === currentPage) btn.className = 'active';
        btn.onclick = () => {
            // 현재 검색어가 있다면 검색 결과 내에서 페이지 이동
            const query = document.getElementById('searchInput')?.value.trim().toLowerCase() || "";
            if (query) {
                const searchResults = filteredList.filter(photo => (photo.theme || '').toLowerCase().includes(query));
                renderGallery(i, searchResults);
            } else {
                renderGallery(i);
            }
            window.scrollTo(0, 0);
        };
        pagination.appendChild(btn);
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

// [추가된 기능] 검색 실행 함수
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.trim().toLowerCase();
    
    const searchResults = filteredList.filter(photo => {
        const theme = (photo.theme || '').toLowerCase();
        return theme.includes(query);
    });

    renderGallery(1, searchResults); 
}

// 6. 모든 이벤트 리스너 통합 (DOMContentLoaded)
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