"use client";

import { useState } from "react";
import Image from "next/image";
import { QRCodeModal } from "./QRCodeModal";

interface SocialIconsProps {
  douyinUrl?: string | null;
  xiaohongshuUrl?: string | null;
  tmallUrl?: string | null;
  jdUrl?: string | null;
}

const platforms = [
  { key: "douyin", label: "抖音", icon: "/dy.png" },
  { key: "xiaohongshu", label: "小红书", icon: "/xhs.png" },
  { key: "tmall", label: "天猫", icon: "/tmall.png" },
  { key: "jd", label: "京东", icon: "/jd.png" },
] as const;

export function SocialIcons({ douyinUrl, xiaohongshuUrl, tmallUrl, jdUrl }: SocialIconsProps) {
  const [qrModal, setQrModal] = useState<{ url: string; platform: string } | null>(null);

  const urls: Record<string, string | null | undefined> = {
    douyin: douyinUrl,
    xiaohongshu: xiaohongshuUrl,
    tmall: tmallUrl,
    jd: jdUrl,
  };

  const handleIconClick = (platform: string, url: string | null | undefined) => {
    if (url) {
      setQrModal({ url, platform });
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => {
          const url = urls[platform.key];
          return (
            <button
              key={platform.key}
              onClick={() => handleIconClick(platform.key, url)}
              disabled={!url}
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all overflow-hidden ${
                url
                  ? "hover:bg-white/10 hover:scale-110 cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
              title={platform.label}
            >
              <Image
                src={platform.icon}
                alt={platform.label}
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-cover"
              />
            </button>
          );
        })}
      </div>
      {qrModal && (
        <QRCodeModal
          url={qrModal.url}
          platform={qrModal.platform}
          isOpen={true}
          onClose={() => setQrModal(null)}
        />
      )}
    </>
  );
}

