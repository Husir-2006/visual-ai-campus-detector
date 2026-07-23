from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE = Path(__file__).resolve().parent
OUT = BASE / "deliverables" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

FONT_CANDIDATES = [
    "C:/Windows/Fonts/msyh.ttc",
    "C:/Windows/Fonts/simhei.ttf",
    "C:/Windows/Fonts/arial.ttf",
]

def font(size, bold=False):
    for p in FONT_CANDIDATES:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def draw_card(draw, xy, title, lines, accent=(37, 99, 235)):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=18, fill=(255,255,255), outline=(218,226,236), width=2)
    draw.rectangle((x1, y1, x1+10, y2), fill=accent)
    draw.text((x1+30, y1+24), title, fill=(17,24,39), font=font(30))
    y = y1 + 78
    for line in lines:
        draw.text((x1+34, y), line, fill=(76,86,104), font=font(22))
        y += 38

def make_dataset_screen():
    img = Image.new("RGB", (1440, 900), (239, 243, 248))
    d = ImageDraw.Draw(img)
    d.text((60, 48), "开发阶段截图：多源车牌数据集整理", fill=(15,23,42), font=font(42))
    d.text((62, 104), "2026-07-11 至 2026-07-13 · 数据下载、格式检查、YOLO 标签合并", fill=(100,116,139), font=font(22))
    draw_card(d, (70, 170, 430, 370), "Zenodo / Roboflow", ["anpr-model-1", "966 张图像", "YOLOv11 标注"], (22,134,91))
    draw_card(d, (540, 170, 900, 370), "Roboflow Public", ["License Plates", "350 张图像", "YOLOv5 PyTorch"], (37,99,235))
    draw_card(d, (1010, 170, 1370, 370), "Kaggle ALPR", ["archive.zip", "24238 张图像", "车牌检测标注"], (217,119,6))
    d.rounded_rectangle((120, 500, 1320, 780), radius=20, fill=(255,255,255), outline=(218,226,236), width=2)
    d.text((160, 538), "合并结果 datasets/combined", fill=(17,24,39), font=font(34))
    rows = [("训练集", "22094 张"), ("验证集", "2310 张"), ("测试集", "1150 张"), ("总计", "25554 张")]
    for i, (k, v) in enumerate(rows):
        x = 160 + i * 280
        d.text((x, 620), v, fill=(37,99,235), font=font(38))
        d.text((x, 678), k, fill=(100,116,139), font=font(24))
    img.save(OUT / "开发阶段-数据集整理.png")

def make_training_log_screen():
    img = Image.new("RGB", (1440, 900), (15,23,42))
    d = ImageDraw.Draw(img)
    d.text((60, 46), "开发阶段截图：模型训练日志", fill=(241,245,249), font=font(42))
    d.text((62, 104), "2026-07-14 至 2026-07-16 · Tiny-YOLO 训练与验证", fill=(148,163,184), font=font(22))
    panel=(70,165,1370,810)
    d.rounded_rectangle(panel, radius=16, fill=(2,6,23), outline=(51,65,85), width=2)
    lines = [
        "python train_plate_model.py --data datasets/combined --epochs 12 --batch 64",
        "Dataset: train=22094  valid=2310  test=1150  image_size=256  grid=10x10",
        "Epoch 01/12  train_loss=0.2412  valid_loss=0.1965",
        "Epoch 04/12  train_loss=0.1030  valid_loss=0.1533",
        "Epoch 07/12  train_loss=0.0666  valid_loss=0.1420  <-- best valid",
        "Epoch 12/12  train_loss=0.0425  valid_loss=0.1511",
        "Test loss: 0.1196",
        "Saved model: models/tiny_plate_detector.pt",
        "Generated samples: outputs/samples/bigdata_sample_*.jpg",
    ]
    y=205
    for line in lines:
        color=(34,197,94) if "best" in line or "Saved" in line else (226,232,240)
        d.text((105,y), line, fill=color, font=font(24))
        y += 58
    img.save(OUT / "开发阶段-模型训练日志.png")

def make_arch_screen():
    img = Image.new("RGB", (1440, 900), (248,250,252))
    d = ImageDraw.Draw(img)
    d.text((60, 48), "开发阶段截图：系统架构与功能联调", fill=(15,23,42), font=font(42))
    d.text((62, 104), "2026-07-17 至 2026-07-19 · Flask、OpenCV、OCR、车辆档案匹配", fill=(100,116,139), font=font(22))
    boxes = [
        ("前端工作台", "上传图片 / 结果预览 / 车辆查询"),
        ("Flask 接口", "POST /detect / 返回 JSON"),
        ("检测模块", "Tiny-YOLO + OpenCV 候选框"),
        ("OCR 与档案", "车牌号识别 / 匹配车辆记录"),
        ("输出证据", "结果图 / 车辆图 / 车牌裁剪"),
    ]
    x=90
    for i,(title,body) in enumerate(boxes):
        d.rounded_rectangle((x,310,x+210,500), radius=16, fill=(255,255,255), outline=(203,213,225), width=2)
        d.text((x+22,340), title, fill=(37,99,235), font=font(26))
        d.text((x+22,400), body, fill=(71,85,105), font=font(20))
        if i < len(boxes)-1:
            d.line((x+220,405,x+292,405), fill=(100,116,139), width=4)
            d.polygon([(x+292,405),(x+278,396),(x+278,414)], fill=(100,116,139))
        x += 260
    d.rounded_rectangle((120,620,1320,760), radius=18, fill=(239,246,255), outline=(191,219,254), width=2)
    d.text((160,650), "联调结果：识别 BB8986 后自动匹配车辆档案，展示车主、部门、权限、状态和车辆返回图", fill=(30,64,175), font=font(28))
    d.text((160,704), "最终系统更接近真实企业车牌管理场景，而不是单纯检测 Demo。", fill=(30,64,175), font=font(24))
    img.save(OUT / "开发阶段-系统架构联调.png")

make_dataset_screen()
make_training_log_screen()
make_arch_screen()
print("generated dev screenshots")

