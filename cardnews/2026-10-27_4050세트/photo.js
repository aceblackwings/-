// ?photo=파일경로 로 힉스필드 이미지를 넣으면 일러스트 대신 사진이 들어갑니다.
const p = new URLSearchParams(location.search).get("photo");
if (p) {
  const el = document.getElementById("photo");
  el.classList.add("has-image");
  el.style.background = `url("${p}")`;
  document.getElementById("illust").remove();
}
