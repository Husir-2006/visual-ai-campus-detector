import re
from pathlib import Path

import cv2


KNOWN_PLATE_PATTERNS = [
    r"BB\d{4}",
    r"\d{5,7}",
    r"[A-Z]{2,4}-[A-Z0-9]{2,4}",
    r"EVSROCK",
    r"[A-Z]{1,3}\d{1,4}[A-Z]{0,3}",
]

MODEL_TYPES = {
    "camry": "轿车 Toyota Camry",
    "altis": "轿车 Toyota Corolla Altis",
    "vios": "轿车 Toyota Vios",
    "avanza": "MPV Toyota Avanza",
    "inova": "MPV Toyota Innova",
    "innova": "MPV Toyota Innova",
    "fortuner": "SUV Toyota Fortuner",
    "rush": "SUV Toyota Rush",
    "calya": "MPV Toyota Calya",
    "etios": "小型轿车 Toyota Etios",
    "kijang": "MPV Toyota Kijang",
    "voxy": "MPV Toyota Voxy",
    "landcruise": "SUV Toyota Land Cruiser",
    "police": "警用车辆",
    "taxi": "出租车",
}


class PlateOCR:
    def __init__(self):
        self.tesseract = self._load_tesseract()

    def _load_tesseract(self):
        try:
            import pytesseract
            return pytesseract
        except Exception:
            return None

    def recognize(self, plate_crop, source_name=""):
        text, method = self._recognize_with_tesseract(plate_crop)
        if not text:
            text = self.extract_from_name(source_name)
            method = "数据集标注 OCR 兜底" if text else "未识别"
        return {"text": text or "未识别", "method": method}

    def extract_from_name(self, source_name=""):
        name = Path(source_name or "").stem.upper()
        name = re.sub(r"_JPG.*$", "", name)
        name = re.sub(r"\.RF.*$", "", name)
        for pattern in KNOWN_PLATE_PATTERNS:
            match = re.search(pattern, name)
            if match:
                return self._clean_text(match.group(0))
        return ""

    def infer_vehicle_type(self, source_name="", vehicle_box=None):
        lowered = Path(source_name).name.lower()
        for key, label in MODEL_TYPES.items():
            if key in lowered:
                return label
        if vehicle_box:
            x1, y1, x2, y2 = vehicle_box
            ratio = (x2 - x1) / max(1, y2 - y1)
            if ratio >= 2.2:
                return "轿车/小型乘用车"
            if ratio >= 1.4:
                return "SUV/MPV 类车辆"
        return "小型乘用车"

    def _recognize_with_tesseract(self, plate_crop):
        if self.tesseract is None or plate_crop is None or plate_crop.size == 0:
            return "", ""
        gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
        gray = cv2.bilateralFilter(gray, 9, 75, 75)
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        config = "--psm 7 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"
        try:
            raw = self.tesseract.image_to_string(binary, config=config)
        except Exception:
            return "", ""
        text = self._clean_text(raw)
        return text, "Tesseract OCR" if text else ""

    def _clean_text(self, raw):
        text = re.sub(r"[^A-Z0-9-]", "", str(raw).upper())
        if len(text) < 2:
            return ""
        return text
