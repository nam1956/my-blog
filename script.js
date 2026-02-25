// [기본 설정]
let currentPage = 1;      // 현재 페이지
let filteredList = [];    // 검색/카테고리에 걸러진 최종 목록

// 1. 페이지당 개수 결정 (요청하신 대로 20장 고정)
function getItemsPerPage() {
    return 20; 
}

// 2. 초기 실행 함수
window.onload = () => {
    const path = window.location.pathname;
    
    // [추가] 메인 인덱스 페이지인 경우 사진을 그리지 않고 타이핑 효과만 실행
    // 파일명이 index.html이거나 경로가 끝나는 지점을 체크합니다.
    if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
        startTypingEffect();
        return; // 여기서 함수 종료 (하단 사진 그리기 방지)
    }

    // 갤러리 페이지일 경우 카테고리 판별
    let category = 'all';
    if (path.includes('hiking')) category = 'hiking';
    else if (path.includes('family')) category = 'family';
    else if (path.includes('friend')) category = 'friend';
    else if (path.includes('memory')) category = 'memory';

    // 데이터 필터링
    filteredList = (category === 'all') 
        ? photoData 
        : photoData.filter(p => p.category === category);

    displayPage(1); // 1페이지 보여주기
};

// 3. 메인 페이지 타이핑 효과 함수
function startTypingEffect() {
    const text = "소중한 순간들을 기록합니다.~";
    const typingElement = document.querySelector(".typing-text");
    
    if (typingElement) {
        let index = 0;
        typingElement.innerHTML = ""; // 초기화

        function typeWriter() {
            if (index < text.length) {
                typingElement.innerHTML += text.charAt(index);
                index++;
                setTimeout(typeWriter, 150); // 타이핑 속도
            }
        }
        
        // 제목 애니메이션(style.css)이 어느 정도 진행된 후 시작
        setTimeout(typeWriter, 800);
    }
}

// 4. 검색 처리 함수
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if(!searchInput) return;
    
    const term = searchInput.value.toLowerCase();
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

    displayPage(1);
}

// 5. 페이지별 사진 출력 함수
function displayPage(page) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return; // 갤러리 요소가 없으면(메인페이지 등) 중단

    currentPage = page;
    const photosPerPage = getItemsPerPage(); 

    const totalCountElement = document.getElementById('totalPhotoCount');
    if (totalCountElement) {
        totalCountElement.innerText = `총 ${filteredList.length}장의 사진이 있습니다`;
    }

    gallery.innerHTML = '';

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

    renderPagination(photosPerPage); 
}

// 6. 페이지네이션 버튼 생성 함수
function renderPagination(photosPerPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredList.length / photosPerPage);
    if (totalPages <= 1) return;

    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
        addPageButton(1, pagination);
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.innerText = '...';
            pagination.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, pagination, i === currentPage);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.innerText = '...';
            pagination.appendChild(dots);
        }
        addPageButton(totalPages, pagination);
    }
}

function addPageButton(pageNumber, container, isActive = false) {
    const btn = document.createElement('button');
    btn.innerText = pageNumber;
    if (isActive) btn.className = 'active';
    btn.onclick = () => {
        displayPage(pageNumber);
        window.scrollTo(0, 0);
    };
    container.appendChild(btn);
}

// 7. 모달창 제어 함수
function openModal(imgSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("imgFull");
    if(modal && modalImg) {
        modal.style.display = "block";
        modalImg.src = imgSrc;
    }
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    // 닫기 버튼 설정
    const closeBtn = document.querySelector(".close");
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById("imageModal").style.display = "none";
        }
    }

    // 모달 바깥 클릭 설정
    window.onclick = (event) => {
        const modal = document.getElementById("imageModal");
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

// 브라우저 리사이즈 시 갤러리 재정렬 (메인페이지가 아닐 때만)
window.addEventListener('resize', () => {
    const path = window.location.pathname;
    if (!path.endsWith('index.html') && path !== '/' && path !== '') {
        displayPage(currentPage); 
    }
});