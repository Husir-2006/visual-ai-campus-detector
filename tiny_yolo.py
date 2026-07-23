import torch
from torch import nn


class TinyYolo(nn.Module):
    def __init__(self, grid_size=10, num_classes=2):
        super().__init__()
        self.grid_size = grid_size
        self.num_classes = num_classes
        self.backbone = nn.Sequential(
            self._block(3, 16),
            self._block(16, 32),
            self._block(32, 64),
            self._block(64, 128),
            self._block(128, 192),
        )
        self.head = nn.Sequential(
            nn.Conv2d(192, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((grid_size, grid_size)),
            nn.Conv2d(128, 5 + num_classes, kernel_size=1),
        )

    def _block(self, in_channels, out_channels):
        return nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )

    def forward(self, x):
        return self.head(self.backbone(x))
