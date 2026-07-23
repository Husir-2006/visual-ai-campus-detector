import argparse
import shutil
import zipfile
from pathlib import Path


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
SPLITS = {"train": "train", "valid": "valid", "val": "valid", "test": "test"}
SKIP_DIR_NAMES = {"combined", "extra"}


def ensure_dirs(root):
    for split in ("train", "valid", "test"):
        (root / split / "images").mkdir(parents=True, exist_ok=True)
        (root / split / "labels").mkdir(parents=True, exist_ok=True)


def has_yolo_split(path):
    return any((path / split / "images").exists() and (path / split / "labels").exists() for split in SPLITS)


def find_dataset_roots(base, output):
    if not base.exists():
        return []
    roots = []
    output = output.resolve()
    for path in [base, *base.rglob("*")]:
        if not path.is_dir() or path.name in SKIP_DIR_NAMES:
            continue
        resolved = path.resolve()
        if resolved == output or str(resolved).startswith(str(output) + "\\\\"):
            continue
        if has_yolo_split(path):
            roots.append(path)
    unique = []
    for root in roots:
        if not any(str(root.resolve()).startswith(str(old.resolve()) + "\\\\") for old in unique):
            unique.append(root)
    return unique


def copy_split(source_root, target_root, prefix):
    copied = 0
    for source_split, target_split in SPLITS.items():
        image_dir = source_root / source_split / "images"
        label_dir = source_root / source_split / "labels"
        if not image_dir.exists() or not label_dir.exists():
            continue
        for image_path in image_dir.iterdir():
            if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            label_path = label_dir / f"{image_path.stem}.txt"
            if not label_path.exists():
                continue
            name = f"{prefix}_{copied:06d}{image_path.suffix.lower()}"
            label_name = f"{Path(name).stem}.txt"
            shutil.copy2(image_path, target_root / target_split / "images" / name)
            shutil.copy2(label_path, target_root / target_split / "labels" / label_name)
            copied += 1
    return copied


def zip_image_records(zip_path):
    with zipfile.ZipFile(zip_path) as archive:
        names = archive.namelist()
        labels = {Path(name).stem: name for name in names if "/labels/" in name.replace("\\", "/") and name.endswith(".txt")}
        for name in names:
            normalized = name.replace("\\", "/")
            suffix = Path(normalized).suffix.lower()
            if suffix not in IMAGE_EXTENSIONS or "/images/" not in normalized:
                continue
            parts = normalized.split("/")
            split = None
            for part in parts:
                key = part.lower()
                if key in SPLITS:
                    split = SPLITS[key]
                    break
            if split is None:
                continue
            label_name = labels.get(Path(normalized).stem)
            if label_name:
                yield split, name, label_name, suffix


def copy_zip_dataset(zip_path, target_root, prefix):
    copied = 0
    with zipfile.ZipFile(zip_path) as archive:
        for split, image_name, label_name, suffix in zip_image_records(zip_path):
            out_image = target_root / split / "images" / f"{prefix}_{copied:06d}{suffix}"
            out_label = target_root / split / "labels" / f"{prefix}_{copied:06d}.txt"
            with archive.open(image_name) as src, out_image.open("wb") as dst:
                shutil.copyfileobj(src, dst)
            with archive.open(label_name) as src, out_label.open("wb") as dst:
                shutil.copyfileobj(src, dst)
            copied += 1
    return copied


def find_zips(root):
    if not root.exists():
        return []
    return sorted(root.glob("*.zip"))


def write_yaml(target_root):
    (target_root / "data.yaml").write_text(
        "train: train/images\nval: valid/images\ntest: test/images\n\nnc: 2\nnames: ['plate', 'vehicle']\n",
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="datasets/anpr-model-1")
    parser.add_argument("--extra", default="datasets")
    parser.add_argument("--output", default="datasets/combined")
    args = parser.parse_args()

    base_root = Path(args.base)
    extra_root = Path(args.extra)
    extra_subdir = extra_root / "extra"
    output = Path(args.output)

    if output.exists():
        shutil.rmtree(output)
    ensure_dirs(output)

    total = 0
    seen_roots = set()
    for index, root in enumerate([base_root] + find_dataset_roots(extra_root, output) + find_dataset_roots(extra_subdir, output), start=1):
        resolved = str(root.resolve())
        if resolved in seen_roots:
            continue
        seen_roots.add(resolved)
        copied = copy_split(root, output, f"dir{index}")
        if copied:
            print(f"{root}: {copied} images")
            total += copied

    seen_zips = set()
    for index, zip_path in enumerate(find_zips(extra_root) + find_zips(extra_subdir), start=1):
        resolved = str(zip_path.resolve())
        if resolved in seen_zips:
            continue
        seen_zips.add(resolved)
        if "anpr-model-1" in zip_path.name.lower():
            print(f"skip duplicate base zip {zip_path.name}")
            continue
        copied = copy_zip_dataset(zip_path, output, f"zip{index}")
        print(f"{zip_path}: {copied} images")
        total += copied

    write_yaml(output)
    print(f"combined dataset ready: {output} total={total}")


if __name__ == "__main__":
    main()