let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

function init() {
    const path = window.location.pathname;
    
    if (path.includes('gallery')) {
        // --- 수정된 부분: URL 파라미터(?type=...)에서 카테고리 읽기 ---
        const params = new URLSearchParams(window.location.search);
        let category = params.get('type') || 'all'; 
        
        filteredList = (category === 'all') ? photoData : photoData.filter(p => p.category === category);
        
        // 제목도 카테고리에 맞춰 자동으로 바꿔주면 더 좋겠죠?
        const titleMap = {'hiking':'🏔️ 등반', 'family':'🏠 가족', 'friend':'🤝 친구', 'memory':'✨ 추억'};
        if(titleMap[category]) {
            const titleTag = document.querySelector('.main-title'); // 또는 h2
            if(titleTag) titleTag.innerText = `${titleMap[category]} 갤러리`;
        }

        displayPage(1);
    } else {
        // 메인 페이지 타이핑 효과 (기존 코드 유지)
        const target = document.querySelector(".typing-text");
        if(target) {
            let text = "소중한 순간들을 기록합니다.~";
            let i = 0;
            function type() { if(i < text.length) { target.innerHTML += text[i++]; setTimeout(type, 120); } }
            type();
        }
    }
}

function displayPage(page) {
    const gallery = document.querySelector('.gallery');
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
    document.getElementById('totalPhotoCount').innerText = `총 : ${filteredList.length} 장의 사진이 있습니다`;
}

// 🚩 1 ... 5 6 7 ... 32 줄임표 로직
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    if (!pagination || totalPages <= 1) return;
    pagination.innerHTML = '';

    const sidePages = 2; // 현재 페이지 좌우로 보여줄 개수
    const range = [];
    
    // 항상 보여줄 페이지 번호들을 계산
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||                          // 첫 페이지
            i === totalPages ||                 // 마지막 페이지
            (i >= currentPage - sidePages && i <= currentPage + sidePages) // 현재 페이지 주변
        ) {
            range.push(i);
        }
    }

    let last = 0;
    for (let i of range) {
        if (last > 0) {
            if (i - last === 2) {
                // 바로 다음 번호면 그냥 버튼 추가 (예: 1 다음에 2)
                addPageBtn(last + 1, pagination);
            } else if (i - last > 2) {
                // 간격이 2보다 크면 줄임표 추가 (예: 1 다음에 ... 다음에 5)
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
    btn.onclick = () => { displayPage(num); window.scrollTo(0, 0); };
    container.appendChild(btn);
}

function openModal(src) {
    const m = document.getElementById("imageModal");
    const mi = document.getElementById("imgFull");
    if(m && mi) { m.style.display = "flex"; mi.src = src; }
}

window.onclick = (e) => { 
    const m = document.getElementById("imageModal");
    if (e.target === m) m.style.display = "none"; 
}

document.addEventListener('DOMContentLoaded', init);

// 검색창 이벤트 연결 (실시간 필터링)
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput') {
        const searchTerm = e.target.value.toLowerCase();
        
        // --- 수정된 부분: 주소창 파라미터 확인 ---
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