let currentPage = 1;
let filteredList = []; // 카테고리별 기본 리스트
let currentDisplayList = []; // [중요] 현재 화면에 표시 중인 리스트 (동보회 등 검색 결과 고정)
const ITEMS_PER_PAGE = 20;

let slideshowInterval = null;
let slideIndex = 0;
let isSlideshowPlaying = false;
let currentCategory = 'all'; // 카테고리 상태 (이어보기 저장 등에 활용)
let currentSubCategory = null; // 현재 선택된 하위 카테고리 (동구회 등)

// 🖼️ 이미지 드래그 패닝 전역 변수
let currentTranslateX = 0;
let currentTranslateY = 0;

function resetZoom() {
    const imgFull = document.getElementById("imgFull");
    if (imgFull) {
        currentTranslateX = 0;
        currentTranslateY = 0;
        imgFull.classList.remove('full-size');
        imgFull.style.transform = '';
        imgFull.style.cursor = 'zoom-in';
    }
}

function init() {
    const params = new URLSearchParams(window.location.search);
    currentCategory = params.get('type') || 'all';
    currentSubCategory = null; // 메인 카테고리 진입 시 하위 카테고리 초기화
    const category = currentCategory;
    const rawData = (typeof photoData !== 'undefined') ? photoData : [];

    let expandedData = [];
    rawData.forEach(p => {
        if (p.images && Array.isArray(p.images)) {
            p.images.forEach(img => expandedData.push({ ...p, filename: img, images: undefined }));
        } else if (p.filename) {
            expandedData.push(p);
        }
    });

    updateMenuCounts(expandedData);

    // 1. 카테고리에 맞는 기본 리스트 생성
    filteredList = expandedData.filter(p => (category === 'all') || (p.category || 'family') === category);

    const titleMap = { family: '🏠 가족', hiking: '⛰️ 등반', friend: '🤝 친구', interest: '💡 관심', travel: '✈️ 여행', memory: '🕰️ 추억' };
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = (titleMap[category] || '나의 인생') + ' 갤러리';

    // [수정] 초기화 시점에 filteredList를 currentDisplayList에 명시적으로 박아넣습니다.
    currentDisplayList = filteredList;
    renderGallery(1);
    setActiveMenu(); // 초기 진입 시 활성 메뉴 표시
}

