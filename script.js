let currentPage = 1;
let filteredList = [];
let isTypingStarted = false;

// 🚩 사진 20장 출력 고정
const ITEMS_PER_PAGE = 20;

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
        div.innerHTML = `
            <img src="images/${photo.filename}" class="gallery-img" onclick="openModal('images/${photo.filename}')">
            <div class="photo-info"><strong>${photo.title}</strong><br><span>${photo.date}</span></div>
        `;
        gallery.appendChild(div);
    });
    renderPagination(); // 줄임표 로직이 포함된 함수 호출
    updatePhotoCount();
}

// 🚩 [핵심] 줄임표 방식의 숫자네이션 함수
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const range = 2; // 현재 페이지 앞뒤로 보여줄 숫자의 개수
    let pages = [];

    for (let i = 1; i <= totalPages; i++) {
        // 처음, 끝, 현재 페이지 주변 숫자만 배열에 담기
        if (i === 1 || i === totalPages || (i >= currentPage - range && i <= currentPage + range)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            // 연속되지 않는 숫자가 나올 때 줄임표 추가
            pages.push("...");
        }
    }

    pages.forEach(p => {
        if (p === "...") {
            const span = document.createElement('span');
            span.innerText = "...";
            span.style.padding = "10px";
            pagination.appendChild(span);
        } else {
            const btn = document.createElement('button');
            btn.innerText = p;
            if (p === currentPage) btn.className = 'active';
            btn.onclick = () => {
                displayPage(p);
                window.scrollTo(0, 0);
            };
            pagination.appendChild(btn);
        }
    });
}

function updatePhotoCount() {
    const countElement = document.getElementById('totalPhotoCount');
    if (countElement) countElement.innerText = `총 ${filteredList.length}장의 사진`;
}

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
document.addEventListener('DOMContentLoaded', init);

function openModal(src) {
    const m = document.getElementById("imageModal");
    const mi = document.getElementById("imgFull");
    if(m && mi) { m.style.display = "block"; mi.src = src; }
}
window.onclick = (e) => { if (e.target.id == "imageModal") e.target.style.display = "none"; }