# 可追加下载的数据集

把额外数据集下载成 YOLO 格式后，直接放到：

```text
datasets/extra
```

支持两种形式：

- 直接放 `.zip` 压缩包
- 解压后的文件夹，内部包含 `train/images`、`train/labels`、`valid/images`、`valid/labels`、`test/images`、`test/labels`

推荐下载：

1. Roboflow Public - License Plates Dataset
   - 页面：https://public.roboflow.com/object-detection/license-plates-us-eu
   - 规模：350 张
   - 类别：vehicle、license-plate
   - 建议下载格式：YOLOv5 或 YOLOv8

2. Kaggle - Automatic License Plate Recognition (ALPR) Dataset
   - 页面：https://www.kaggle.com/datasets/mgmitesh/automatic-license-plate-recognition-alpr-dataset
   - 建议下载后确认是否有 `train/valid/test` 和 YOLO 标签

合并数据集：

```bash
python prepare_combined_dataset.py --base datasets/anpr-model-1 --extra datasets/extra --output datasets/combined
```

重新训练：

```bash
python train_plate_model.py --data datasets/combined --epochs 40 --batch 16
```