function setActiveMenu() {
    document.querySelectorAll('.side-menu a').forEach(a => a.classList.remove('active-menu'));

    // 현재 URL 파라미터 체크
    const params = new URLSearchParams(window.location.search);
    const paramsType = params.get('type');

    if (currentCategory === 'all' && !paramsType) {
        // 홈 화면
        const homeLink = document.querySelector('.side-menu a[href="index.html"]');
        if (homeLink) homeLink.classList.add('active-menu');
    } else {
        // 해당 카테고리 탭
        const targetLink = document.querySelector(`.side-menu a[href*="type=${currentCategory}"]`);
        if (targetLink) targetLink.classList.add('active-menu');
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('sideMenu');
    if (menu) menu.classList.toggle('open');
}

function updateMenuCounts(allData) {
    const categories = ['family', 'hiking', 'friend', 'travel', 'interest', 'memory'];
    categories.forEach(cat => {
        const count = allData.filter(p => (p.category || 'family') === cat).length;
        const menuLink = document.querySelector(`.side-menu a[href*="type=${cat}"]`);
        if (menuLink) {
            let badge = menuLink.querySelector('.menu-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'menu-badge';
                menuLink.appendChild(badge);
            }
            badge.innerText = count;
        }
    });
}

// [수정] 인자 기본값을 삭제하여 꼬임을 방지합니다.
function renderGallery(page, listToRender) {
    const container = document.querySelector('.gallery') || document.querySelector('.slide-display-zone');
    if (!container) return;
    container.className = 'gallery';
    if (listToRender) { currentDisplayList = listToRender; }
    currentPage = page;
    container.innerHTML = '';

    if (currentDisplayList.length === 0) {
        container.innerHTML = `<div class="empty-state">❌ 검색된 사진이 없습니다. 다른 검색어를 입력해 보세요.</div>`;
    }

    const displayList = currentDisplayList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    displayList.forEach((photo, index) => {
        const globalIndex = (page - 1) * ITEMS_PER_PAGE + index;
        const div = document.createElement('div');
        div.className = 'photo-item'; // [1] 가장 바깥 액자

        const imgSrc = `images/result_${photo.category || 'family'}/${photo.filename}`;

        // [중요] 아래 구조가 CSS의 액자 틀과 100% 일치해야 사진이 안 커집니다!
        div.innerHTML = `
            <div class="photo-item-inner">
                <div class="theme-text">${photo.theme || '제목 없음'}</div>
                <div class="img-container">
                    <img src="${imgSrc}" class="gallery-img" loading="lazy" alt="${photo.theme || '갤러리 사진'}" onerror="handleImageError(this)" onclick="openModal('${imgSrc}', ${globalIndex})">
                </div>
                <div class="date-text">${photo.date || ''}</div>
            </div>
        `;
        container.appendChild(div);
    });

    // 사진 수량 표시 (숫자만 청색으로 포인트)
    const countElement = document.getElementById('totalPhotoCount');
    if (countElement) {
        // 숫자에만 span 태그를 입혀서 인라인 스타일로 색상을 줍니다.
        // .toLocaleString()을 붙여주면 1000단위 쉼표가 생겨서 더 전문적으로 보입니다.
        countElement.innerHTML = `TOTAL : <span style="color: #007bff; margin: 0 5px;">${currentDisplayList.length.toLocaleString()}</span> Pic`;
    }
    displayPagination(currentDisplayList.length);
}

function performSearch() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();

    // 현재 하위 메뉴(동구회 등)가 선택되어 있다면, 전체 리스트가 아닌 해당 하위 메뉴 사진들 내에서만 검색
    let baseList = filteredList;
    if (currentSubCategory) {
        baseList = filteredList.filter(p => (p.theme || '').includes(currentSubCategory));
    }

    const results = baseList.filter(p => (p.theme || '').toLowerCase().includes(query) || (p.date || '').toLowerCase().includes(query));
    renderGallery(1, results);
}

function filterBySubCategory(subCat) {
    const newUrl = window.location.pathname + '?type=friend';
    window.history.pushState({ path: newUrl }, '', newUrl);

    // 현재 선택된 서브 카테고리를 저장 (검색 시 이 필터 내에서만 검색되도록 함)
    currentSubCategory = subCat;

    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = '🤝 친구 갤러리 (' + subCat + ')';

    const rawData = (typeof photoData !== 'undefined') ? photoData : [];
    let allExpanded = [];
    rawData.forEach(p => {
        if (p.images && Array.isArray(p.images)) {
            p.images.forEach(img => allExpanded.push({ ...p, filename: img, images: undefined }));
        } else if (p.filename) {
            allExpanded.push(p);
        }
    });

    const subResults = allExpanded.filter(p => (p.theme || '').includes(subCat));
    // 동보회 32장 리스트를 renderGallery에 넘겨서 currentDisplayList를 교체합니다.
    renderGallery(1, subResults);

    // 친구 탭이 선택된 상태 유지
    currentCategory = 'friend';
    setActiveMenu();
}

function handleImageError(img) {
    if (img.dataset.tried === "2") return;
    img.dataset.tried = img.dataset.tried ? "2" : "1";
    if (img.dataset.tried === "1") {
        img.src = img.src.toLowerCase().endsWith('.jpg') ? img.src.replace(/\.jpg/i, '.JPG') : img.src.replace(/\.png/i, '.PNG');
    } else {
        img.src = 'https://via.placeholder.com/200?text=Error';
    }
}

function displayPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const createBtn = (text, target, cls = '') => {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        if (cls) btn.className = cls;
        // 이제 인자 없이 호출해도 currentDisplayList를 참조하므로 섞이지 않습니다.
        btn.onclick = () => { renderGallery(target); window.scrollTo(0, 0); };
        return btn;
    };

    if (currentPage > 1) {
        pagination.appendChild(createBtn('≪', 1, 'nav-btn'));
        pagination.appendChild(createBtn('<', currentPage - 1, 'nav-btn'));
    }
    // 페이지 번호 생성
    for (let i = 1; i <= totalPages; i++) {
        // 현재 페이지 주변 번호만 보여주기 (선택사항)
        if (i >= currentPage - 2 && i <= currentPage + 2) {
            pagination.appendChild(createBtn(i, i, i === currentPage ? 'active' : ''));
        }
    }
    if (currentPage < totalPages) {
        pagination.appendChild(createBtn('>', currentPage + 1, 'nav-btn'));
        pagination.appendChild(createBtn('≫', totalPages, 'nav-btn'));
    }
}

function openModal(src, index) {
    const modal = document.getElementById("imageModal");
    const img = document.getElementById("imgFull");
    modal.style.display = "flex";
    img.style.opacity = 1;
    img.classList.remove('ken-burns');
    resetZoom(); // 모달 열 때 확대 상태 초기화
    img.src = src;

    if (typeof index !== 'undefined') {
        slideIndex = index + 1;
    }
}

function startSlideshow() {
    if (!currentDisplayList || currentDisplayList.length === 0) {
        alert("재생할 사진이 없습니다.");
        return;
    }
    const modal = document.getElementById("imageModal");
    const img = document.getElementById("imgFull");

    // Play BGM
    let bgAudio = document.getElementById("bgmAudio");
    const volumeSlider = document.getElementById("volumeControl");
    if (bgAudio) {
        // 볼륨 슬라이더 값에 맞춰 재생 (슬라이더가 없으면 기본 최대 1.0)
        bgAudio.volume = volumeSlider ? parseFloat(volumeSlider.value) : 1.0;
        bgAudio.currentTime = 0; // 항상 처음부터 재생 시작
        let playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // 재생 성공
                console.log("BGM 재생 시작됨");
            }).catch(e => {
                console.error("오디오 재생 오류: ", e);
                alert("음악 자동재생이 브라우저에 의해 차단되었거나 음원 파일에 문제가 있습니다.");
            });
        }
    }

    modal.style.display = "flex";
    resetZoom(); // 슬라이드쇼 시작 시 확대 초기화
    img.style.opacity = 0; // Fade-in effect preparation

    isSlideshowPlaying = true;

    // 이어보기 로직
    let savedIndex = localStorage.getItem(`savedSlideIndex_${currentCategory}`);
    if (savedIndex !== null && parseInt(savedIndex) > 0 && parseInt(savedIndex) < currentDisplayList.length) {
        if (confirm("이전에 감상하던 사진부터 이어 보시겠습니까?\n(확인: 이어보기, 취소: 처음부터)")) {
            slideIndex = parseInt(savedIndex);
        } else {
            slideIndex = 0;
            localStorage.setItem(`savedSlideIndex_${currentCategory}`, 0);
        }
    } else {
        slideIndex = 0;
    }

    showSlideNextImage();
    slideshowInterval = setInterval(showSlideNextImage, 5500); // 5.5초마다 부드럽게 넘어가도록 시간 연장
}

