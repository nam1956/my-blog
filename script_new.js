// script_new.js

// 1. 화면에 사진을 뿌려주는 핵심 함수
function displayGallery(filterCategory = 'all') {
    const galleryContainer = document.querySelector('.gallery');
    if (!galleryContainer) return; // 갤러리 영역이 없으면 중단

    galleryContainer.innerHTML = ''; // 기존 HTML 내용을 깨끗이 지웁니다.

    // 데이터에서 카테고리에 맞는 사진만 필터링
    const filteredData = filterCategory === 'all' 
        ? photoData 
        : photoData.filter(item => item.category === filterCategory);

    // 필터링된 데이터를 화면에 하나씩 생성
    filteredData.forEach(photo => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'photo-item';
        itemDiv.innerHTML = `
            <img src="images/${photo.filename}" alt="${photo.title}" class="gallery-img" onclick="openModal('images/${photo.filename}')">
            <div class="photo-info">
                <strong>${photo.title}</strong><br>
                <span>${photo.date}</span>
            </div>
        `;
        galleryContainer.appendChild(itemDiv);
    });
}

// 2. 모달창 열기 기능 (이미지 클릭 시)
function openModal(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("imgFull");
    modal.style.display = "block";
    modalImg.src = src;
}

// 3. 페이지가 로드될 때 실행
window.onload = () => {
    const pageName = window.location.pathname;
    
    if (pageName.includes('hiking')) displayGallery('hiking');
    else if (pageName.includes('family')) displayGallery('family');
    else if (pageName.includes('friend')) displayGallery('friend');
    else if (pageName.includes('memory')) displayGallery('memory');
    else displayGallery('all'); // index.html 등에서는 전체 보기

    // 모달 닫기 이벤트
    const closeBtn = document.querySelector(".close");
    if (closeBtn) {
        closeBtn.onclick = () => document.getElementById("imageModal").style.display = "none";
    }
};