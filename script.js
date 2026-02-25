// [기본 설정]
let currentPage = 1;      // 현재 페이지
let filteredList = [];    // 검색/카테고리에 걸러진 최종 목록

// 1. 페이지당 개수 결정 (요청하신 대로 20장 고정)
function getItemsPerPage() {
    return 20; 
}

// 2. 초기 실행 함수
// [수정] 메인 페이지 판단 로직 통합
function checkAndStartEffect() {
    const path = window.location.pathname;
    const typingElement = document.querySelector(".typing-text");

    // 1. 주소에 gallery가 없거나, index.html이 포함되어 있거나, typing-text 요소가 존재하면 메인으로 간주
    if (!path.includes('gallery') || path.includes('index.html') || typingElement) {
        if (typeof startTypingEffect === 'function') {
            startTypingEffect();
        }
        // 메인에서는 갤러리를 그리지 않도록 강제 종료
        const gallery = document.querySelector('.gallery');
        if (gallery) gallery.style.display = 'none'; 
        return; 
    }

    // 2. 갤러리 페이지 로직 (기존 카테고리 판별 코드)
    setupGalleryPage(path);
}

// 브라우저가 HTML 문서만 다 읽으면 바로 실행 (onload보다 빠르고 확실함)
document.addEventListener('DOMContentLoaded', checkAndStartEffect);

// 혹시 몰라서 기존 onload도 유지 (두 번 실행 방지는 내부적으로 처리됨)
window.onload = checkAndStartEffect;

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