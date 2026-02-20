// script_new.js

// 1. 화면에 사진을 뿌려주는 함수
function displayGallery(filterCategory = 'all') {
    const galleryContainer = document.querySelector('.gallery');
    galleryContainer.innerHTML = ''; // 기존 내용을 지웁니다.

    // 데이터에서 조건에 맞는 사진만 골라내기
    const filteredData = filterCategory === 'all' 
        ? photoData 
        : photoData.filter(item => item.category === filterCategory);

    // 골라낸 사진들을 HTML로 만들기
    filteredData.forEach(photo => {
        const imgElement = `
            <div class="photo-item">
                <img src="images/${photo.filename}" alt="${photo.title}" class="gallery-img">
                <p class="photo-info">${photo.date} - ${photo.title}</p>
            </div>
        `;
        galleryContainer.innerHTML += imgElement;
    });
}

// 2. 페이지가 열리면 실행
window.onload = () => {
    // 현재 페이지가 어떤 카테고리인지 확인 (예: gallery_hiking.html 이면 'hiking')
    const path = window.location.pathname;
    if (path.includes('hiking')) displayGallery('hiking');
    else if (path.includes('family')) displayGallery('family');
    else if (path.includes('friend')) displayGallery('friend');
    else if (path.includes('memory')) displayGallery('memory');
    else displayGallery('all');
};