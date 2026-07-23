const fleetRecords = [
  {
    plate: "BB8986",
    type: "小型乘用车",
    owner: "行政部 · 张明",
    brand: "Mercedes-Benz E-Class",
    permit: "长期通行",
    status: "正常",
    lastSeen: "今天 08:42 · 南门",
    phone: "138****7821",
    color: "深蓝色",
    purpose: "员工车辆",
  },
  {
    plate: "589222",
    type: "SUV/MPV 类车辆",
    owner: "后勤保障部 · 访客车",
    brand: "MPV / SUV",
    permit: "临时访客",
    status: "需核验",
    lastSeen: "今天 10:18 · 西门",
    phone: "访客登记台",
    color: "黑色",
    purpose: "临时配送/访客",
  },
  {
    plate: "XCJ-S77",
    type: "轿车/小型乘用车",
    owner: "研发中心 · 林珂",
    brand: "Compact Sedan",
    permit: "长期通行",
    status: "正常",
    lastSeen: "昨天 18:07 · 地库入口",
    phone: "136****1290",
    color: "银色",
    purpose: "员工车辆",
  },
  {
    plate: "EVSROCK",
    type: "小型乘用车",
    owner: "测试车队 · 演示车辆",
    brand: "EV Demo Car",
    permit: "演示权限",
    status: "正常",
    lastSeen: "今天 14:26 · 南门",
    phone: "系统演示",
    color: "白色",
    purpose: "算法演示",
  },
  {
    plate: "ATE112",
    type: "小型乘用车",
    owner: "外协单位 · 施工车辆",
    brand: "Service Sedan",
    permit: "限时通行",
    status: "需核验",
    lastSeen: "今天 09:33 · 北门",
    phone: "门岗登记",
    color: "蓝色",
    purpose: "外协施工",
  },
  {
    plate: "A112",
    type: "小型乘用车",
    owner: "外协单位 · 施工车辆",
    brand: "Service Sedan",
    permit: "限时通行",
    status: "需核验",
    lastSeen: "今天 09:33 · 北门",
    phone: "门岗登记",
    color: "蓝色",
    purpose: "外协施工",
  },
  {
    plate: "CAMPUS01",
    type: "巡逻车",
    owner: "安保部 · 巡逻组",
    brand: "Security Patrol",
    permit: "内部车辆",
    status: "正常",
    lastSeen: "今天 15:11 · 东门",
    phone: "安保值班室",
    color: "白色",
    purpose: "园区巡逻",
  },
  {
    plate: "VISITOR8",
    type: "访客车辆",
    owner: "访客中心",
    brand: "Unknown",
    permit: "待审批",
    status: "异常",
    lastSeen: "无记录",
    phone: "未登记",
    color: "未知",
    purpose: "未登记车辆",
  },
];

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
const detectionList = document.querySelector("#detectionList");
const plateGallery = document.querySelector("#plateGallery");
const vehicleGallery = document.querySelector("#vehicleGallery");
const vehicleProfile = document.querySelector("#vehicleProfile");
const matchHint = document.querySelector("#matchHint");
const dropzone = document.querySelector("#dropzone");
const fleetTable = document.querySelector("#fleetTable");
const tableSearch = document.querySelector("#tableSearch");
const manualPlate = document.querySelector("#manualPlate");
const manualSearchBtn = document.querySelector("#manualSearchBtn");
const registeredCount = document.querySelector("#registeredCount");

let selectedFile = null;
let lastVehicleImages = [];

renderFleetTable(fleetRecords);
registeredCount.textContent = fleetRecords.length;

imageInput.addEventListener("change", () => setSelectedFile(imageInput.files[0]));

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("dragging");
});

dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));

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
  mode.textContent = "识别中";

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
  lastVehicleImages = [];
  imageInput.value = "";
  originalPreview.removeAttribute("src");
  resultPreview.removeAttribute("src");
  originalPreview.classList.remove("visible");
  resultPreview.classList.remove("visible");
  mode.textContent = "等待识别";
  clearResult();
});

tableSearch.addEventListener("input", () => {
  const keyword = normalize(tableSearch.value);
  const filtered = fleetRecords.filter((record) =>
    [record.plate, record.type, record.owner, record.status, record.permit].some((value) => normalize(value).includes(keyword)),
  );
  renderFleetTable(filtered);
});

manualSearchBtn.addEventListener("click", () => {
  const plate = normalize(manualPlate.value);
  plateNumber.textContent = plate || "未识别";
  lookupVehicle(plate, true);
});

