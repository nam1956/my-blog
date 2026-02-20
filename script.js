// 필요한 요소들 가져오기
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("imgFull");
const closeBtn = document.getElementsByClassName("close")[0];
const images = document.querySelectorAll(".gallery-img");

// 모든 갤러리 이미지에 클릭 이벤트 추가
images.forEach(img => {
    img.onclick = function() {
        modal.style.display = "block"; // 모달 보이기
        modalImg.src = this.src;      // 클릭한 이미지 경로를 모달에 복사
    }
});

// 닫기 버튼 클릭 시 모달 숨기기
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// 배경(이미지 밖) 클릭 시에도 닫히게 하기
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
