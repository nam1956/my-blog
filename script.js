let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20;

function init() {
    const path = window.location.pathname;
    if (path.includes('gallery')) {
        let category = 'all';
        if (path.includes('hiking')) category = 'hiking';
        else if (path.includes('family')) category = 'family';
        else if (path.includes('friend')) category = 'friend';
        else if (path.includes('memory')) category = 'memory';
        
        filteredList = (category === 'all') ? photoData : photoData.filter(p => p.category === category);
        displayPage(1);
    } else {
        startTypingEffect();
    }
}

function startTypingEffect() {
    const target = document.querySelector(".typing-text");
    if (!target) return;
    const text = "소중한 순간들을 기록합니다.~";
    let i = 0;
    target.innerHTML = "";
    function type() { if(i < text.length) { target.innerHTML += text[i++]; setTimeout(type, 120); } }
    type();
}

function displayPage(page) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;
    currentPage = page;
    gallery.innerHTML = '';
    
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    filteredList.slice(start, end).forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        div.innerHTML = `
            <img src="images/${photo.filename}" class="gallery-img" onclick="openModal('images/${photo.filename}')">
            <div class="photo-info"><strong>${photo.title}</strong><br><span>${photo.date}</span></div>
        `;
        gallery.appendChild(div);
    });
    renderPagination();
    document.getElementById('totalPhotoCount').innerText = `TOTAL: ${filteredList.length}`;
}

// 🚩 줄임표(1...5 6 7...32) 스마트 숫자네이션
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    if (!pagination || totalPages <= 1) return;
    pagination.innerHTML = '';

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
            if (i - l === 2) { addPageBtn(l + 1, pagination); }
            else if (i - l !== 1) {
                const span = document.createElement('span');
                span.innerText = "..."; span.className = "dots";
                pagination.appendChild(span);
            }
        }
        addPageBtn(i, pagination);
        l = i;
    }
}

function addPageBtn(p, container) {
    const btn = document.createElement('button');
    btn.innerText = p;
    if (p === currentPage) btn.className = 'active';
    btn.onclick = () => { displayPage(p); window.scrollTo(0,0); };
    container.appendChild(btn);
}

// 🚩 진짜 모달 팝업 함수
function openModal(src) {
    const m = document.getElementById("imageModal");
    const mi = document.getElementById("imgFull");
    if(m && mi) { m.style.display = "flex"; mi.src = src; }
}

window.onclick = (e) => { 
    const m = document.getElementById("imageModal");
    if (e.target === m) m.style.display = "none"; 
}

document.addEventListener('DOMContentLoaded', init);