manualPlate.addEventListener("keydown", (event) => {
  if (event.key === "Enter") manualSearchBtn.click();
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
  lastVehicleImages = data.vehicleImages || [];

  const recognizedPlate = data.summary.plateNumbers?.[0] || "";
  plateNumber.textContent = recognizedPlate || "未识别";
  manualPlate.value = recognizedPlate;
  resultPreview.src = data.resultImage;
  resultPreview.classList.add("visible");

  lookupVehicle(recognizedPlate, false, data.vehicleType);
  renderDetectionList(data);
  renderGallery(vehicleGallery, data.vehicleImages || [], "车辆返回图", "暂无车辆图片");
  renderGallery(plateGallery, data.plateImages || [], "车牌裁剪结果", "暂无车牌区域");
}

function lookupVehicle(plate, manual = false, detectedType = "") {
  const normalizedPlate = normalize(plate);
  if (!normalizedPlate) {
    matchHint.textContent = "未识别到车牌，无法查询车辆档案";
    vehicleProfile.innerHTML = `<div class="profile-empty">暂无匹配车辆</div>`;
    return;
  }

  const record = fleetRecords.find((item) => normalize(item.plate) === normalizedPlate);
  if (!record) {
    matchHint.textContent = manual ? "档案库中没有该车牌" : "识别成功，但未在档案库中找到车辆";
    vehicleProfile.innerHTML = renderUnknownVehicle(normalizedPlate, detectedType);
    return;
  }

  matchHint.textContent = "已匹配车辆档案";
  vehicleProfile.innerHTML = renderVehicleProfile(record);
}

function renderVehicleProfile(record) {
  const statusClass = record.status === "正常" ? "ok" : record.status === "异常" ? "danger" : "warn";
  const vehicleImage = lastVehicleImages[0]
    ? `<img src="${lastVehicleImages[0]}" alt="匹配车辆图片" />`
    : `<div class="profile-image-placeholder">无车辆图</div>`;
  return `
    <div class="profile-image">${vehicleImage}</div>
    <div class="profile-title">
      <div>
        <span>匹配车辆</span>
        <strong>${record.plate}</strong>
      </div>
      <em class="badge ${statusClass}">${record.status}</em>
    </div>
    <dl class="profile-list">
      <div><dt>车主/部门</dt><dd>${record.owner}</dd></div>
      <div><dt>车辆型号</dt><dd>${record.brand}</dd></div>
      <div><dt>车辆类型</dt><dd>${record.type}</dd></div>
      <div><dt>车辆颜色</dt><dd>${record.color}</dd></div>
      <div><dt>通行权限</dt><dd>${record.permit}</dd></div>
      <div><dt>联系电话</dt><dd>${record.phone}</dd></div>
      <div><dt>使用场景</dt><dd>${record.purpose}</dd></div>
      <div><dt>最近通行</dt><dd>${record.lastSeen}</dd></div>
    </dl>
  `;
}

function renderUnknownVehicle(plate, detectedType) {
  const vehicleImage = lastVehicleImages[0]
    ? `<img src="${lastVehicleImages[0]}" alt="未登记车辆图片" />`
    : `<div class="profile-image-placeholder">无车辆图</div>`;
  return `
    <div class="profile-image">${vehicleImage}</div>
    <div class="profile-title">
      <div>
        <span>未登记车辆</span>
        <strong>${plate}</strong>
      </div>
      <em class="badge danger">未授权</em>
    </div>
    <dl class="profile-list">
      <div><dt>车辆类型</dt><dd>${detectedType || "未知"}</dd></div>
      <div><dt>处理建议</dt><dd>请人工核验并登记访客信息</dd></div>
      <div><dt>通行权限</dt><dd>待审批</dd></div>
    </dl>
  `;
}

function renderDetectionList(data) {
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
              <small>坐标 [${item.box.join(", ")}]</small>
              ${ocr}
            </article>
          `;
        })
        .join("")
    : "暂无检测结果";
}

function renderFleetTable(records) {
  fleetTable.innerHTML = records
    .map((record) => {
      const statusClass = record.status === "正常" ? "ok" : record.status === "异常" ? "danger" : "warn";
      return `
        <tr data-plate="${record.plate}">
          <td><strong>${record.plate}</strong></td>
          <td>${record.type}</td>
          <td>${record.owner}</td>
          <td>${record.permit}</td>
          <td><span class="badge ${statusClass}">${record.status}</span></td>
          <td>${record.lastSeen}</td>
        </tr>
      `;
    })
    .join("");

  fleetTable.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      const plate = row.dataset.plate;
      manualPlate.value = plate;
      plateNumber.textContent = plate;
      lookupVehicle(plate, true);
    });
  });
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
  matchHint.textContent = "上传图片后自动查询车辆档案";
  vehicleProfile.innerHTML = `<div class="profile-empty">暂无匹配车辆</div>`;
  detectionList.classList.add("empty");
  detectionList.textContent = "暂无检测结果";
  plateGallery.classList.add("empty");
  plateGallery.textContent = "暂无车牌区域";
  vehicleGallery.classList.add("empty");
  vehicleGallery.textContent = "暂无车辆图片";
}

function normalize(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}
