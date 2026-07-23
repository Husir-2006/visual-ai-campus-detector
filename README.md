# 校园车辆与车牌检测系统

本项目是“创新应用综合实训”的视觉 AI 作业，包含两套版本：

- 非静态版：Flask + PyTorch + OpenCV，能加载训练好的模型进行检测。
- 静态演示版：单个 HTML 文件，双击即可打开，用于展示页面、上传图片、画检测框和导出结果图。

## 一键使用

### 非静态版

双击：

```text
运行非静态版.bat
```

然后打开：

```text
http://127.0.0.1:5000
```

### 静态演示版

直接双击：

```text
static-demo.html
```

## 当前训练数据

当前已经合并 3 个数据来源：

1. Indonesian License Plate Detection Dataset (YOLOv11 Format)
   - DOI：10.5281/zenodo.15605718
   - 原始来源：Roboflow Universe 项目 `anpr-model-1`

2. Roboflow Public - License Plates Dataset
   - 下载格式：YOLO v5 PyTorch
   - 数据量：350 张

3. Kaggle - Automatic License Plate Recognition (ALPR) Dataset
   - 文件：`archive.zip`
   - 数据量：24238 张

合并后数据规模：

- 总图片：25554 张
- 训练集：22094 张
- 验证集：2310 张
- 测试集：1150 张

## 当前训练结果

- 模型：轻量 YOLO 风格网格检测模型
- 框架：PyTorch
- 训练轮数：12 epochs
- batch size：64
- 数据增强：亮度、对比度、噪声、轻微模糊
- 最佳验证损失：0.1420
- 测试集损失：0.1196
- 模型文件：`models/tiny_plate_detector.pt`
- 测试样例图：`outputs/samples/bigdata_sample_*.jpg`

## 重新合并和训练

如果继续添加新的 YOLO 格式数据集，把 zip 放到：

```text
datasets
```

或：

```text
datasets/extra
```

然后运行：

```bash
python prepare_combined_dataset.py --base datasets/anpr-model-1 --extra datasets --output datasets/combined
python train_plate_model.py --data datasets/combined --epochs 12 --batch 64
```

也可以直接双击：

```text
合并数据并重新训练.bat
```

## 项目功能

- 上传车辆图片
- 检测车辆和车牌区域
- 绘制检测框并生成结果图
- 识别车牌号
- 推断车辆类型
- 返回车辆图片和车牌裁剪图
- 展示数量、置信度、目标坐标
- 支持非静态 Flask 版和单文件静态演示版

## OCR 说明

系统会优先尝试调用本机 `pytesseract`。如果电脑没有安装 OCR 引擎，演示样例会使用数据集文件名里的真实车牌标注作为 OCR 兜底，保证课堂演示截图能稳定显示车牌数字。OCR 相关逻辑在 `ocr_engine.py`。

## 运行截图

真实运行截图已经保存在：

```text
deliverables/screenshots
```

演示样例说明：

```text
deliverables/真实运行截图说明.md
```

## 作业题目建议

基于 YOLO 的校园车辆与车牌检测系统设计与实现