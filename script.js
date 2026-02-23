// script.js

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
    // 🚩 바로 여기에 이 한 줄을 끼워 넣으세요!
    document.getElementById('totalPhotoCount').innerText = `총 ${filteredList.length}장의 사진이 있습니다`;
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

/// 4. 페이지네이션 버튼 생성 함수 (슬라이딩 윈도우 방식)
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredList.length / photosPerPage);
    if (totalPages <= 1) return; // 1페이지뿐이면 버튼 안 만듦

    const maxButtons = 5; // 현재 페이지 주변에 보여줄 숫자의 개수 (예: 5개씩)
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // 마지막 페이지 근처일 때 시작 페이지 조정 (항상 5개가 보이도록)
    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // [처음으로] + [첫 페이지] 버튼
    if (startPage > 1) {
        addPageButton(1, pagination);
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.innerText = '...';
            pagination.appendChild(dots);
        }
    }

    // 숫자 버튼들 (startPage부터 endPage까지)
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, pagination, i === currentPage);
    }

    // [마지막 페이지] + [끝으로] 버튼
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.innerText = '...';
            pagination.appendChild(dots);
        }
        addPageButton(totalPages, pagination);
    }
}

// 버튼 생성을 도와주는 보조 함수 (renderPagination 내부에서 사용)
function addPageButton(pageNumber, container, isActive = false) {
    const btn = document.createElement('button');
    btn.innerText = pageNumber;
    if (isActive) btn.className = 'active';
    btn.onclick = () => {
        displayPage(pageNumber);
        window.scrollTo(0, 0); // 페이지 이동 시 상단으로 스크롤
    };
    container.appendChild(btn);
}

// 사진을 크게 보여주는 함수
function openModal(imgSrc) {
    const modal = document.getElementById("imageModal"); // HTML의 ID와 일치시킴
    const modalImg = document.getElementById("imgFull"); // HTML의 ID와 일치시킴
    
    modal.style.display = "block";
    modalImg.src = imgSrc;
}

// 닫기 버튼 클릭 시 모달 닫기
document.querySelector(".close").onclick = function() {
    document.getElementById("imageModal").style.display = "none";
}

// 모달 바깥쪽(배경) 클릭 시 모달 닫기
window.onclick = function(event) {
    const modal = document.getElementById("imageModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}