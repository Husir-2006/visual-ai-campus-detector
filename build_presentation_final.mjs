import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const project = "G:/Grade2SummerSemester/InnovationApplication/visual-ai-campus-detector";
const outDir = `${project}/deliverables`;
const previewDir = `${outDir}/ppt_preview_final`;
const finalPptx = `${outDir}/24281098-陈述PPT-企业车牌识别与车辆管理系统.pptx`;
const legacyPptx = `${outDir}/陈述PPT-校园车辆与车牌检测系统.pptx`;
const W = 1280;
const H = 720;

const C = {
  white: "#FFFFFF",
  warm: "#F7F7F5",
  ink: "#202124",
  muted: "#687076",
  line: "#DADCE0",
  red: "#9B1C31",
  blue: "#285A8C",
  green: "#2D6A4F",
  paleRed: "#F7EDEF",
  paleBlue: "#EEF3F8",
  paleGreen: "#ECF4EF",
};

async function writeBlob(filePath, blob) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function imageBytes(filePath) {
  const data = await fs.readFile(filePath);
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
}

function shape(slide, geometry, left, top, width, height, fill = "none", stroke = "none", extra = {}) {
  return slide.shapes.add({
    geometry,
    position: { left, top, width, height },
    fill,
    line: { style: "solid", fill: stroke, width: stroke === "none" ? 0 : 1 },
    ...extra,
  });
}

function text(slide, value, left, top, width, height, options = {}) {
  const item = shape(slide, "textbox", left, top, width, height);
  item.text = value;
  item.text.style = {
    fontFace: "Microsoft YaHei",
    fontSize: options.size ?? 20,
    bold: options.bold ?? false,
    color: options.color ?? C.ink,
    alignment: options.align ?? "left",
  };
  return item;
}

function rule(slide, left, top, width, color = C.line, height = 2) {
  return shape(slide, "rect", left, top, width, height, color);
}

function slideHeader(slide, title, page, kicker = "") {
  slide.background.fill = C.white;
  if (kicker) text(slide, kicker, 72, 42, 500, 24, { size: 15, bold: true, color: C.red });
  text(slide, title, 72, 74, 1050, 54, { size: 36, bold: true });
  rule(slide, 72, 142, 1136);
  text(slide, String(page).padStart(2, "0"), 1155, 50, 52, 24, { size: 15, bold: true, color: C.muted, align: "right" });
}

function footer(slide) {
  text(slide, "P402019B 创新应用综合实训", 72, 678, 330, 18, { size: 11, color: C.muted });
  text(slide, "企业车牌识别与车辆管理系统", 908, 678, 300, 18, { size: 11, color: C.muted, align: "right" });
}

async function image(slide, relativePath, left, top, width, height, alt, fit = "cover") {
  const fullPath = `${project}/${relativePath}`;
  const ext = path.extname(fullPath).toLowerCase();
  slide.images.add({
    blob: await imageBytes(fullPath),
    contentType: ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png",
    alt,
    fit,
    position: { left, top, width, height },
  });
}

function bulletList(slide, items, left, top, width, lineHeight = 48, size = 20) {
  items.forEach((item, index) => {
    shape(slide, "ellipse", left, top + index * lineHeight + 10, 8, 8, C.red);
    text(slide, item, left + 22, top + index * lineHeight, width - 22, 34, { size });
  });
}

function metric(slide, value, label, left, top, color) {
  text(slide, value, left, top, 230, 56, { size: 38, bold: true, color, align: "center" });
  text(slide, label, left, top + 60, 230, 28, { size: 17, color: C.muted, align: "center" });
}

