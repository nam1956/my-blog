// 1. 변수 설정
let currentPage = 1;      
let filteredList = [];    
let isTypingStarted = false; // [중요] 이중 타이핑 방지용 깃발

// 2. 한 페이지에 보여줄 사진 개수 (20장 고정)
function getItemsPerPage() {
    return 20; 
}

// 3. 메인 페이지 타이핑 효과 함수
function startTypingEffect() {
    if (isTypingStarted) return; // 이미 시작했으면 또 안함
    
    const text = "소중한 순간들을 기록합니다.~";
    const typingElement = document.querySelector(".typing-text");
    
    if (typingElement) {
        isTypingStarted = true; 
        typingElement.innerHTML = ""; // 일단 깨끗하게 지우기
        let index = 0;

        function typeWriter() {
            if (index < text.length) {
                typingElement.innerHTML += text.charAt(index);
                index++;
                setTimeout(typeWriter, 150); 
            }
        }
        setTimeout(typeWriter, 800); // 제목 애니메이션 후 시작
    }
}

// 4. 초기 실행 (메인인지 갤러리인지 판단)
function initPage() {
    const path = window.location.pathname;
    
    // 주소에 gallery가 없으면 메인 페이지로 간주
    if (!path.includes('gallery')) {
        startTypingEffect();
        return; 
    }

    // 갤러리 페이지일 경우 데이터 필터링 로직
    let category = 'all';
    if (path.includes('hiking')) category = 'hiking';
    else if (path.includes('family')) category = 'family';
    else if (path.includes('friend')) category = 'friend';
    else if (path.includes('memory')) category = 'memory';

    filteredList = (category === 'all') 
        ? photoData 
        : photoData.filter(p => p.category === category);

    displayPage(1);
}

// [중요] 실행 명령을 딱 하나로 통일 (이중 실행 방지)
document.addEventListener('DOMContentLoaded', initPage);

// --- 아래는 갤러리 기능 (기존과 동일) ---

function displayPage(page) {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;

    currentPage = page;
    const photosPerPage = getItemsPerPage(); 
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

function renderPagination(photosPerPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredList.length / photosPerPage);
    if (totalPages <= 1) return;

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

function openModal(imgSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("imgFull");
    if(modal && modalImg) {
        modal.style.display = "block";
        modalImg.src = imgSrc;
    }
}

window.onclick = (event) => {
    const modal = document.getElementById("imageModal");
    if (event.target == modal) modal.style.display = "none";
}