function showSlideNextImage(isManual = false) {
    if (!isSlideshowPlaying && !isManual) return;

    if (slideIndex >= currentDisplayList.length) {
        slideIndex = 0; // loop back to start
        localStorage.setItem(`savedSlideIndex_${currentCategory}`, 0);
    }
    const photo = currentDisplayList[slideIndex];
    if (!photo) return;
    const imgSrc = `images/result_${photo.category || 'family'}/${photo.filename}`;
    const img = document.getElementById("imgFull");

    // Create a clone for flashy cross-fade ONLY if slideshow is playing
    if (isSlideshowPlaying && img.src && img.style.opacity !== "0") {
        const clone = img.cloneNode(true);
        clone.id = ""; // 중복 ID 방지
        clone.style.position = "absolute";
        clone.style.zIndex = "2900"; // 슬라이드쇼 컨트롤 패널 아래에 위치
        clone.style.pointerEvents = "none";
        clone.style.transition = "opacity 1.5s ease-in-out, filter 1.2s ease-in, transform 1.5s ease-out";

        const modal = document.getElementById("imageModal");
        modal.appendChild(clone);

        // 반짝거리면서(brightness) 흐려지며 사라지게 만들기
        requestAnimationFrame(() => {
            clone.style.opacity = "0";
            clone.style.filter = "brightness(1.8) blur(8px)";
            // 확대된 상태에서 더 커지며 사라짐
            const currentTransform = clone.style.transform || "";
            clone.style.transform = currentTransform + " scale(1.1)";
        });

        setTimeout(() => {
            if (clone.parentNode) clone.parentNode.removeChild(clone);
        }, 1500);
    }

    // Fade in new image
    if (isSlideshowPlaying) {
        img.style.opacity = 0;
        img.style.transition = "opacity 1.5s ease-in-out";
    } else {
        img.style.opacity = 1;
        img.style.transition = "none";
    }

    img.classList.remove('ken-burns');
    resetZoom(); // 다음 사진으로 넘어갈 때 위치 초기화
    img.src = imgSrc;

    img.onload = () => {
        img.style.opacity = 1;
        if (isSlideshowPlaying) {
            img.classList.add('ken-burns');
        }
    };

    // 현재 보고 있는 사진의 순서를 저장합니다.
    localStorage.setItem(`savedSlideIndex_${currentCategory}`, slideIndex);
    slideIndex++;
}

function closeModal() {
    const modal = document.getElementById("imageModal");
    const img = document.getElementById("imgFull");
    modal.style.display = "none";
    img.classList.remove('ken-burns');
    resetZoom(); // 모달 닫을 때 확대/이동 초기화

    if (isSlideshowPlaying) {
        clearInterval(slideshowInterval);
        isSlideshowPlaying = false;
    }

    let bgAudio = document.getElementById("bgmAudio");
    if (bgAudio && !bgAudio.paused) {
        bgAudio.pause();
        bgAudio.currentTime = 0;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('searchInput').onkeyup = (e) => { if (e.key === 'Enter') performSearch(); };
    document.querySelector(".close").onclick = () => closeModal();

    window.onclick = (e) => {
        if (e.target.id === 'imageModal') closeModal();

        // 모바일 보조 메뉴 바깥 클릭 시 닫힘 처리
        const menu = document.getElementById('sideMenu');
        const btn = document.getElementById('mobile-menu-btn');
        if (window.innerWidth <= 768 && menu && menu.classList.contains('open')) {
            if (!menu.contains(e.target) && e.target !== btn) {
                menu.classList.remove('open');
            }
        }
    };

    // 🖼️ 드래그 앤 드롭으로 확대된 사진 패닝하기(이동하기)
    const imgFull = document.getElementById("imgFull");
    let isDragging = false;
    let isMoved = false;
    let startX = 0, startY = 0;
    let clickX = 0, clickY = 0;

    imgFull.addEventListener('mousedown', (e) => {
        if (imgFull.classList.contains('full-size')) {
            isDragging = true;
            isMoved = false; // 클릭과 드래그 구분용
            clickX = e.clientX;
            clickY = e.clientY;
            // 현재 translate 좌표 기준으로 시작점 계산
            startX = e.clientX - currentTranslateX;
            startY = e.clientY - currentTranslateY;
            imgFull.style.cursor = 'grabbing';
            imgFull.style.transition = 'none'; // 드래그 시 버벅임 방지
            e.preventDefault(); // 기본 이미지 드래그 고스트 방지
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        // 민감도: 3px 이상 움직여야 드래그로 판정
        if (!isMoved && (Math.abs(e.clientX - clickX) > 3 || Math.abs(e.clientY - clickY) > 3)) {
            isMoved = true;
        }
        
        if (isMoved) {
            currentTranslateX = e.clientX - startX;
            currentTranslateY = e.clientY - startY;
            
            // CSS transform scale이 2.0이므로 마우스 이동거리와 시각적 거리를 맞추기 위해 나누기 2
            imgFull.style.transform = `scale(2.0) translate(${currentTranslateX / 2}px, ${currentTranslateY / 2}px)`;
        }
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            imgFull.style.cursor = 'grab';
            imgFull.style.transition = 'opacity 0.5s ease-in-out, transform 0.3s ease'; // 트랜지션 복구
            
            // 움직이지 않고 마우스 버튼만 뗐을 때 (단순 클릭) -> 축소
            if (!isMoved) {
                resetZoom();
            }
        }
    });

    // 축소된 상태(단순 클릭)에서 클릭 시 확대
    imgFull.onclick = function (e) {
        if (!this.classList.contains('full-size')) {
            this.classList.add('full-size');
            this.style.cursor = 'grab';
        }
    };

    // 키보드 화살표로 사진 넘기기
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById("imageModal");
        if (modal && modal.style.display === "flex") {
            if (e.key === "ArrowLeft") {
                prevSlide();
            } else if (e.key === "ArrowRight") {
                nextSlide();
            } else if (e.key === "Escape") {
                closeModal();
            }
        }
    });
});

