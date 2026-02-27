let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

function init() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type') || 'all'; 

    // 1. 갤러리 페이지 로직 (?type= 이 있거나 파일명이 gallery인 경우)
    if (path.includes('gallery') || params.has('type')) {
        
        // 데이터 필터링
        filteredList = (category === 'all') ? photoData : photoData.filter(p => p.category === category);
        
        // 제목 변경 (HTML에 있는 id="gallery-title"을 찾음)
        const titleMap = {
            'hiking': '🏔️ 등반 갤러리', 
            'family': '🏠 가족 갤러리', 
            'friend': '🤝 친구 갤러리', 
            'memory': '✨ 추억 저장소'
        };
        
        const titleTag = document.getElementById('gallery-title');
        if (titleTag && titleMap[category]) {
            titleTag.innerText = titleMap[category];
        }

        displayPage(1);
    } 
    
    // 2. 메인 페이지 로직 (타이핑 효과)
    // path가 '/' 이거나 'index.html'인 경우, 혹은 gallery가 아닌 경우
    if (!path.includes('gallery')) {
        const target = document.querySelector(".typing-text");
        if(target) {
            target.innerHTML = ""; // 기존 내용 초기화
            let text = "소중한 순간들을 기록합니다.~";
            let i = 0;
            function type() { 
                if(i < text.length) { 
                    target.innerHTML += text[i++]; 
                    setTimeout(type, 120); 
                } 
            }
            type();
        }
    }
}

function displayPage(page) {
    const gallery = document.querySelector('.gallery');
    const totalCountTag = document.getElementById('totalPhotoCount');
    
    if (!gallery) return;
    
    currentPage = page;
    gallery.innerHTML = '';
    
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    filteredList.slice(start, end).forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        div.innerHTML = `
            <img src="images/${photo.filename}" class="gallery-img" onclick="openModal('images/${photo.filename}')">
            <div class="photo-info"><strong>${photo.title}</strong><br><span>${photo.date}</span></div>
        `;
        gallery.appendChild(div);
    });
    
    renderPagination();
    
    // 수량 표시 업데이트
    if (totalCountTag) {
        totalCountTag.innerText = `총 : ${filteredList.length} 장의 사진이 있습니다`;
    }
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    if (!pagination || totalPages <= 1) {
        if(pagination) pagination.innerHTML = ''; // 페이지가 1개면 안보이게
        return;
    }
    pagination.innerHTML = '';

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
            if (i - last === 2) {
                addPageBtn(last + 1, pagination);
            } else if (i - last > 2) {
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
    btn.onclick = () => { 
        displayPage(num); 
        window.scrollTo({top: 0, behavior: 'smooth'}); 
    };
    container.appendChild(btn);
}

function openModal(src) {
    const m = document.getElementById("imageModal");
    const mi = document.getElementById("imgFull");
    if(m && mi) { 
        m.style.display = "flex"; 
        mi.src = src; 
    }
}

// 모달 닫기 기능 (엑스 버튼 및 배경 클릭)
function closeModal() {
    const m = document.getElementById("imageModal");
    if(m) m.style.display = "none";
}

window.onclick = (e) => { 
    const m = document.getElementById("imageModal");
    if (e.target === m) closeModal(); 
}

// 실시간 검색 이벤트
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput') {
        const searchTerm = e.target.value.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        const category = params.get('type') || 'all';

        const baseList = (category === 'all') ? photoData : photoData.filter(p => p.category === category);
        
        filteredList = baseList.filter(photo => 
            photo.title.toLowerCase().includes(searchTerm) || 
            photo.date.includes(searchTerm)
        );

        displayPage(1);
    }
});

document.addEventListener('DOMContentLoaded', init);