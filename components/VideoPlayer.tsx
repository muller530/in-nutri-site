"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  className?: string;
  productImage?: string;
  productName?: string;
  productPurchaseUrl?: string;
}

export function VideoPlayer({ src, className = "", productImage, productName, productPurchaseUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // 调试：打印产品信息
  useEffect(() => {
    if (productImage) {
      console.log("VideoPlayer - 产品图片:", productImage, "产品名称:", productName);
    }
  }, [productImage, productName]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setHasError(false);

    const handleError = () => {
      console.error("视频加载失败:", src, video.error);
      setHasError(true);
    };

    const handleLoadStart = () => {
      console.log("开始加载视频:", src);
    };

    const handleCanPlay = () => {
      console.log("视频可以播放:", src);
      // 确保视频播放
      video.play().catch((err) => {
        console.error("视频播放失败:", err);
        setHasError(true);
      });
    };

    video.addEventListener("error", handleError);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);

    // 强制加载视频
    video.load();

    return () => {
      video.removeEventListener("error", handleError);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [src]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    }
  };

  if (!src || src.trim() === "" || hasError) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-mint)]/20 to-[var(--color-primary)]/10 text-sm text-gray-500 ${className}`}>
        <div className="text-center">
          <p className="mb-2 text-2xl">🎬</p>
          <p>视频加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-0 h-full w-full">
      <video
        ref={videoRef}
        className={className}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        style={{ display: "block" }}
      >
        <source src={src} type="video/mp4" />
        您的浏览器不支持视频播放。
      </video>
      
      {/* 产品小图 - 左下角 */}
      {productImage && productImage.trim() !== "" && (
        <div className="absolute left-3 bottom-3 z-20">
          {productPurchaseUrl ? (
            <a
              href={productPurchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-white/90 px-2 py-1.5 shadow-lg backdrop-blur-sm transition hover:bg-white hover:shadow-xl"
            >
              <img
                src={productImage}
                alt={productName || "产品"}
                className="h-10 w-10 rounded object-cover"
                onError={(e) => {
                  console.error("产品图片加载失败:", productImage);
                  e.currentTarget.style.display = "none";
                }}
              />
              {productName && (
                <span className="text-xs font-medium text-gray-800">{productName}</span>
              )}
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-white/90 px-2 py-1.5 shadow-lg backdrop-blur-sm">
              <img
                src={productImage}
                alt={productName || "产品"}
                className="h-10 w-10 rounded object-cover"
                onError={(e) => {
                  console.error("产品图片加载失败:", productImage);
                  e.currentTarget.style.display = "none";
                }}
              />
              {productName && (
                <span className="text-xs font-medium text-gray-800">{productName}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 静音/取消静音按钮 - 右下角 */}
      <button
        onClick={toggleMute}
        className="absolute right-3 bottom-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm transition hover:bg-black/70"
        aria-label={isMuted ? "取消静音" : "静音"}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-white" />
        ) : (
          <Volume2 className="h-5 w-5 text-white" />
        )}
      </button>
    </div>
  );
}
