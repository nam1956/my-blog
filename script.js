let currentPage = 1;
let filteredList = [];
const ITEMS_PER_PAGE = 20; // 🚩 페이지당 20장 고정

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
    renderPagination(); 
}

// 🚩 줄임표(1...5 6 7...60) 스마트 페이지네이션 로직
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) return;

    const delta = 2; // 현재 페이지 앞뒤로 보여줄 범위
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i);
        }
    }

    let l;
    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                createPageButton(l + 1, pagination);
            } else if (i - l !== 1) {
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

function createPageButton(pageNumber, container) {
    const btn = document.createElement('button');
    btn.innerText = pageNumber;
    if (pageNumber === currentPage) btn.className = 'active';
    btn.onclick = () => {
        displayPage(pageNumber);
        window.scrollTo(0, 0);
    };
    container.appendChild(btn);
}

function init() {
    const path = window.location.pathname;
    const isGallery = path.includes('gallery');

    if (!isGallery) {
        // 타이핑 효과 로직 (기본 로직 유지)
        const text = "소중한 순간들을 기록합니다.~";
        const target = document.querySelector(".typing-text");
        if(target) {
            let i = 0;
            function type() { if(i < text.length) { target.innerHTML += text[i++]; setTimeout(type, 120); } }
            type();
        }
    } else {
        // 갤러리 로직
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