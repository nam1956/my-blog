let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

// [1] 초기화: 메인화면 타이핑 효과 또는 갤러리 사진 불러오기
function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type');
    const path = window.location.pathname;

    if (category || path.includes('gallery')) {
        const activeCategory = category || 'all';
        
        filteredList = (activeCategory === 'all') 
            ? photoData 
            : photoData.filter(p => p.category === activeCategory);

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

// [2] 사진 출력: 화면에 사진 격자 생성 (경로 수정 완료)
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
        
        // ★ 핵심 수정: images 폴더 안의 result_ 폴더를 가리키도록 변경 ★
        const folderPath = `images/result_${photo.category}`;
        const imgSrc = `${folderPath}/${photo.filename}`;

        div.innerHTML = `
            <img src="${imgSrc}" class="gallery-img" onclick="openModal('${imgSrc}')" onerror="this.src='https://via.placeholder.com/200?text=No+Image'">
            <div class="photo-info"><strong>${photo.theme}</strong><br><span>${photo.date}</span></div>
        `;
        galleryContainer.appendChild(div);
    });
    
    if (totalCountTag) totalCountTag.innerText = `총 : ${filteredList.length} 장의 사진이 있습니다`;
    renderPagination();
}

// [3] 페이지네이션 (기존과 동일)
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

// [4] 모달 및 드래그 (기존과 동일)
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

function openModal(src) {
    const m = document.getElementById("imageModal");
    const mi = document.getElementById("imgFull");
    if (m && mi) { 
        m.style.display = "flex"; 
        mi.src = src; 
        mi.classList.remove('full-size'); 
        m.scrollLeft = 0;
        m.scrollTop = 0;
    }
}

function closeModal() {
    document.getElementById("imageModal").style.display = "none";
}

const imgFull = document.getElementById('imgFull');
const modal = document.getElementById('imageModal');

if(imgFull && modal) {
    imgFull.addEventListener('click', function(e) {
        e.stopPropagation(); 
        const isFull = this.classList.toggle('full-size');
        if(!isFull) {
            modal.scrollLeft = 0;
            modal.scrollTop = 0;
        }
    });

    imgFull.addEventListener('mousedown', (e) => {
        if (!imgFull.classList.contains('full-size')) return;
        isDragging = true;
        imgFull.style.cursor = 'grabbing';
        startX = e.clientX; 
        startY = e.clientY;
        scrollLeft = modal.scrollLeft;
        scrollTop = modal.scrollTop;
    });
}

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const walkX = e.clientX - startX;
    const walkY = e.clientY - startY;
    modal.scrollLeft = scrollLeft - walkX;
    modal.scrollTop = scrollTop - walkY;
});

window.addEventListener('mouseup', () => { isDragging = false; if(imgFull) imgFull.style.cursor = 'zoom-in'; });
window.onclick = (e) => { if (e.target === modal) closeModal(); }

// [5] 검색 기능 (기존과 동일)
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