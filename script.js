/**
 * [최종 통합 스크립트]
 * 역할: 메인 타이핑 효과 + 갤러리 카테고리 필터링 + 페이지네이션
 */

let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

// [1] 초기화 함수: 페이지 로드 시 가장 먼저 실행
function init() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('type'); // ?type=family 같은 꼬리표 읽기
    const path = window.location.pathname;

    // A. 갤러리 페이지 판별 (주소창에 type이 있거나 파일명이 gallery인 경우)
    if (category || path.includes('gallery')) {
        const activeCategory = category || 'all';
        
        // 1. 데이터 필터링 (data.js의 photoData 사용)
        if (activeCategory === 'all') {
            filteredList = photoData;
        } else {
            filteredList = photoData.filter(p => p.category === activeCategory);
        }

        // 2. 제목 매핑 및 변경 (ID: gallery-title)
        const titleMap = {
            'family': '🏠 가족 갤러리',
            'hiking': '🏔️ 등반 사진첩',
            'friend': '🤝 친구 갤러리',
            'memory': '✨ 추억 저장소'
        };
        const titleTag = document.getElementById('gallery-title');
        if (titleTag) {
            titleTag.innerText = titleMap[activeCategory] || '나의 인생 갤러리';
        }

        // 3. 사진 출력 (1페이지부터)
        displayPage(1);
    } 
    // B. 메인 페이지 판별 (타이핑 효과 실행)
    else {
        const target = document.querySelector(".typing-text");
        if (target) {
            target.innerHTML = "";
            let text = "소중한 순간들을 기록합니다.~";
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

// [2] 사진 그리드 출력 함수
function displayPage(page) {
    const galleryContainer = document.querySelector('.gallery');
    const totalCountTag = document.getElementById('totalPhotoCount');
    
    if (!galleryContainer) return;
    
    currentPage = page;
    galleryContainer.innerHTML = '';
    
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    
    // 데이터가 없을 경우 처리
    if (filteredList.length === 0) {
        galleryContainer.innerHTML = '<p style="text-align:center; width:100%; padding:50px;">해당 카테고리에 사진이 없습니다.</p>';
    } else {
        filteredList.slice(start, end).forEach(photo => {
            const div = document.createElement('div');
            div.className = 'photo-item';
            div.innerHTML = `
                <img src="images/${photo.filename}" class="gallery-img" onclick="openModal('images/${photo.filename}')">
                <div class="photo-info">
                    <strong>${photo.title}</strong><br>
                    <span>${photo.date}</span>
                </div>
            `;
            galleryContainer.appendChild(div);
        });
    }
    
    // 수량 표시 업데이트
    if (totalCountTag) {
        totalCountTag.innerText = `총 : ${filteredList.length} 장의 사진이 있습니다`;
    }

    renderPagination();
}

// [3] 페이지네이션 출력 (줄임표 로직 포함)
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

// [4] 모달 창 제어
function openModal(src) {
    const m = document.getElementById("imageModal");
    const mi = document.getElementById("imgFull");
    if (m && mi) { m.style.display = "flex"; mi.src = src; }
}

function closeModal() {
    const m = document.getElementById("imageModal");
    if (m) m.style.display = "none";
}

// 배경 클릭 시 닫기
window.onclick = (e) => { 
    const m = document.getElementById("imageModal");
    if (e.target === m) closeModal(); 
}

// [5] 실시간 검색 기능
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

// 초기화 실행
document.addEventListener('DOMContentLoaded', init);