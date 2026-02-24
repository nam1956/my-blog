// script.js

let currentPage = 1;      // 현재 페이지
// 화면 너비에 따라 페이지당 개수를 유동적으로 결정
function getItemsPerPage() {
    const width = window.innerWidth;

    if (width >= 1024) return 10; // 가로 5장씩 2줄
    if (width >= 768) return 8;   // 가로 4장씩 2줄
    return 6;                     // 가로 3장씩 2줄 (모바일)
}
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

// [추가] 화면 너비에 따라 페이지당 사진 개수를 결정하는 도우미 함수
function getItemsPerPage() {
    const width = window.innerWidth;
    if (width >= 1024) {
        return 10; // 노트북 (5열 2행)
    } else if (width >= 768) {
        return 8;  // 태블릿 (4열 2행) -> 이 부분이 8인지 확인하세요!
    } else {
        return 6;  // 모바일 (3열 2행)
    }
}

// 3. 페이지별 사진 출력 함수 (수정본)
function displayPage(page) {
    currentPage = page;

    // 🚩 [수정] 고정된 숫자 대신 현재 화면 크기에 맞는 개수를 가져옵니다.
    const photosPerPage = getItemsPerPage(); 

    const totalCountElement = document.getElementById('totalPhotoCount');
    if (totalCountElement) {
        totalCountElement.innerText = `총 ${filteredList.length}장의 사진이 있습니다`;
    }

    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    // 시작 인덱스와 끝 인덱스 계산
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

    // 🚩 [중요] 하단 버튼을 그릴 때도 변하는 photosPerPage 값을 전달해야 합니다.
    // 만약 renderPagination 함수가 내부에서 직접 photosPerPage를 쓰고 있다면, 
    // 그 함수 안에서도 getItemsPerPage()를 호출하도록 수정이 필요할 수 있습니다.
    renderPagination(photosPerPage); 
}

// [추가] 브라우저 창 크기를 조절할 때 실시간으로 반영되게 하고 싶다면 이 코드를 제일 밑에 넣으세요.
window.addEventListener('resize', () => {
    displayPage(1); 
});

// 4. 페이지네이션 버튼 생성 함수 (가변 개수 대응 수정본)
function renderPagination(photosPerPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return; // 페이지네이션 요소가 없으면 중단
    pagination.innerHTML = '';

    // [수정] 이제 매개변수로 받은 photosPerPage를 사용하여 총 페이지 계산
    const totalPages = Math.ceil(filteredList.length / photosPerPage);
    if (totalPages <= 1) return; // 1페이지뿐이면 버튼 안 만듦

    const maxButtons = 5; // 한 번에 보여줄 숫자 버튼 개수
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // 마지막 페이지 근처일 때 시작 페이지 조정
    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // [처음으로] 버튼 세트
    if (startPage > 1) {
        addPageButton(1, pagination);
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.innerText = '...';
            pagination.appendChild(dots);
        }
    }

    // 숫자 버튼들
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, pagination, i === currentPage);
    }

    // [끝으로] 버튼 세트
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.innerText = '...';
            pagination.appendChild(dots);
        }
        addPageButton(totalPages, pagination);
    }
}

// 5. 버튼 생성을 도와주는 보조 함수
function addPageButton(pageNumber, container, isActive = false) {
    const btn = document.createElement('button');
    btn.innerText = pageNumber;
    if (isActive) btn.className = 'active';
    btn.onclick = () => {
        displayPage(pageNumber); // 클릭 시 다시 displayPage 호출
        window.scrollTo(0, 0);   // 페이지 이동 시 상단으로 스크롤
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

// 창 크기가 바뀔 때마다 사진을 다시 그려주는 마법의 주문
window.addEventListener('resize', () => {
    displayPage(1); 
});