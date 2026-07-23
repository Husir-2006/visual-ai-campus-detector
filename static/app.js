const imageInput = document.querySelector("#imageInput");
const detectBtn = document.querySelector("#detectBtn");
const resetBtn = document.querySelector("#resetBtn");
const originalPreview = document.querySelector("#originalPreview");
const resultPreview = document.querySelector("#resultPreview");
const mode = document.querySelector("#mode");
const vehicleCount = document.querySelector("#vehicleCount");
const plateCount = document.querySelector("#plateCount");
const avgConfidence = document.querySelector("#avgConfidence");
const plateNumber = document.querySelector("#plateNumber");
const vehicleType = document.querySelector("#vehicleType");
const detectionList = document.querySelector("#detectionList");
const plateGallery = document.querySelector("#plateGallery");
const vehicleGallery = document.querySelector("#vehicleGallery");
const dropzone = document.querySelector("#dropzone");

let selectedFile = null;

imageInput.addEventListener("change", () => {
  setSelectedFile(imageInput.files[0]);
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("dragging");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragging");
});

dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dragging");
  setSelectedFile(event.dataTransfer.files[0]);
});

detectBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    mode.textContent = "请先上传图片";
    return;
  }

  detectBtn.disabled = true;
  mode.textContent = "识别中...";

  const formData = new FormData();
  formData.append("image", selectedFile);

  try {
    const response = await fetch("/detect", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "识别失败");
    renderResult(data);
  } catch (error) {
    mode.textContent = error.message;
  } finally {
    detectBtn.disabled = false;
  }
});

resetBtn.addEventListener("click", () => {
  selectedFile = null;
  imageInput.value = "";
  originalPreview.removeAttribute("src");
  resultPreview.removeAttribute("src");
  originalPreview.classList.remove("visible");
  resultPreview.classList.remove("visible");
  mode.textContent = "等待检测";
  clearResult();
});

function setSelectedFile(file) {
  if (!file) return;
  selectedFile = file;
  originalPreview.src = URL.createObjectURL(file);
  originalPreview.classList.add("visible");
  resultPreview.classList.remove("visible");
  mode.textContent = "图片已选择";
  clearResult();
}

function renderResult(data) {
  mode.textContent = data.mode;
  vehicleCount.textContent = data.summary.vehicleCount;
  plateCount.textContent = data.summary.plateCount;
  avgConfidence.textContent = data.summary.avgConfidence;
  plateNumber.textContent = data.summary.plateNumbers?.length ? data.summary.plateNumbers.join("、") : "未识别";
  vehicleType.textContent = data.vehicleType || "未知";
  resultPreview.src = data.resultImage;
  resultPreview.classList.add("visible");

  const items = [...data.vehicles, ...data.plates];
  detectionList.classList.toggle("empty", items.length === 0);
  detectionList.innerHTML = items.length
    ? items
        .map((item, index) => {
          const text = item.text && item.text !== "未识别" ? `<b>车牌号：${item.text}</b>` : "";
          const ocr = item.ocrMethod ? `<small>OCR 方法：${item.ocrMethod}</small>` : "";
          return `
            <article>
              <strong>${index + 1}. ${item.label}</strong>
              ${text}
              <span>置信度 ${(item.confidence * 100).toFixed(1)}%</span>
              <small>位置 [${item.box.join(", ")}]</small>
              ${ocr}
            </article>
          `;
        })
        .join("")
    : "暂无检测结果";

  renderGallery(vehicleGallery, data.vehicleImages || [], "车辆返回图", "暂无车辆图片");
  renderGallery(plateGallery, data.plateImages || [], "车牌裁剪结果", "暂无车牌区域");
}

function renderGallery(container, images, alt, emptyText) {
  container.classList.toggle("empty", images.length === 0);
  container.innerHTML = images.length
    ? images.map((src) => `<img src="${src}" alt="${alt}" />`).join("")
    : emptyText;
}

function clearResult() {
  vehicleCount.textContent = "0";
  plateCount.textContent = "0";
  avgConfidence.textContent = "0";
  plateNumber.textContent = "未识别";
  vehicleType.textContent = "未知";
  detectionList.classList.add("empty");
  detectionList.textContent = "暂无检测结果";
  plateGallery.classList.add("empty");
  plateGallery.textContent = "暂无车牌区域";
  vehicleGallery.classList.add("empty");
  vehicleGallery.textContent = "暂无车辆图片";
}
