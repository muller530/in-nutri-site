"use client";

import { QRCodeSVG } from "react-qr-code";
import { X } from "lucide-react";

interface QRCodeModalProps {
  url: string;
  platform: string;
  isOpen: boolean;
  onClose: () => void;
}

const platformLabels: Record<string, string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
  tmall: "天猫",
  jd: "京东",
};

export function QRCodeModal({ url, platform, isOpen, onClose }: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="关闭"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            扫描二维码访问{platformLabels[platform]}
          </h3>
          <div className="rounded-lg border-4 border-white bg-white p-4 shadow-lg">
            <QRCodeSVG 
              value={url} 
              size={200}
              level="H"
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 200 200`}
            />
          </div>
          <p className="text-sm text-gray-500">使用手机扫描二维码</p>
        </div>
      </div>
    </div>
  );
}

