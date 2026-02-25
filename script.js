let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

function init() {
    const path = window.location.pathname;
    // 갤러리 페이지인지 확인
    if (path.includes('gallery')) {
        let category = 'all';
        if (path.includes('hiking')) category = 'hiking';
        else if (path.includes('family')) category = 'family';
        else if (path.includes('friend')) category = 'friend';
        else if (path.includes('memory')) category = 'memory';
        
        filteredList = (category === 'all') ? photoData : photoData.filter(p => p.category === category);
        displayPage(1);
    } else {
        // 메인 페이지 타이핑 효과
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

    const delta = 2; // 현재 페이지 좌우로 보여줄 개수
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }

    let last;
    for (let i of range) {
        if (last) {
            if (i - last === 2) { 
                addPageBtn(last + 1, pagination); 
            } else if (i - last !== 1) {
                const dots = document.createElement('span');
                dots.innerText = "..."; dots.className = "dots";
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
        
        // 현재 카테고리 내에서 검색어로 필터링
        const category = window.location.pathname.includes('hiking') ? 'hiking' :
                         window.location.pathname.includes('family') ? 'family' :
                         window.location.pathname.includes('friend') ? 'friend' :
                         window.location.pathname.includes('memory') ? 'memory' : 'all';

        const baseList = (category === 'all') ? photoData : photoData.filter(p => p.category === category);
        
        // 제목이나 날짜에 검색어가 포함된 것만 추출
        filteredList = baseList.filter(photo => 
            photo.title.toLowerCase().includes(searchTerm) || 
            photo.date.includes(searchTerm)
        );

        // 검색 후 무조건 1페이지부터 다시 보여줌
        displayPage(1);
    }
});