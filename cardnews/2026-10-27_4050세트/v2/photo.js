// ?photo=파일명 으로 실사 사진을 넣습니다. 예) card1.html?photo=photo1.jpg
const p = new URLSearchParams(location.search).get("photo");
if (p) { const el = document.getElementById("photo"); el.style.backgroundImage = `url("${p}")`; el.classList.add("has-photo"); document.querySelector(".label").style.display = "block"; }
else { document.querySelector(".label").style.display = "none"; }
