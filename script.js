let currentPage = 1;
let filteredList = [];
let isTypingActive = false; // 타이핑 중복 실행 방지 변수

// 🚩 정확히 20장씩 출력하도록 설정
const ITEMS_PER_PAGE = 20;

function startTypingEffect() {
    if (isTypingActive) return;
    const text = "소중한 순간들을 기록합니다.~";
    const typingElement = document.querySelector(".typing-text");
    
    if (typingElement) {
        isTypingActive = true;
        typingElement.innerHTML = ""; 
        let index = 0;
        function typeWriter() {
            if (index < text.length) {
                typingElement.innerHTML += text.charAt(index);
                index++;
                setTimeout(typeWriter, 120);
            } else {
                isTypingActive = false; // 완료 후 플래그 해제
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

    // 정확히 20개씩 자르기
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
    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === currentPage) btn.className = 'active';
        btn.onclick = () => {
            displayPage(i);
            window.scrollTo(0, 0);
        };
        pagination.appendChild(btn);
    }
}

// 초기화: 딱 한 번만 실행되도록 설정
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (!path.includes('gallery')) {
        startTypingEffect();
    } else {
        // 갤러리 페이지 데이터 로딩 (기존 로직 유지)
        let category = 'all';
        if (path.includes('hiking')) category = 'hiking';
        else if (path.includes('family')) category = 'family';
        else if (path.includes('friend')) category = 'friend';
        else if (path.includes('memory')) category = 'memory';
        
        filteredList = (category === 'all') ? photoData : photoData.filter(p => p.category === category);
        displayPage(1);
    }
});