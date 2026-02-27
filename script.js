let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type');
    const path = window.location.pathname;

    // [체크] 갤러리 페이지인지 확인 (URL 파라미터 우선)
    if (category || path.includes('gallery')) {
        const activeCategory = category || 'all';
        
        // 1. 카테고리 필터링 (data.js의 photoData 기준)
        filteredList = (activeCategory === 'all') 
            ? photoData 
            : photoData.filter(p => p.category === activeCategory);

        // 2. 제목 변경 (titleMap)
        const titleMap = {
            'hiking': '🏔️ 등반 사진첩',
            'family': '🏠 가족 갤러리',
            'friend': '🤝 친구 갤러리',
            'memory': '✨ 추억 저장소'
        };
        const titleTag = document.getElementById('gallery-title');
        if (titleTag) {
            titleTag.innerText = titleMap[activeCategory] || '나의 인생 갤러리';
        }

        displayPage(1);
    } 
    // [체크] 메인 페이지 (index) 타이핑 효과
    else {
        const target = document.querySelector(".typing-text");
        if (target) {
            target.innerHTML = "";
            let text = "소중한 순간들을 기록합니다.~";
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
        div.innerHTML = `
            <img src="images/${photo.filename}" class="gallery-img" onclick="openModal('images/${photo.filename}')">
            <div class="photo-info">
                <strong>${photo.title}</strong><br>
                <span>${photo.date}</span>
            </div>
        `;
        galleryContainer.appendChild(div);
    });
    
    // 수량 업데이트
    if (totalCountTag) {
        totalCountTag.innerText = `총 : ${filteredList.length} 장의 사진이 있습니다`;
    }
    renderPagination();
}

// [핵심] 줄임표가 포함된 페이지네이션 로직
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    if (!pagination) return;
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    const sidePages = 2; 
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - sidePages && i <= currentPage + sidePages)) {
            range.push(i);
        }
    }

    let last = 0;
    for (let i of range) {
        if (last > 0) {
            if (i - last === 2) { addPageBtn(last + 1, pagination); } 
            else if (i - last > 2) {
                const dots = document.createElement('span');
                dots.innerText = "...";
                dots.className = "dots";
                pagination.appendChild(dots);
            }
        }
        addPageBtn(i, pagination);
        last = i;
    }
}

function addPageBtn(num, container) {
    const btn = document.createElement('button');
    btn.innerText = num;
    if (num === currentPage) btn.className = 'active';
    btn.onclick = () => { displayPage(num); window.scrollTo({top: 0, behavior: 'smooth'}); };
    container.appendChild(btn);
}

function openModal(src) {
    const m = document.getElementById("imageModal");
    const mi = document.getElementById("imgFull");
    if (m && mi) { m.style.display = "flex"; mi.src = src; }
}

function closeModal() {
    const m = document.getElementById("imageModal");
    if (m) m.style.display = "none";
}

window.onclick = (e) => { 
    const m = document.getElementById("imageModal");
    if (e.target === m) closeModal(); 
}

// 실시간 검색
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput') {
        const searchTerm = e.target.value.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        const category = params.get('type') || 'all';

        const baseList = (category === 'all') ? photoData : photoData.filter(p => p.category === category);
        filteredList = baseList.filter(photo => 
            photo.title.toLowerCase().includes(searchTerm) || photo.date.includes(searchTerm)
        );
        displayPage(1);
    }
});

document.addEventListener('DOMContentLoaded', init);