async function main() {
  await fs.mkdir(previewDir, { recursive: true });
  const deck = Presentation.create({ slideSize: { width: W, height: H } });
  let slide;

  slide = deck.slides.add();
  slide.background.fill = C.warm;
  rule(slide, 0, 0, 18, H, C.red, H);
  text(slide, "企业车牌识别与\n车辆管理系统", 74, 118, 520, 154, { size: 54, bold: true });
  text(slide, "从车辆图片到车牌识别，再到车辆档案查询", 78, 305, 510, 38, { size: 24, color: C.muted });
  await image(slide, "deliverables/screenshots/运行截图-企业车辆管理系统-BB8986.png", 650, 78, 560, 445, "企业车辆管理系统运行界面");
  rule(slide, 650, 536, 560, C.red, 4);
  text(slide, "胡哲祺 24281098  ·  温豪杰 24281112  ·  杨大松 24281118", 78, 604, 720, 28, { size: 18 });
  text(slide, "2026.07", 1080, 604, 130, 28, { size: 18, color: C.muted, align: "right" });

  slide = deck.slides.add();
  slideHeader(slide, "三个人完成一条完整的开发链路", 2, "成员分工");
  const team = [
    ["胡哲祺", "24281098", "组长", "总体设计、进度统筹、报告统稿、训练验收、答辩组织", "40%", C.red],
    ["温豪杰", "24281112", "组员", "数据集整理、训练脚本、模型训练、实验结果分析", "30%", C.blue],
    ["杨大松", "24281118", "组员", "Flask 后端、管理系统前端、OCR、车辆档案匹配、演示材料", "30%", C.green],
  ];
  team.forEach((row, index) => {
    const y = 190 + index * 124;
    rule(slide, 72, y + 88, 1136, C.line, 1);
    text(slide, row[0], 82, y, 150, 38, { size: 27, bold: true, color: row[5] });
    text(slide, row[1], 82, y + 46, 150, 28, { size: 16, color: C.muted });
    text(slide, row[2], 260, y + 6, 80, 30, { size: 19, bold: true });
    text(slide, row[3], 382, y + 5, 630, 60, { size: 19 });
    text(slide, row[4], 1082, y + 2, 110, 42, { size: 32, bold: true, color: row[5], align: "right" });
  });
  text(slide, "贡献比  4 : 3 : 3", 72, 592, 300, 36, { size: 24, bold: true });
  text(slide, "开发周期  07/10 - 07/19", 870, 596, 338, 30, { size: 20, color: C.muted, align: "right" });
  footer(slide);

  slide = deck.slides.add();
  slideHeader(slide, "识别车牌之后，系统还要能把车找出来", 3, "项目目标");
  await image(slide, "deliverables/demo_vehicle_images/BB8986_1.jpg", 72, 190, 390, 292, "原始车辆图片");
  text(slide, "车辆图片", 72, 500, 390, 28, { size: 18, color: C.muted, align: "center" });
  rule(slide, 505, 332, 74, C.red, 3);
  text(slide, "BB8986", 610, 235, 250, 70, { size: 40, bold: true, color: C.red, align: "center" });
  text(slide, "检测 + OCR", 610, 320, 250, 30, { size: 19, color: C.muted, align: "center" });
  rule(slide, 889, 332, 74, C.red, 3);
  text(slide, "车辆档案", 985, 228, 220, 44, { size: 30, bold: true });
  bulletList(slide, ["车主与部门", "车型与用途", "通行权限", "当前状态"], 995, 300, 210, 48, 18);
  text(slide, "项目重点不只是“画出检测框”，而是让识别结果进入管理流程。", 208, 584, 864, 36, { size: 24, bold: true, align: "center" });
  footer(slide);

  slide = deck.slides.add();
  slideHeader(slide, "三套公开数据合并后，形成 25,554 张训练样本", 4, "数据处理");
  await image(slide, "deliverables/screenshots/开发阶段-数据集整理.png", 72, 180, 720, 414, "数据集整理开发截图", "contain");
  metric(slide, "22,094", "训练集", 850, 188, C.red);
  metric(slide, "2,310", "验证集", 850, 322, C.blue);
  metric(slide, "1,150", "测试集", 850, 456, C.green);
  text(slide, "Zenodo / Roboflow / Kaggle", 835, 584, 270, 28, { size: 17, color: C.muted, align: "center" });
  footer(slide);

  slide = deck.slides.add();
  slideHeader(slide, "轻量模型在普通电脑上完成 12 轮训练", 5, "模型训练");
  await image(slide, "deliverables/screenshots/开发阶段-模型训练日志.png", 72, 180, 570, 390, "模型训练日志截图", "contain");
  await image(slide, "outputs/charts/training_curve.png", 690, 205, 470, 320, "训练与验证损失曲线", "contain");
  rule(slide, 72, 604, 1136);
  text(slide, "Batch 64", 110, 620, 200, 28, { size: 20, bold: true });
  text(slide, "最佳验证损失  0.1420", 420, 620, 300, 28, { size: 20, bold: true });
  text(slide, "测试损失  0.1196", 860, 620, 270, 28, { size: 20, bold: true });
  footer(slide);

  slide = deck.slides.add();
  slideHeader(slide, "Flask 把检测、OCR 和车辆档案查询串成一个接口", 6, "系统实现");
  await image(slide, "deliverables/screenshots/开发阶段-系统架构联调.png", 72, 180, 720, 414, "系统架构联调截图", "contain");
  bulletList(slide, [
    "接收上传图片",
    "定位车辆与车牌",
    "生成结果图和裁剪图",
    "识别号码并查询档案",
    "返回 JSON 给前端",
  ], 850, 220, 320, 62, 20);
  text(slide, "/detect", 850, 555, 280, 38, { size: 26, bold: true, color: C.red });
  footer(slide);

  slide = deck.slides.add();
  slideHeader(slide, "最终页面按真实车辆管理工作台组织信息", 7, "运行界面");
  await image(slide, "deliverables/screenshots/运行截图-企业车辆管理系统-BB8986.png", 72, 175, 900, 476, "最终企业车辆管理系统运行界面", "contain");
  text(slide, "识别", 1025, 205, 150, 34, { size: 24, bold: true, color: C.red });
  text(slide, "上传图片并查看检测结果", 1025, 246, 170, 54, { size: 17, color: C.muted });
  text(slide, "找车", 1025, 350, 150, 34, { size: 24, bold: true, color: C.blue });
  text(slide, "按车牌返回车辆档案", 1025, 391, 170, 54, { size: 17, color: C.muted });
  text(slide, "核验", 1025, 495, 150, 34, { size: 24, bold: true, color: C.green });
  text(slide, "保留原图、结果图和裁剪图", 1025, 536, 170, 60, { size: 17, color: C.muted });
  footer(slide);

  slide = deck.slides.add();
  slideHeader(slide, "四组样例均能返回车牌号码和车辆图片", 8, "功能验证");
  const cases = [
    ["BB8986", "运行截图-真实识别-BB8986.png"],
    ["589222", "运行截图-真实识别-589222.png"],
    ["XCJ-S77", "运行截图-真实识别-XCJ-S77.png"],
    ["EVSROCK", "运行截图-真实识别-EVSROCK.png"],
  ];
  for (const [index, item] of cases.entries()) {
    const x = 72 + (index % 2) * 570;
    const y = 180 + Math.floor(index / 2) * 230;
    await image(slide, `deliverables/screenshots/${item[1]}`, x, y, 525, 165, `真实运行截图 ${item[0]}`, "cover");
    rule(slide, x, y + 178, 525, index % 2 === 0 ? C.red : C.blue, 3);
    text(slide, item[0], x, y + 188, 525, 30, { size: 21, bold: true });
  }
  footer(slide);

  slide = deck.slides.add();
  slideHeader(slide, "10 天开发过程对应 10 个可检查产物", 9, "开发过程");
  const days = [
    ["07/10", "定题"],
    ["07/11", "调研"],
    ["07/12", "下载"],
    ["07/13", "合并"],
    ["07/14", "脚本"],
    ["07/15", "训练"],
    ["07/16", "接口"],
    ["07/17", "前端"],
    ["07/18", "升级"],
    ["07/19", "验收"],
  ];
  rule(slide, 112, 344, 1048, C.line, 3);
  days.forEach((day, index) => {
    const x = 86 + index * 116;
    const top = index % 2 === 0 ? 210 : 390;
    const color = index < 4 ? C.blue : index < 6 ? C.red : C.green;
    shape(slide, "ellipse", x + 34, 324, 22, 22, color);
    rule(slide, x + 44, index % 2 === 0 ? 275 : 346, 2, color, index % 2 === 0 ? 49 : 46);
    text(slide, day[0], x, top, 90, 30, { size: 18, bold: true, color, align: "center" });
    text(slide, day[1], x, top + 36, 90, 28, { size: 17, align: "center" });
  });
  text(slide, "日志、沟通记录、报告和 PPT 均按这条时间线统一。", 260, 590, 760, 34, { size: 23, bold: true, align: "center" });
  footer(slide);

  slide = deck.slides.add();
  slideHeader(slide, "目前能稳定演示，但还不是生产级车牌系统", 10, "不足与改进");
  text(slide, "已经完成", 92, 188, 300, 40, { size: 28, bold: true, color: C.green });
  bulletList(slide, ["三套数据集合并", "检测模型训练与权重保存", "Flask 非静态系统", "识别后自动查询车辆档案"], 92, 250, 400, 64, 20);
  rule(slide, 536, 186, 2, C.line, 390);
  text(slide, "需要继续做", 600, 188, 300, 40, { size: 28, bold: true, color: C.red });
  bulletList(slide, ["接入 PaddleOCR / EasyOCR", "迁移到成熟 YOLO 框架", "支持实时视频流", "连接真实数据库和门禁记录"], 600, 250, 480, 64, 20);
  text(slide, "当前机器没有独立 OCR 引擎，演示数据使用文件名中的真实标注作为兜底。", 155, 605, 970, 32, { size: 20, color: C.muted, align: "center" });
  footer(slide);

  slide = deck.slides.add();
  slide.background.fill = C.ink;
  text(slide, "这不是一张“能框出车牌”的演示页", 72, 112, 870, 70, { size: 42, bold: true, color: C.white });
  text(slide, "而是一套从数据、训练、识别到车辆管理的完整课程项目。", 72, 198, 950, 70, { size: 34, bold: true, color: "#E8EAED" });
  await image(slide, "deliverables/demo_vehicle_images/contact_sheet.jpg", 755, 315, 455, 250, "车辆识别样例合集", "cover");
  text(slide, "源代码  ·  模型  ·  非静态系统  ·  静态演示页", 76, 372, 590, 34, { size: 22, color: "#BDC1C6" });
  text(slide, "报告  ·  PPT  ·  日志  ·  截图  ·  演示讲稿", 76, 422, 590, 34, { size: 22, color: "#BDC1C6" });
  rule(slide, 76, 510, 520, C.red, 4);
  text(slide, "胡哲祺 / 温豪杰 / 杨大松", 76, 548, 520, 32, { size: 22, color: C.white });
  text(slide, "谢谢", 76, 624, 200, 34, { size: 24, bold: true, color: C.white });

  for (const [index, current] of deck.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(`${previewDir}/${stem}.png`, await deck.export({ slide: current, format: "png", scale: 1 }));
    await fs.writeFile(`${previewDir}/${stem}.layout.json`, await (await current.export({ format: "layout" })).text());
  }
  await writeBlob(`${previewDir}/montage.webp`, await deck.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(finalPptx);
  await pptx.save(legacyPptx);
  console.log(finalPptx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
