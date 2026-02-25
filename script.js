let currentPage = 1;
let filteredList = [];
let isTypingStarted = false;
const ITEMS_PER_PAGE = 20;

// 1. 초기화 및 타이핑 효과
function init() {
    const path = window.location.pathname;
    if (!path.includes('gallery')) {
        startTypingEffect();
    } else {
        let category = 'all';
        if (path.includes('hiking')) category = 'hiking';
        else if (path.includes('family')) category = 'family';
        else if (path.includes('friend')) category = 'friend';
        else if (path.includes('memory')) category = 'memory';
        
        filteredList = (category === 'all') ? photoData : photoData.filter(p => p.category === category);
        displayPage(1);
    }
}

function startTypingEffect() {
    if (isTypingStarted) return;
    const typingElement = document.querySelector(".typing-text");
    const text = "소중한 순간들을 기록합니다.~";
    if (typingElement) {
        isTypingStarted = true;
        typingElement.innerHTML = "";
        let index = 0;
        function typeWriter() {
            if (index < text.length) {
                typingElement.innerHTML += text.charAt(index);
                index++;
                setTimeout(typeWriter, 120);
            }
        }
        setTimeout(typeWriter, 600);
    }
}

// 2. 갤러리 표시 (20장 고정)
function displayPage(page) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;
    currentPage = page;
    gallery.innerHTML = '';
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = filteredList.slice(start, end);

    pageItems.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        // 🚩 이미지 클릭 시 openModal 실행 유지
        div.innerHTML = `
            <img src="images/${photo.filename}" class="gallery-img" onclick="openModal('images/${photo.filename}')">
            <div class="photo-info"><strong>${photo.title}</strong><br><span>${photo.date}</span></div>
        `;
        gallery.appendChild(div);
    });
    renderPagination(); 
    updatePhotoCount();
}

// 3. 스마트 숫자네이션 (1...5678...60)
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const delta = 2; 
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }

    let l;
    for (let i of range) {
        if (l) {
            if (i - l === 2) { createPageButton(l + 1, pagination); }
            else if (i - l !== 1) {
                const span = document.createElement('span');
                span.innerText = "...";
                span.className = "dots";
                pagination.appendChild(span);
            }
        }
        createPageButton(i, pagination);
        l = i;
    }
}

function createPageButton(p, container) {
    const btn = document.createElement('button');
    btn.innerText = p;
    if (p === currentPage) btn.className = 'active';
    btn.onclick = () => { displayPage(p); window.scrollTo(0, 0); };
    container.appendChild(btn);
}

// 4. 수량 표시 및 모달 기능 (복구)
function updatePhotoCount() {
    const countElement = document.getElementById('totalPhotoCount');
    if (countElement) countElement.innerText = `TOTAL: ${filteredList.length} Photos`;
}

function openModal(src) {
    const m = document.getElementById("imageModal");
    const mi = document.getElementById("imgFull");
    if(m && mi) { 
        m.style.display = "flex"; // 중앙 정렬을 위해 flex 사용
        mi.src = src; 
    }
}

// 모달 닫기 (검은 배경 클릭 시)
window.onclick = (e) => {
    const m = document.getElementById("imageModal");
    if (e.target === m) { m.style.display = "none"; }
}

document.addEventListener('DOMContentLoaded', init);