const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("imgFull");
const closeBtn = document.querySelector(".close");
const images = document.querySelectorAll(".gallery-img");

// 이미지 클릭 시 모달 열기
images.forEach(img => {
    img.addEventListener("click", function() {
        modal.style.display = "block";
        modalImg.src = this.src;
    });
});

// 닫기 버튼 클릭 시
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// 배경 클릭 시 닫기
modal.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}