// script_new.js

let currentPage = 1;      // 현재 페이지
const photosPerPage = 8;  // 한 페이지에 보여줄 사진 수
let filteredList = [];    // 검색/카테고리에 걸러진 최종 목록

// 1. 초기 실행 함수
window.onload = () => {
    const path = window.location.pathname;
    let category = 'all';
    if (path.includes('hiking')) category = 'hiking';
    else if (path.includes('family')) category = 'family';
    else if (path.includes('friend')) category = 'friend';
    else if (path.includes('memory')) category = 'memory';

    // 카테고리에 맞는 데이터만 먼저 추출
    filteredList = (category === 'all') 
        ? photoData 
        : photoData.filter(p => p.category === category);

    displayPage(1); // 1페이지 보여주기
};

// 2. 검색 처리 함수
function handleSearch() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    
    // 현재 카테고리 내에서 검색어 필터링
    const path = window.location.pathname;
    let category = 'all';
    if (path.includes('hiking')) category = 'hiking';
    else if (path.includes('family')) category = 'family';
    else if (path.includes('friend')) category = 'friend';
    else if (path.includes('memory')) category = 'memory';

    filteredList = photoData.filter(p => {
        const isCategory = (category === 'all' || p.category === category);
        const isMatch = p.title.toLowerCase().includes(term) || 
                        p.date.includes(term) || 
                        p.tags.toLowerCase().includes(term);
        return isCategory && isMatch;
    });

    displayPage(1); // 검색 결과의 1페이지부터 보여줌
}

// 3. 페이지별 사진 출력 함수
function displayPage(page) {
    currentPage = page;
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    // 시작 인덱스와 끝 인덱스 계산 (예: 1페이지면 0~7번 사진)
    const start = (page - 1) * photosPerPage;
    const end = start + photosPerPage;
    const pageItems = filteredList.slice(start, end);

    pageItems.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        div.innerHTML = `
            <img src="images/${photo.filename}" class="gallery-img" onclick="openModal('images/${photo.filename}')">
            <div class="photo-info">
                <strong>${photo.title}</strong><br><span>${photo.date}</span>
            </div>
        `;
        gallery.appendChild(div);
    });

    renderPagination(); // 하단 버튼 다시 그리기
}

// 4. 페이지네이션 버튼 생성 함수
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredList.length / photosPerPage);
    if (totalPages <= 1) return; // 1페이지뿐이면 버튼 안 만듦

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = (i === currentPage) ? 'active' : '';
        btn.onclick = () => {
            displayPage(i);
            window.scrollTo(0, 0); // 페이지 이동 시 상단으로 이동
        };
        pagination.appendChild(btn);
    }
}