// [자동화 버전] 파이썬이 만든 data.js의 데이터를 사용하여 모든 슬라이드를 보여줍니다.
function showSlideStrip() {
    const container = document.querySelector('.gallery') || document.querySelector('.slide-display-zone');
    if (!container) return;

    // 1. 초기화
    container.innerHTML = '';
    container.className = 'slide-display-zone';

    // 2. [핵심] photoData에서 'slide' 카테고리만 쏙 골라내기 (자동!)
    const allData = (typeof photoData !== 'undefined') ? photoData : [];
    const slideList = allData.filter(p => (p.category === 'slide'));

    // 3. 사진 뿌리기 (파이썬이 찾아낸 모든 사진을 반복문으로!)
    slideList.forEach(photo => {
        const img = document.createElement('img');
        // 파이썬이 만든 경로 그대로 사용
        img.src = `images/result_slide/${photo.filename}`;
        img.alt = photo.theme || "추억 슬라이드";

        // [추가] 혹시 새로 추가하신 사진들의 확장자 대소문자(.jpg vs .JPG)가 달라서
        // 엑박이 뜨는 불상사를 막기 위해 자동 복구 기능을 연결해 드립니다.
        img.onerror = function () { handleImageError(this); };

        container.appendChild(img);
    });

    // 4. 상단 제목 및 수량 자동 업데이트
    const titleTag = document.getElementById('gallery-title');
    if (titleTag) titleTag.innerText = "🎞️ 추억의 슬라이드 전시장";

    const countElement = document.getElementById('totalPhotoCount');
    if (countElement) {
        countElement.innerHTML = `TOTAL : <span style="color: #007bff; font-weight: bold;">${slideList.length.toLocaleString()}</span> Pic`;
    }

    // 하단 페이지 번호 숨기기
    const pagination = document.getElementById('pagination');
    if (pagination) pagination.innerHTML = '';
}

/* ==========================================
   추가: 슬라이드쇼 컨트롤 패널 로직
   ========================================== */
function changeVolume(value) {
    const bgAudio = document.getElementById("bgmAudio");
    if (bgAudio) {
        bgAudio.volume = value;
    }
    const volumeIcon = document.querySelector('.volume-icon');
    if (value == 0) volumeIcon.textContent = '🔇';
    else if (value < 0.5) volumeIcon.textContent = '🔉';
    else volumeIcon.textContent = '🔊';
}

function resetSlideshowInterval() {
    if (slideshowInterval) clearInterval(slideshowInterval);
    if (isSlideshowPlaying) {
        slideshowInterval = setInterval(showSlideNextImage, 5500);
    }
}

function prevSlide(e) {
    if (e) e.stopPropagation(); // 오동작으로 모달이 닫히는 걸 방지
    if (!currentDisplayList || currentDisplayList.length === 0) return;

    // 현재 타이머가 막 +1 시켰으므로 원래 보던 사진으로 가기 위해 -2 연산 필요
    slideIndex -= 2;
    if (slideIndex < 0) {
        // 인덱스가 음수일 경우 배열 뒤쪽에서 다시 감기
        slideIndex = currentDisplayList.length - 1 - (Math.abs(slideIndex + 1) % currentDisplayList.length);
    }

    showSlideNextImage(true);
    resetSlideshowInterval();
}

function nextSlide(e) {
    if (e) e.stopPropagation();
    showSlideNextImage(true);
    resetSlideshowInterval();
}